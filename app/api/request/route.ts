import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/privy-server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  amountUsdc: z.string().regex(/^\d+(\.\d{1,6})?$/).optional(),
  note: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const request = await prisma.paymentRequest.create({
    data: { userId: user.id, amountUsdc: parsed.data.amountUsdc, note: parsed.data.note },
  });

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/pay/${request.code}`;
  return NextResponse.json({ request, url });
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.paymentRequest.updateMany({
    where: { id, userId: user.id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ ok: true });
}
