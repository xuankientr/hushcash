import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/privy-server";
import { prisma } from "@/lib/prisma";
import { createEscrowWallet, transferUsdc } from "@/lib/circle";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { nanoid } from "nanoid";

const schema = z.object({
  amountUsdc: z.string().regex(/^\d+(\.\d{1,6})?$/),
  note: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!checkRateLimit(`drop:${user.id}`, 5, 60_000).ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { amountUsdc, note } = parsed.data;

  if (!user.walletId) return NextResponse.json({ error: "Wallet not found" }, { status: 400 });

  const code = nanoid(12);
  const escrowWallet = await createEscrowWallet(code);

  if (!escrowWallet?.address) {
    return NextResponse.json({ error: "Failed to create escrow wallet" }, { status: 500 });
  }

  await transferUsdc({ sourceWalletId: user.walletId, destinationAddress: escrowWallet.address, amountUsdc });

  const link = await prisma.claimableLink.create({
    data: { senderId: user.id, code, amountUsdc, note, escrowWalletId: escrowWallet.id },
  });

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/claim/${code}`;
  return NextResponse.json({ link, url });
}
