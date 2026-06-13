import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transferUsdc } from "@/lib/circle";
import { isValidAddress } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1),
  toAddress: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { code, toAddress } = parsed.data;

  if (!isValidAddress(toAddress)) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  const link = await prisma.claimableLink.findUnique({ where: { code } });

  if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });
  if (link.expiresAt && link.expiresAt < new Date()) {
    return NextResponse.json({ error: "Link has expired" }, { status: 400 });
  }
  if (!link.escrowWalletId) {
    return NextResponse.json({ error: "Escrow wallet not found" }, { status: 500 });
  }

  // Atomically mark as CLAIMED before transferring — prevents race condition double-spend
  const claimed = await prisma.claimableLink.updateMany({
    where: { code, status: "UNCLAIMED" },
    data: { status: "CLAIMED", claimedBy: toAddress, claimedAt: new Date() },
  });

  if (claimed.count === 0) {
    return NextResponse.json({ error: "Link already claimed or cancelled" }, { status: 400 });
  }

  // Transfer from escrow to recipient (after atomic claim)
  try {
    await transferUsdc({
      sourceWalletId: link.escrowWalletId,
      destinationAddress: toAddress,
      amountUsdc: link.amountUsdc,
    });
  } catch (e: unknown) {
    // Revert claim status so user can retry
    await prisma.claimableLink.update({
      where: { code },
      data: { status: "UNCLAIMED", claimedBy: null, claimedAt: null },
    });
    const msg = (e as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ?? (e as Error)?.message ?? "Transfer failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ ok: true, amountUsdc: link.amountUsdc });
}
