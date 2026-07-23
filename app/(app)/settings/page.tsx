import { getOrCreateAuthUser } from "@/lib/privy-server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsClient } from "@/components/SettingsClient";
import { getTransactionDetails } from "@/lib/circle";

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
        select: { id: true, createdAt: true, amountUsdc: true, note: true, toAddress: true, status: true, senderId: true, txHash: true, circleTransferId: true },
      }),
    ]);

  const sum = (rows: { amountUsdc: string | null }[]) =>
    rows.reduce((acc, r) => acc + parseFloat(r.amountUsdc ?? "0"), 0).toFixed(2);

  // Enrich pending transfers with txHash from Circle
  const enriched = await Promise.all(recentActivity.map(async (t) => {
    let txHash = t.txHash;
    if (!txHash && t.circleTransferId) {
      try {
        const details = await getTransactionDetails(t.circleTransferId);
        if (details.txHash) {
          txHash = details.txHash;
          await prisma.transfer.update({ where: { id: t.id }, data: { txHash, status: details.state === "COMPLETE" ? "COMPLETE" : t.status } });
        }
      } catch { /* non-blocking */ }
    }
    return { ...t, txHash, status: t.status.toString(), direction: t.senderId === user.id ? "sent" as const : "received" as const };
  }));

  return (
    <SettingsClient
      walletAddress={user.walletAddress}
      displayName={user.username}
      totalSent={sum(sentTransfers)}
      totalReceived={sum(receivedTransfers)}
      totalRequested={sum(paymentRequests)}
      totalClaimed={sum(claimableLinks)}
      transfers={enriched}
    />
  );
}