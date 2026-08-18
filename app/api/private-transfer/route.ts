import { NextRequest, NextResponse } from "next/server";
import { getOrCreateAuthUser } from "@/lib/privy-server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateMnemonic, getUnlinkAddress, privateTransfer } from "@/lib/unlink";
import { uploadToShelby } from "@/lib/shelby";
import { isHandle, normalizeHandle } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  to: z.string().min(1),        // @username of recipient (must be HushCash user)
  amountUsdc: z.string().regex(/^\d+(\.\d{1,6})?$/),
  note: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getOrCreateAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!checkRateLimit(`ptransfer:${user.id}`, 5, 60_000).ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { to, amountUsdc, note } = parsed.data;

  // Resolve recipient — must be a HushCash user with Unlink account
  if (!isHandle(to)) {
    return NextResponse.json(
      { error: "Private transfers require a @username recipient" },
      { status: 400 }
    );
  }

  const handle = normalizeHandle(to);
  const recipient = await prisma.user.findUnique({
    where: { username: handle },
    select: { id: true, unlinkAddress: true },
  });

  if (!recipient) {
    return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
  }

  if (!recipient.unlinkAddress) {
    return NextResponse.json(
      { error: "Recipient hasn't enabled private transfers yet" },
      { status: 400 }
    );
  }

  // Ensure sender has a Unlink account — create if needed
  let senderMnemonic = user.unlinkMnemonic;
  if (!senderMnemonic) {
    senderMnemonic = generateMnemonic();
    const unlinkAddress = await getUnlinkAddress(senderMnemonic);
    await prisma.user.update({
      where: { id: user.id },
      data: { unlinkMnemonic: senderMnemonic, unlinkAddress },
    });
  }

  // Execute private ZK transfer
  let txId: string;
  try {
    const result = await privateTransfer({
      senderMnemonic,
      recipientUnlinkAddress: recipient.unlinkAddress,
      amountUsdc,
    });
    txId = result.txId;
  } catch (e: unknown) {
    const msg = (e as Error)?.message ?? "Private transfer failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Record in DB
  const transfer = await prisma.transfer.create({
    data: {
      senderId: user.id,
      receiverId: recipient.id,
      amountUsdc,
      note,
      status: "PENDING",
      isPrivate: true,
      unlinkTxId: txId,
    },
  });

  // Fire-and-forget Shelby receipt
  void uploadToShelby(`hushcash/receipts/private-${transfer.id}.json`, {
    type: "private_payment_receipt",
    id: transfer.id,
    amountUsdc,
    note: note ?? null,
    status: "PENDING",
    isPrivate: true,
    unlinkTxId: txId,
    createdAt: new Date().toISOString(),
    network: "arc-testnet",
  }).then(async (url) => {
    if (url) await prisma.transfer.update({ where: { id: transfer.id }, data: { shelbyReceiptUrl: url } });
  });

  return NextResponse.json({ transfer: { id: transfer.id, amountUsdc, isPrivate: true } });
}
