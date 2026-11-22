import { createHash, randomUUID } from "node:crypto";
import type { ClaimableLink } from "@prisma/client";
import { createEscrowWallet, getTransactionDetails, getWalletBalance, transferUsdc } from "@/lib/circle";
import { matchesCircleTransfer, positiveUsdc, transactionFailed, usdcUnits } from "@/lib/payment-links";
import { prisma } from "@/lib/prisma";

function escrowCreationKey(fundingKey: string) {
  const hash = createHash("sha256").update(`drop-escrow:${fundingKey}`).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export function dropStatus(link: ClaimableLink) {
  return link.status === "UNCLAIMED" && link.expiresAt && link.expiresAt <= new Date() ? "EXPIRED" : link.status;
}

export async function submitDropFunding(link: ClaimableLink) {
  if (link.status !== "FUNDING" || link.fundingId || !link.fundingKey || !link.fundingWalletId) return;
  let address = link.escrowAddress;
  if (!address) {
    const wallet = await createEscrowWallet(link.code, escrowCreationKey(link.fundingKey));
    if (!wallet?.id || !wallet.address) throw new Error("Escrow wallet unavailable");
    address = wallet.address;
    await prisma.claimableLink.updateMany({
      where: { id: link.id, status: "FUNDING", fundingKey: link.fundingKey },
      data: { escrowWalletId: wallet.id, escrowAddress: address },
    });
  }

  const funding = await transferUsdc({
    sourceWalletId: link.fundingWalletId, destinationAddress: address,
    amountUsdc: link.amountUsdc, idempotencyKey: link.fundingKey,
  });
  if (!funding?.id) throw new Error("Funding response unavailable");
  await prisma.claimableLink.updateMany({
    where: { id: link.id, status: "FUNDING", fundingKey: link.fundingKey },
    data: { fundingId: funding.id },
  });
}

export async function reconcileDrop(link: ClaimableLink): Promise<ClaimableLink> {
  const funding = link.status === "FUNDING";
  const claiming = link.status === "CLAIMING";
  const refunding = link.status === "REFUNDING";
  const transactionId = funding ? link.fundingId : claiming || refunding ? link.payoutId : null;
  if (!transactionId) return link;
  try {
    const details = await getTransactionDetails(transactionId);
    const { state } = details;
    const complete = state === "COMPLETE" && matchesCircleTransfer(
      details,
      funding ? link.fundingWalletId : link.escrowWalletId,
      funding ? link.escrowAddress : link.payoutAddress,
      link.amountUsdc,
    );
    if (!complete && !transactionFailed(state)) return link;
    await prisma.claimableLink.updateMany({
      where: { id: link.id, status: link.status, ...(funding ? { fundingId: transactionId } : { payoutId: transactionId }) },
      data: funding
        ? { status: complete ? "UNCLAIMED" : "FUNDING_FAILED" }
        : complete
          ? { status: claiming ? "CLAIMED" : "REFUNDED", ...(claiming ? { claimedBy: link.payoutAddress, claimedAt: new Date() } : {}) }
          : { status: "UNCLAIMED", payoutId: null, payoutKey: null, payoutAddress: null },
    });
    return await prisma.claimableLink.findUniqueOrThrow({ where: { id: link.id } });
  } catch {
    return link;
  }
}

export async function startDropPayout(link: ClaimableLink, kind: "CLAIMING" | "REFUNDING", address: string) {
  if (!link.escrowWalletId) return false;
  if (link.status === "UNCLAIMED" || (kind === "REFUNDING" && link.status === "EXPIRED")) {
    if (!link.fundingKey) {
      // Old links have no funding transaction ID. Verify the original escrow received its principal.
      const balance = await getWalletBalance(link.escrowWalletId);
      if (!positiveUsdc(balance) || usdcUnits(balance) < usdcUnits(link.amountUsdc)) return false;
    }

    const now = new Date();
    const expiry = kind === "CLAIMING"
      ? { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }
      : { OR: [{ expiresAt: null }, { expiresAt: { lte: now } }] };
    await prisma.claimableLink.updateMany({
      where: { id: link.id, status: link.status, ...expiry },
      data: { status: kind, payoutAddress: address, payoutKey: randomUUID(), payoutId: null },
    });
    link = await prisma.claimableLink.findUniqueOrThrow({ where: { id: link.id } });
  }
  if (link.status !== kind || link.payoutAddress?.toLowerCase() !== address.toLowerCase() || !link.payoutKey || !link.escrowWalletId) return false;
  if (!link.payoutId) {
    const payout = await transferUsdc({
      sourceWalletId: link.escrowWalletId, destinationAddress: link.payoutAddress,
      amountUsdc: link.amountUsdc, idempotencyKey: link.payoutKey,
    });
    if (!payout?.id) throw new Error("Payout response unavailable");
    await prisma.claimableLink.updateMany({
      where: { id: link.id, status: kind, payoutKey: link.payoutKey },
      data: { payoutId: payout.id },
    });
  }
  return true;
}
