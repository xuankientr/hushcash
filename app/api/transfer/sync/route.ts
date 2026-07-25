import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/privy-server";
import { prisma } from "@/lib/prisma";
import { getTransactionDetails } from "@/lib/circle";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch all PENDING transfers with a Circle id
  const pending = await prisma.transfer.findMany({
    where: {
      OR: [{ senderId: user.id }, { receiverId: user.id }],
      status: "PENDING",
      circleTransferId: { not: null },
    },
    select: { id: true, circleTransferId: true, senderId: true },
  });

  if (pending.length === 0) {
    // Nothing to sync — return current activity list
    const transfers = await prisma.transfer.findMany({
      where: { OR: [{ senderId: user.id }, { receiverId: user.id }] },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, createdAt: true, amountUsdc: true, note: true, toAddress: true, status: true, senderId: true, txHash: true },
    });
    return NextResponse.json({ transfers: transfers.map(t => ({ ...t, status: t.status.toString(), direction: t.senderId === user.id ? "sent" : "received" })) });
  }

  // Check Circle for each pending transfer
  await Promise.all(
    pending.map(async (t) => {
      try {
        const details = await getTransactionDetails(t.circleTransferId!);
        if (details.state === "COMPLETE" || details.txHash) {
          await prisma.transfer.update({
            where: { id: t.id },
            data: {
              txHash: details.txHash ?? undefined,
              status: details.state === "COMPLETE" ? "COMPLETE" : "PENDING",
            },
          });
        } else if (details.state === "FAILED") {
          await prisma.transfer.update({ where: { id: t.id }, data: { status: "FAILED" } });
        }
      } catch { /* skip failed Circle calls */ }
    })
  );

  // Return refreshed list
  const transfers = await prisma.transfer.findMany({
    where: { OR: [{ senderId: user.id }, { receiverId: user.id }] },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, createdAt: true, amountUsdc: true, note: true, toAddress: true, status: true, senderId: true, txHash: true },
  });

  return NextResponse.json({
    transfers: transfers.map((t) => ({
      ...t,
      status: t.status.toString(),
      direction: t.senderId === user.id ? "sent" : "received",
    })),
  });
}