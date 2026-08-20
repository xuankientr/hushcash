import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { code }, select: { status: true } });
  if (!invoice) return NextResponse.json({ status: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ status: invoice.status });
}
