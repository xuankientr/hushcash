import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/privy-server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import { positiveUsdc } from "@/lib/payment-links";
import { z } from "zod";

const schema = z.object({
  amountUsdc: z.string().refine(positiveUsdc).optional(),
  note: z.string().max(200).optional(),
  shares: z.array(z.object({ amountUsdc: z.string().refine(positiveUsdc), participant: z.string().trim().min(1).max(80) })).min(2).max(20).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { amountUsdc, note, shares } = parsed.data;
  if (shares) {
    const splitGroup = randomUUID();
    const requests = await prisma.$transaction(shares.map((share) => prisma.paymentRequest.create({
      data: { ...share, userId: user.id, note, splitGroup },
    })));
    return NextResponse.json({ requests: requests.map((request) => ({
      participant: request.participant, url: new URL(`/pay/${request.code}`, req.url).href,
    })) });
  }

  const request = await prisma.paymentRequest.create({ data: { userId: user.id, amountUsdc, note } });
  return NextResponse.json({ request, url: new URL(`/pay/${request.code}`, req.url).href });
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const cancelled = await prisma.$transaction(async (tx) => {
    const locked = await tx.paymentRequest.updateMany({
      where: { id, userId: user.id, status: "ACTIVE" }, data: { status: "ACTIVE" },
    });
    if (!locked.count) return false;
    const request = await tx.paymentRequest.findUniqueOrThrow({ where: { id } });
    const payment = await tx.transfer.findUnique({ where: { paymentKey: `request:${request.code}` } });
    if (payment) return false;
    await tx.paymentRequest.update({ where: { id }, data: { status: "CANCELLED" } });
    return true;
  });
  return NextResponse.json({ ok: cancelled }, { status: cancelled ? 200 : 409 });
}
