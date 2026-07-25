import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/privy-server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contacts = await prisma.contact.findMany({
    where: { userId: user.id },
    orderBy: { label: "asc" },
    select: { id: true, label: true, handle: true, address: true, createdAt: true },
  });

  return NextResponse.json({ contacts });
}

const createSchema = z.object({
  label: z.string().min(1).max(50),
  handle: z.string().max(30).optional().nullable(),
  address: z.string().max(42).optional().nullable(),
}).refine((d) => d.handle || d.address, { message: "handle or address required" });

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { label, handle, address } = parsed.data;

  const contact = await prisma.contact.create({
    data: { userId: user.id, label, handle: handle ?? null, address: address ?? null },
  });

  return NextResponse.json({ contact }, { status: 201 });
}