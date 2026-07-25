import { cache } from "react";
import { PrivyClient } from "@privy-io/server-auth";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { prisma } from "./prisma";
import { createWalletForUser } from "./circle";

export const privyClient = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!,
);

async function resolveToken(req?: NextRequest) {
  if (req) {
    const auth = req.headers.get("authorization");
    if (auth?.startsWith("Bearer ")) return auth.slice(7);
  }
  const cookieStore = await cookies();
  return cookieStore.get("privy-token")?.value;
}

// cache() deduplicates within a single request — layout + page both calling
// this only pays one Privy verify + one DB query total.
export const getAuthUser = cache(async (req?: NextRequest) => {
  const token = await resolveToken(req);
  if (!token) return null;
  let claims;
  try {
    claims = await privyClient.verifyAuthToken(token);
  } catch {
    return null;
  }
  return prisma.user.findUnique({ where: { privyDid: claims.userId } });
});

export const getOrCreateAuthUser = cache(async (req?: NextRequest) => {
  const token = await resolveToken(req);
  if (!token) return null;

  let claims;
  try {
    claims = await privyClient.verifyAuthToken(token);
  } catch {
    return null;
  }

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

  // First login
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const privyUser = await (privyClient.getUser as any)(claims.userId);
  const twitter = privyUser?.linkedAccounts?.find(
    (a: { type: string }) => a.type === "twitter_oauth",
  ) as { subject?: string; username?: string; name?: string; profilePictureUrl?: string } | undefined;

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
    if ((e as { code?: string }).code === "P2002") {
      return prisma.user.findUnique({ where: { privyDid: claims.userId } });
    }
    throw e;
  }

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
});