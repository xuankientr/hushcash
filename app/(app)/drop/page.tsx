import { redirect } from "next/navigation";
import { getOrCreateAuthUser } from "@/lib/privy-server";
import { prisma } from "@/lib/prisma";
import { dropStatus, reconcileDrop } from "@/lib/drops";
import { DropAction } from "@/components/DropAction";
import { DropForm } from "@/components/DropForm";
import { CopyPaymentLink, RefreshPaymentStatus } from "@/components/PaymentActions";

const labels = {
  FUNDING: "Awaiting funding confirmation", FUNDING_FAILED: "Funding failed", UNCLAIMED: "Funded · ready to claim",
  CLAIMING: "Claim confirming", CLAIMED: "Claimed", EXPIRED: "Expired", REFUNDING: "Refund confirming",
  REFUNDED: "Refunded", CANCELLED: "Cancelled",
};

export default async function DropPage() {
  const user = await getOrCreateAuthUser();
  if (!user) redirect("/login");
  const saved = await prisma.claimableLink.findMany({ where: { senderId: user.id }, orderBy: { createdAt: "desc" } });
  const pending = saved.filter((item) => (item.status === "FUNDING" && item.fundingId) ||
    ((item.status === "CLAIMING" || item.status === "REFUNDING") && item.payoutId)).slice(0, 12);
  const updated = new Map(await Promise.all(pending.map(async (item) => [item.id, await reconcileDrop(item)] as const)));

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Drop Cash</h1>
        <p className="mt-1 text-white-3">Send USDC via a claim link on Arc Testnet.</p>
      </header>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {process.env.DROP_GAS_SPONSORSHIP_ENABLED === "true" ? <DropForm /> : (
          <p className="hush-card p-5 text-white-3">New drops are unavailable while gas sponsorship is being set up. You can still manage existing drops here.</p>
        )}
        <section className="hush-card divide-y divide-line">
          <h2 className="px-5 py-4 text-lg font-semibold text-white">Your drops</h2>
          {saved.length === 0 && <p className="px-5 py-6 text-white-3">Your claim links will appear here.</p>}
          {saved.map((item) => {
            const link = updated.get(item.id) ?? item;
            const status = dropStatus(link);
            return (
              <article key={link.id} className="space-y-2 px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-white">{link.amountUsdc} USDC</p>
                  <span className="badge bg-blue-400/10 text-blue-200">{status === "UNCLAIMED" && !link.fundingKey ? "Legacy link · funding checked at claim" : labels[status]}</span>
                </div>
                {link.note && <p className="break-words text-white-3">{link.note}</p>}
                {link.expiresAt && <p className="text-sm text-white-3">Claim deadline <time dateTime={link.expiresAt.toISOString()}>{link.expiresAt.toISOString().slice(0, 16).replace("T", " ")} UTC</time></p>}
                {status === "UNCLAIMED" && <CopyPaymentLink path={`/claim/${link.code}`} />}
                {(status === "EXPIRED" || (status === "REFUNDING" && !link.payoutId) || (status === "UNCLAIMED" && !link.expiresAt)) &&
                  <DropAction code={link.code} action="refund" />}
                {status === "FUNDING" && !link.fundingId && <DropAction code={link.code} action="resume-funding" />}
              </article>
            );
          })}
        </section>
      </div>
      {pending.length > 0 && <RefreshPaymentStatus />}
    </div>
  );
}
