"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { PaperPlaneTiltIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { formatUsdc } from "@/lib/utils";

interface Props {
  invoiceCode: string;
  amountUsdc: string;
  walletAddress: string | null;
}

export function InvoicePayWidget({ invoiceCode, amountUsdc, walletAddress }: Props) {
  const { ready, authenticated, login, getAccessToken } = usePrivy();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (success) {
    return (
      <div className="rounded-3xl p-8 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <CheckCircleIcon size={36} weight="duotone" className="text-green-400 mx-auto mb-3" />
        <p className="text-sm font-bold text-white mb-1">Payment sent!</p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Invoice has been paid</p>
      </div>
    );
  }

  if (ready && !authenticated) {
    return (
      <div className="rounded-3xl p-5 space-y-3 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Sign in to pay this invoice</p>
        <button onClick={login}
          className="w-full h-11 rounded-2xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all active:scale-[0.98]">
          Sign in to pay
        </button>
      </div>
    );
  }

  async function handlePay() {
    if (!walletAddress) { setError("Recipient has no wallet set up yet"); return; }
    setError(""); setLoading(true);
    const token = await getAccessToken();
    const res = await fetch("/api/transfer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        to: walletAddress,
        amountUsdc,
        requestCode: invoiceCode,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Payment failed"); return; }

    // Mark invoice as paid
    await fetch(`/api/invoice/${invoiceCode}/pay`, { method: "POST" });
    setSuccess(true);
  }

  return (
    <div className="rounded-3xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      {error && (
        <div className="rounded-xl px-3 py-2" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
      <button
        onClick={handlePay}
        disabled={loading || !ready}
        className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-40 active:scale-[0.98]"
      >
        <PaperPlaneTiltIcon size={15} weight="fill" />
        {loading ? "Sending..." : `Pay ${formatUsdc(amountUsdc)}`}
      </button>
      <p className="text-center text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
        Private payments via ArcaneVM · coming soon
      </p>
    </div>
  );
}