import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ClaimWidget } from "@/components/ClaimWidget";
import { LockIcon } from "@phosphor-icons/react/ssr";

export default async function ClaimPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const link = await prisma.claimableLink.findUnique({
    where: { code },
  });

  if (!link) notFound();

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary-dim border border-primary/20 flex items-center justify-center mb-3">
            <LockIcon size={20} weight="duotone" className="text-primary" />
          </div>
          <h1 className="text-lg font-bold text-white">You received cash</h1>
          <p className="text-xs text-white-3 mt-1">Claim your USDC below</p>
        </div>
        <ClaimWidget link={link} />
      </div>
    </main>
  );
}
