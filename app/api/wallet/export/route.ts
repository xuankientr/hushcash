import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/privy-server";

export async function POST() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!user.walletId) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

  return NextResponse.json(
    { error: "Key export requires Circle user-controlled wallet setup" },
    { status: 501 }
  );
}
