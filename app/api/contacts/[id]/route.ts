import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/privy-server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const contact = await prisma.contact.findUnique({ where: { id }, select: { userId: true } });
  if (!contact || contact.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.contact.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}