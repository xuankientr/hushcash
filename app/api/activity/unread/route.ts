import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/privy-server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ count: 0 });

  const since = req.nextUrl.searchParams.get("since");
  const sinceDate = since ? new Date(since) : new Date(Date.now() - 86_400_000);

  const count = await prisma.transfer.count({
    where: {
      receiverId: user.id,
      createdAt: { gt: sinceDate },
    },
  });

  return NextResponse.json({ count });
}