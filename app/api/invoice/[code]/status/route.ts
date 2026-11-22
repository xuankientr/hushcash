import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLinkedPayment } from "@/lib/payment-links";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { code }, select: { status: true } });
  if (!invoice) return NextResponse.json({ status: "NOT_FOUND" }, { status: 404 });
  const payment = await getLinkedPayment("invoice", code);
  const status = payment?.confirmedAt ? "PAID" : payment ? "CONFIRMING" : invoice.status;
  return NextResponse.json({ status });
}
