import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/privy-server";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({ address: user.walletAddress ?? null });
}
