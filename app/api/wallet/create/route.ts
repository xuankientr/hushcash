import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/privy-server";
import { createWalletForUser } from "@/lib/circle";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.walletId) {
    return NextResponse.json({ walletId: user.walletId, walletAddress: user.walletAddress });
  }

  const wallet = await createWalletForUser(user.id);
  if (!wallet?.id) return NextResponse.json({ error: "Circle did not return a wallet" }, { status: 500 });

  await prisma.user.update({
    where: { id: user.id },
    data: { walletId: wallet.id, walletAddress: wallet.address },
  });

  return NextResponse.json({ walletId: wallet.id, walletAddress: wallet.address });
}