import { NextRequest, NextResponse } from "next/server";
import { getOrCreateAuthUser } from "@/lib/privy-server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  amountUsdc: z.string().regex(/^\d+(\.\d{1,6})?$/),
  proofNote: z.string().max(1000).optional(),
  proofImageUrl: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const user = await getOrCreateAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { title, description, amountUsdc, proofNote, proofImageUrl } = parsed.data;

  const invoice = await prisma.invoice.create({
    data: {
      creatorId: user.id,
      title,
      description: description || null,
      amountUsdc,
      proofNote: proofNote || null,
      proofImageUrl: proofImageUrl || null,
    },
  });

  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/invoice/${invoice.code}`;
  return NextResponse.json({ code: invoice.code, url });
}