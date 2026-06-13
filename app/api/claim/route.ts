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
  if (link.status !== "UNCLAIMED") {
    return NextResponse.json({ error: "Link already claimed or cancelled" }, { status: 400 });
  }
  if (link.expiresAt && link.expiresAt < new Date()) {
    return NextResponse.json({ error: "Link has expired" }, { status: 400 });
  }

  if (!link.escrowWalletId) {
    return NextResponse.json({ error: "Escrow wallet not found" }, { status: 500 });
  }

  // Transfer from escrow to recipient
  await transferUsdc({
    sourceWalletId: link.escrowWalletId,
    destinationAddress: toAddress,
    amountUsdc: link.amountUsdc,
  });

  // Mark as claimed
  await prisma.claimableLink.update({
    where: { code },
    data: { status: "CLAIMED", claimedBy: toAddress, claimedAt: new Date() },
  });

  return NextResponse.json({ ok: true, amountUsdc: link.amountUsdc });
}
