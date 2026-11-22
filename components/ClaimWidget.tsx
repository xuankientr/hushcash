"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GiftIcon } from "@phosphor-icons/react";
import { formatUsdc } from "@/lib/utils";

interface ClaimWidgetProps {
  link: { code: string; amountUsdc: string; note: string | null; status: string };
}

const inp = "w-full bg-bg border border-line-2 rounded-lg px-3 py-2.5 text-white-2 text-sm placeholder:text-white-4 font-mono focus:border-primary transition-colors outline-none";

export function ClaimWidget({ link, canRetry }: ClaimWidgetProps & { canRetry: boolean }) {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (link.status !== "UNCLAIMED" && !canRetry) {
    const labels: Record<string, string> = {
      FUNDING: "Waiting for escrow funding to confirm.",
      FUNDING_FAILED: "Escrow funding failed.",
      CLAIMING: "Your claim is awaiting network confirmation.",
      CLAIMED: "This drop has been claimed.",
      EXPIRED: "The deadline to claim this drop has passed.",
      REFUNDING: "Refund awaiting network confirmation.",
      REFUNDED: "The funds were returned to the sender.",
    };
    return <p className="hush-card p-6 text-center text-white-2" role="status">{labels[link.status] ?? "This drop is unavailable."}</p>;
  }

  return (
    <div className="hush-card p-5 space-y-5">
      <div className="text-center py-3">
        <div className="w-14 h-14 rounded-2xl bg-primary-dim border border-primary/20 flex items-center justify-center mx-auto mb-3">
          <GiftIcon size={28} weight="duotone" className="text-primary" />
        </div>
        <p className="text-3xl font-bold text-white">{formatUsdc(link.amountUsdc)}</p>
        <p className="text-sm text-white-3 mt-1">{canRetry ? "Retry using the original claim address" : "USDC waiting for you"}</p>
        {link.note && <p className="text-sm text-white-4 mt-2 italic">"{link.note}"</p>}
      </div>

      <form onSubmit={async (e) => {
        e.preventDefault(); setError(""); setLoading(true);
        try {
          const res = await fetch("/api/claim", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: link.code, toAddress: address.trim() }),
          });
          const data = await res.json();
          if (!res.ok) setError(data.error ?? "Failed to claim");
        } catch {
          setError("Could not verify the claim. Retry using the same wallet address.");
        } finally {
          setLoading(false);
          router.refresh();
        }
      }} className="space-y-3">
        <div>
          <label className="text-xs text-white-4 mb-1.5 block">Your wallet address</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..." required className={inp} />
        </div>
        {error && <div className="rounded-lg bg-down/10 border border-down/20 px-3 py-2"><p className="text-xs text-down">{error}</p></div>}
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary-h text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
          {loading ? "Claiming..." : `Claim ${formatUsdc(link.amountUsdc)}`}
        </button>
      </form>
    </div>
  );
}
