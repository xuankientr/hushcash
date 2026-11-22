import { randomUUID } from "node:crypto";
import { Prisma, type Transfer } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getTransactionDetails, transferUsdc } from "@/lib/circle";

export type PaymentKind = "invoice" | "request";

export function paymentKey(kind: PaymentKind, code: string) {
  return `${kind}:${code}`;
}

export function positiveUsdc(value: string) {
  return /^\d{1,18}(\.\d{1,6})?$/.test(value) && /[1-9]/.test(value);
}

export function usdcUnits(value: string) {
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * BigInt(1_000_000) + BigInt(fraction.padEnd(6, "0"));
}

export function transactionFailed(state: string | null) {
  return state === "FAILED" || state === "DENIED" || state === "CANCELLED";
}

export function matchesCircleTransfer(
  details: Awaited<ReturnType<typeof getTransactionDetails>>,
  walletId: string | null,
  destination: string | null,
  amount: string,
) {
  const reported = details.amount?.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  return details.arcUsdc && !!walletId && details.walletId === walletId && !!destination &&
    details.destination?.toLowerCase() === destination.toLowerCase() && !!reported &&
    positiveUsdc(reported) && usdcUnits(reported) === usdcUnits(amount);
}

async function submitPayment(transfer: Transfer) {
  if (transfer.circleTransferId || !transfer.sourceWalletId || !transfer.toAddress) return transfer;
  const submission = await transferUsdc({
    sourceWalletId: transfer.sourceWalletId,
    destinationAddress: transfer.toAddress,
    amountUsdc: transfer.amountUsdc,
    idempotencyKey: transfer.id,
  });
  if (!submission?.id) throw new Error("Missing Circle transaction ID");
  return prisma.transfer.update({
    where: { id: transfer.id },
    data: { circleTransferId: submission.id },
  });
}

export async function reconcilePayment(transfer: Transfer) {
  if (!transfer.paymentKey || transfer.status === "FAILED") return transfer;

  // Activity sync can set COMPLETE first. Confirm the linked receipt independently.
  if (transfer.confirmedAt) return transfer;
  const key = transfer.paymentKey;
  try {
    if (!transfer.circleTransferId) return transfer;
    const result = await getTransactionDetails(transfer.circleTransferId);
    if (transactionFailed(result.state)) {
      await prisma.transfer.updateMany({
        where: { id: transfer.id, paymentKey: key, confirmedAt: null },
        data: { status: "FAILED", paymentKey: null },
      });
      return null;
    }
    if (result.state !== "COMPLETE" || !result.txHash || !/^0x[0-9a-f]{64}$/i.test(result.txHash)) return transfer;

    if (!matchesCircleTransfer(result, transfer.sourceWalletId, transfer.toAddress, transfer.amountUsdc)) return transfer;
    const reportedTime = result.confirmedAt ? new Date(result.confirmedAt) : null;
    const confirmedAt = reportedTime && !Number.isNaN(reportedTime.getTime()) ? reportedTime : new Date();
    const data = { status: "COMPLETE" as const, txHash: result.txHash, confirmedAt };
    return await prisma.$transaction(async (tx) => {
      const updated = await tx.transfer.updateMany({ where: { id: transfer.id, paymentKey: key, confirmedAt: null }, data });
      if (updated.count) {
        const [kind, code] = key.split(":");
        if (kind === "invoice") {
          await tx.invoice.updateMany({ where: { code, status: "PENDING" }, data: { status: "PAID", paidAt: confirmedAt } });
        } else {
          await tx.paymentRequest.updateMany({ where: { code, status: "ACTIVE" }, data: { status: "PAID" } });
        }
      }
      return tx.transfer.findUniqueOrThrow({ where: { id: transfer.id } });
    });
  } catch {
    return transfer;
  }
}

class PaymentError extends Error {}

export async function startLinkedPayment(input: {
  kind: PaymentKind; code: string; payerId: string; payerWalletId: string; amountUsdc: string;
}) {
  const { kind, code, payerId, payerWalletId, amountUsdc } = input;
  const key = paymentKey(kind, code);
  let transfer: Transfer;
  try {
    transfer = await prisma.$transaction(async (tx) => {
      const current = await tx.transfer.findUnique({ where: { paymentKey: key } });
      if (current) return current;

      const invoice = kind === "invoice" ? await tx.invoice.findUnique({ where: { code }, include: { creator: true } }) : null;
      const request = kind === "request" ? await tx.paymentRequest.findUnique({ where: { code }, include: { user: true } }) : null;
      const recipient = invoice?.creator ?? request?.user;
      if (!recipient?.walletAddress || recipient.id === payerId ||
          (invoice ? invoice.status !== "PENDING" : request?.status !== "ACTIVE") ||
          (request?.expiresAt && request.expiresAt <= new Date())) {
        throw new PaymentError("This payment link is unavailable");
      }

      const expected = invoice?.amountUsdc ?? request?.amountUsdc;
      if (!positiveUsdc(amountUsdc) ||
          (expected && (!positiveUsdc(expected) || usdcUnits(expected) !== usdcUnits(amountUsdc)))) {
        throw new PaymentError("The amount does not match this payment link");
      }
      // Lock the request row until the payment intent is saved. Cancellation takes the same lock.
      if (request) await tx.paymentRequest.update({ where: { id: request.id, status: "ACTIVE" }, data: { status: "ACTIVE" } });
      return tx.transfer.create({ data: {
        id: randomUUID(), paymentKey: key, sourceWalletId: payerWalletId, senderId: payerId,
        receiverId: recipient.id, toAddress: recipient.walletAddress, amountUsdc: expected ?? amountUsdc,
      } });
    });
  } catch (error) {
    if (error instanceof PaymentError) return { error: error.message, status: 400 } as const;
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || !["P2002", "P2025"].includes(error.code)) throw error;
    const existing = await prisma.transfer.findUnique({ where: { paymentKey: key } });
    if (!existing) return { error: "This payment link is unavailable", status: 409 } as const;
    transfer = existing;
  }

  if (transfer.senderId !== payerId) return { error: "A payment is already in progress or confirmed", status: 409 } as const;
  try {
    transfer = await submitPayment(transfer);
  } catch {
    return { error: "Submission could not be verified. Retry the same payment to check it.", status: 503 } as const;
  }
  return { transfer: { id: transfer.id, amountUsdc: transfer.amountUsdc, status: transfer.status } };
}

export async function getLinkedPayment(kind: PaymentKind, code: string) {
  const transfer = await prisma.transfer.findUnique({ where: { paymentKey: paymentKey(kind, code) } });
  return transfer ? reconcilePayment(transfer) : null;
}
