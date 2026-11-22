import { NextRequest, NextResponse } from "next/server";
import { getOrCreateAuthUser } from "@/lib/privy-server";
import { prisma } from "@/lib/prisma";
import { transferUsdc } from "@/lib/circle";
import { isValidAddress, isHandle, normalizeHandle } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rate-limit";
import { uploadToShelby } from "@/lib/shelby";
import { positiveUsdc, startLinkedPayment } from "@/lib/payment-links";
import { z } from "zod";

const schema = z.object({
  to: z.string().min(1),
  amountUsdc: z.string().refine(positiveUsdc),
  note: z.string().max(200).optional(),
  requestCode: z.string().min(1).max(100).optional(),
  invoiceCode: z.string().min(1).max(100).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getOrCreateAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.walletId) return NextResponse.json({ error: "Wallet not ready yet — open the app first to finish setup" }, { status: 400 });

  if (!checkRateLimit(`transfer:${user.id}`, 10, 60_000).ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { to, amountUsdc, note, requestCode, invoiceCode } = parsed.data;
  const code = invoiceCode ?? requestCode;
  if (code) {
    if (invoiceCode && requestCode) return NextResponse.json({ error: "Specify one payment link" }, { status: 400 });
    const result = await startLinkedPayment({
      kind: invoiceCode ? "invoice" : "request", code, amountUsdc, payerId: user.id, payerWalletId: user.walletId,
    });
    return "error" in result
      ? NextResponse.json({ error: result.error }, { status: result.status })
      : NextResponse.json(result);
  }

  let destinationAddress: string;
  let receiverId: string | undefined;

  if (isValidAddress(to)) {
    destinationAddress = to;
    // Look up if this address belongs to a HushCash user
    const addrUser = await prisma.user.findUnique({
      where: { walletAddress: to },
      select: { id: true },
    });
    if (addrUser) receiverId = addrUser.id;
  } else if (isHandle(to)) {
    const handle = normalizeHandle(to);
    const recipient = await prisma.user.findUnique({
      where: { username: handle },
      select: { id: true, walletAddress: true },
    });
    if (!recipient?.walletAddress) {
      return NextResponse.json({ error: "User not found or has no wallet" }, { status: 404 });
    }
    destinationAddress = recipient.walletAddress;
    receiverId = recipient.id;
  } else {
    return NextResponse.json({ error: "Invalid address or handle" }, { status: 400 });
  }

  let circleTransfer;
  try {
    circleTransfer = await transferUsdc({ sourceWalletId: user.walletId, destinationAddress, amountUsdc });
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ?? (e as Error)?.message ?? "Transfer failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const transfer = await prisma.transfer.create({ data: {
    senderId: user.id, receiverId, toAddress: destinationAddress, amountUsdc, note,
    status: "PENDING", circleTransferId: circleTransfer?.id,
  } });

  // Fire-and-forget: upload immutable receipt to Shelby
  void uploadToShelby(`hushcash/receipts/transfer-${transfer.id}.json`, {
    type: "payment_receipt",
    id: transfer.id,
    from: user.walletAddress,
    to: destinationAddress,
    amountUsdc,
    note: note ?? null,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    circleTransferId: circleTransfer?.id ?? null,
    network: "arc-testnet",
  }).then(async (url) => {
    if (url) {
      await prisma.transfer.update({ where: { id: transfer.id }, data: { shelbyReceiptUrl: url } });
    }
  });

  return NextResponse.json({ transfer: { id: transfer.id, amountUsdc: transfer.amountUsdc, status: transfer.status } });
}
