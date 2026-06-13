import { NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { createWalletForUser } from "@/lib/circle";
import { verifyMessage } from "viem";

declare module "next-auth" {
  interface Session {
    user: { id: string; name?: string | null; email?: string | null; image?: string | null };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "wallet",
      name: "Wallet",
      credentials: {
        address: { label: "Address", type: "text" },
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.address || !credentials?.signature || !credentials?.message) return null;

        const address = credentials.address.toLowerCase();

        // Verify the signature
        const valid = await verifyMessage({
          address: credentials.address as `0x${string}`,
          message: credentials.message,
          signature: credentials.signature as `0x${string}`,
        });
        if (!valid) return null;

        // Find or create user by wallet address
        let dbUser = await prisma.user.findUnique({ where: { walletAddress: address } });

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: { walletAddress: address },
          });
          // Create Circle wallet
          try {
            const wallet = await createWalletForUser(dbUser.id);
            if (wallet) {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { walletId: wallet.id },
              });
            }
          } catch (e) {
            console.error("Failed to create Circle wallet:", e);
          }
        }

        return { id: dbUser.id, name: dbUser.twitterName ?? address.slice(0, 8) };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "twitter") {
        // OAuth 1.0a profile shape
        const twitterProfile = profile as {
          id_str?: string;
          screen_name?: string;
          name?: string;
          profile_image_url_https?: string;
        };
        const twitterId = twitterProfile?.id_str ?? user.id;
        const handle = twitterProfile?.screen_name;
        const name = twitterProfile?.name ?? user.name;
        const avatar = twitterProfile?.profile_image_url_https?.replace("_normal", "") ?? user.image;

        let dbUser = await prisma.user.findUnique({ where: { twitterId } });

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: { twitterId, twitterHandle: handle, twitterName: name, twitterAvatar: avatar },
          });

          // Create Circle wallet for new user
          try {
            const wallet = await createWalletForUser(dbUser.id);
            if (wallet) {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { walletId: wallet.id, walletAddress: wallet.address },
              });
            }
          } catch (e) {
            console.error("Failed to create Circle wallet:", e);
          }
        } else {
          // Update profile info
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { twitterHandle: handle, twitterName: name, twitterAvatar: avatar },
          });
        }

        user.id = dbUser.id;
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
};
