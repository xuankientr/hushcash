import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/privy-server";
import { prisma } from "@/lib/prisma";
import { isValidUsername } from "@/lib/utils";
import { z } from "zod";

// GET /api/user/username?check=xxx — check availability
export async function GET(req: NextRequest) {
  const check = req.nextUrl.searchParams.get("check");
  if (!check) return NextResponse.json({ error: "Missing check param" }, { status: 400 });

  if (!isValidUsername(check)) {
    return NextResponse.json({ available: false, reason: "invalid" });
  }

  const existing = await prisma.user.findUnique({
    where: { username: check.toLowerCase() },
    select: { id: true },
  });

  return NextResponse.json({ available: !existing });
}

const schema = z.object({
  username: z.string().min(3).max(20),
});

// PATCH /api/user/username — set or update username
export async function PATCH(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const username = parsed.data.username.toLowerCase();

  if (!isValidUsername(username)) {
    return NextResponse.json({ error: "Invalid username format" }, { status: 400 });
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { username },
    });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }
    throw e;
  }

  return NextResponse.json({ ok: true, username });
}