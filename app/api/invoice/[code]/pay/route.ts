import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToShelby } from "@/lib/shelby";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const invoice = await prisma.invoice.findUnique({ where: { code } });
  if (!invoice || invoice.status !== "PENDING") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const paidAt = new Date();
  await prisma.invoice.updateMany({
    where: { code, status: "PENDING" },
    data: { status: "PAID", paidAt },
  });

  // Fire-and-forget: upload immutable certificate to Shelby
  void uploadToShelby(`hushcash/invoices/${code}.json`, {
    type: "invoice_certificate",
    code,
    title: invoice.title,
    description: invoice.description ?? null,
    amountUsdc: invoice.amountUsdc,
    status: "PAID",
    paidAt: paidAt.toISOString(),
    issuedAt: invoice.createdAt.toISOString(),
    network: "arc-testnet",
  }).then(async (url) => {
    if (url) {
      await prisma.invoice.updateMany({ where: { code }, data: { shelbyReceiptUrl: url } });
    }
  });

  return NextResponse.json({ ok: true });
}
