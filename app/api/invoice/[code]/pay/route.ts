import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  await prisma.invoice.updateMany({
    where: { code, status: "PENDING" },
    data: { status: "PAID", paidAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}