import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { dropStatus, reconcileDrop } from "@/lib/drops";
import { RefreshPaymentStatus } from "@/components/PaymentActions";
import { ClaimWidget } from "@/components/ClaimWidget";
import { LockIcon } from "@phosphor-icons/react/ssr";

export default async function ClaimPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const saved = await prisma.claimableLink.findUnique({
    where: { code },
  });

  if (!saved) notFound();
  const link = await reconcileDrop(saved);
  const status = dropStatus(link);

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
        <ClaimWidget link={{ code: link.code, amountUsdc: link.amountUsdc, note: link.note, status }}
          canRetry={status === "CLAIMING" && !link.payoutId} />
        {["FUNDING", "CLAIMING", "REFUNDING"].includes(status) && <RefreshPaymentStatus />}
        {link.expiresAt && <p className="mt-3 text-center text-xs text-white-3">Claim deadline {link.expiresAt.toISOString().slice(0, 16).replace("T", " ")} UTC</p>}
      </div>
    </main>
  );
}
