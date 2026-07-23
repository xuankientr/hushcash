import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/privy-server";
import { prisma } from "@/lib/prisma";
import { transferUsdc } from "@/lib/circle";
import { isValidAddress, isTwitterHandle, normalizeHandle } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  to: z.string().min(1),
  amountUsdc: z.string().regex(/^\d+(\.\d{1,6})?$/),
  note: z.string().max(200).optional(),
  requestCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!checkRateLimit(`transfer:${user.id}`, 10, 60_000).ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { to, amountUsdc, note, requestCode } = parsed.data;

  if (!user.walletId) return NextResponse.json({ error: "Wallet not found" }, { status: 400 });

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
  } else if (isTwitterHandle(to)) {
    const handle = normalizeHandle(to);
    const recipient = await prisma.user.findUnique({
      where: { twitterHandle: handle },
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

  const [transfer] = await prisma.$transaction([
    prisma.transfer.create({
      data: {
        senderId: user.id, receiverId, toAddress: destinationAddress,
        amountUsdc, note, status: "PENDING", circleTransferId: circleTransfer?.id,
      },
    }),
    ...(requestCode ? [prisma.paymentRequest.updateMany({
      where: { code: requestCode, status: "ACTIVE" },
      data: { status: "PAID" },
    })] : []),
  ]);

  return NextResponse.json({ transfer: { id: transfer.id, amountUsdc: transfer.amountUsdc, status: transfer.status } });
}
