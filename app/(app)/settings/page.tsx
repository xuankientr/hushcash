import { getOrCreateAuthUser } from "@/lib/privy-server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsClient } from "@/components/SettingsClient";

export default async function SettingsPage() {
  const user = await getOrCreateAuthUser();
  if (!user) redirect("/login");

  const [sentTransfers, receivedTransfers, paymentRequests, claimableLinks, recentActivity] =
    await Promise.all([
      prisma.transfer.findMany({ where: { senderId: user.id }, select: { amountUsdc: true } }),
      prisma.transfer.findMany({ where: { receiverId: user.id }, select: { amountUsdc: true } }),
      prisma.paymentRequest.findMany({ where: { userId: user.id, status: "PAID" }, select: { amountUsdc: true } }),
      prisma.claimableLink.findMany({ where: { senderId: user.id, status: "CLAIMED" }, select: { amountUsdc: true } }),
      prisma.transfer.findMany({
        where: { OR: [{ senderId: user.id }, { receiverId: user.id }] },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true, createdAt: true, amountUsdc: true, note: true,
          toAddress: true, status: true, senderId: true, txHash: true,
        },
      }),
    ]);

  const sum = (rows: { amountUsdc: string | null }[]) =>
    rows.reduce((acc, r) => acc + parseFloat(r.amountUsdc ?? "0"), 0).toFixed(2);

  const transfers = recentActivity.map((t) => ({
    ...t,
    status: t.status.toString(),
    direction: t.senderId === user.id ? "sent" as const : "received" as const,
  }));

  return (
    <SettingsClient
      walletAddress={user.walletAddress}
      displayName={user.username}
      totalSent={sum(sentTransfers)}
      totalReceived={sum(receivedTransfers)}
      totalRequested={sum(paymentRequests)}
      totalClaimed={sum(claimableLinks)}
      transfers={transfers}
    />
  );
}