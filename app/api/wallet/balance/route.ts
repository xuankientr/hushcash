import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/privy-server";
import { getWalletBalance } from "@/lib/circle";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!user.walletId) return NextResponse.json({ balance: "0" });

  const balance = await getWalletBalance(user.walletId);
  return NextResponse.json({ balance });
}
