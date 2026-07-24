"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { PaperPlaneTiltIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { formatUsdc } from "@/lib/utils";

interface PayWidgetProps {
  request: {
    code: string;
    amountUsdc: string | null;
    note: string | null;
    user: { username: string | null; walletAddress: string | null };
  };
}

const inp = "w-full bg-bg border border-line-2 rounded-lg px-3 py-2.5 text-white-2 text-sm placeholder:text-white-4 focus:border-primary transition-colors outline-none";

export function PayWidget({ request }: PayWidgetProps) {
  const { ready, authenticated, login, getAccessToken } = usePrivy();
  const [amount, setAmount] = useState(request.amountUsdc ?? "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (success) {
    return (
      <div className="hush-card p-10 text-center">
        <CheckCircleIcon size={40} weight="duotone" className="text-up mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-1">Payment sent!</h2>
        <p className="text-sm text-white-3">Your USDC is on its way</p>
      </div>
    );
  }

  return (
    <div className="hush-card p-5 space-y-4">
      {/* Recipient */}
      <div className="flex items-center gap-3 p-3 bg-bg rounded-lg border border-line">
        <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex-shrink-0 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" fill="rgba(255,255,255,0.5)" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-white-2">
            {request.user.username ? `@${request.user.username}` : "Anonymous"}
          </p>
        </div>
      </div>

      {request.note && <p className="text-sm text-white-3 text-center italic">&ldquo;{request.note}&rdquo;</p>}

      {/* Not logged in */}
      {ready && !authenticated ? (
        <div className="space-y-3">
          <p className="text-xs text-white-4 text-center">You need to be signed in to pay</p>
          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary-h text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Sign in to pay
          </button>
        </div>
      ) : (
        <form onSubmit={async (e) => {
          e.preventDefault(); setError(""); setLoading(true);
          const token = await getAccessToken();
          const res = await fetch("/api/transfer", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              to: request.user.walletAddress ?? "",
              amountUsdc: amount,
              requestCode: request.code,
            }),
          });
          const data = await res.json();
          setLoading(false);
          if (!res.ok) { setError(data.error ?? "Payment failed"); return; }
          setSuccess(true);
        }} className="space-y-3">
          <div>
            <label className="text-xs text-white-4 mb-1.5 block">Amount</label>
            <div className="relative">
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00" min="0.01" step="0.01" readOnly={!!request.amountUsdc}
                className={inp + " pr-16"} required />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white-4 font-semibold">USDC</span>
            </div>
          </div>
          {error && <div className="rounded-lg bg-down/10 border border-down/20 px-3 py-2"><p className="text-xs text-down">{error}</p></div>}
          <button type="submit" disabled={loading || !ready}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary-h text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
            <PaperPlaneTiltIcon size={15} weight="fill" />
            {loading ? "Sending..." : amount ? `Pay ${formatUsdc(amount)}` : "Pay"}
          </button>
        </form>
      )}
    </div>
  );
}