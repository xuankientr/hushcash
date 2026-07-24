import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProfilePayWidget } from "@/components/ProfilePayWidget";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return { title: `@${username} · HushCash` };
}

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: { username: true, walletAddress: true },
  });

  if (!user) notFound();

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 py-12">
        {/* Header */}
        <div className="text-center space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="HushCash" width={32} height={32} className="rounded-xl mx-auto" />
          <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="rgba(255,255,255,0.45)" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">@{user.username}</h1>
            <p className="text-xs text-white-4 mt-0.5">Pay with HushCash</p>
          </div>
        </div>

        <ProfilePayWidget user={user} />
      </div>
    </main>
  );
}