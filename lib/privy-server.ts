import { PrivyClient } from "@privy-io/server-auth";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { createWalletForUser } from "./circle";

export const privyClient = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!,
);

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("privy-token")?.value;
  if (!token) return null;
  let claims;
  try {
    claims = await privyClient.verifyAuthToken(token);
  } catch {
    return null;
  }
  return prisma.user.findUnique({ where: { privyDid: claims.userId } });
}

export async function getOrCreateAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("privy-token")?.value;
  if (!token) return null;

  let claims;
  try {
    claims = await privyClient.verifyAuthToken(token);
  } catch {
    return null;
  }

  // Existing user fast path
  const existing = await prisma.user.findUnique({ where: { privyDid: claims.userId } });
  if (existing) {
    if (!existing.walletId) {
      createWalletForUser(existing.id)
        .then((wallet) => {
          if (wallet?.id) {
            return prisma.user.update({
              where: { id: existing.id },
              data: { walletId: wallet.id, walletAddress: wallet.address },
            });
          }
        })
        .catch(console.error);
    }
    return existing;
  }

  // First login — fetch Privy user details
  const privyUser = await privyClient.getUser(claims.userId);
  const twitter = privyUser.linkedAccounts.find((a) => a.type === "twitter_oauth") as
    | { subject?: string; username?: string; name?: string; profilePictureUrl?: string }
    | undefined;

  let user;
  try {
    user = await prisma.user.create({
      data: {
        privyDid: claims.userId,
        twitterId: twitter?.subject ?? null,
        twitterHandle: twitter?.username ?? null,
        twitterName: twitter?.name ?? null,
        twitterAvatar: twitter?.profilePictureUrl ?? null,
      },
    });
  } catch (e: unknown) {
    // Concurrent requests both tried to create — return the one that won
    if ((e as { code?: string }).code === "P2002") {
      return prisma.user.findUnique({ where: { privyDid: claims.userId } });
    }
    throw e;
  }

  // Create Circle wallet in background (non-blocking)
  createWalletForUser(user.id)
    .then((wallet) => {
      if (wallet?.id) {
        return prisma.user.update({
          where: { id: user.id },
          data: { walletId: wallet.id, walletAddress: wallet.address },
        });
      }
    })
    .catch(console.error);

  return user;
}
