"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { PaperPlaneTiltIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { formatUsdc } from "@/lib/utils";

interface Props {
  user: { username: string | null; walletAddress: string | null };
}

export function ProfilePayWidget({ user }: Props) {
  const { ready, authenticated, login, getAccessToken } = usePrivy();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (success) {
    return (
      <div className="hush-card p-10 text-center">
        <CheckCircleIcon size={40} weight="duotone" className="text-up mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-1">Payment sent!</h2>
        <p className="text-sm text-white-3">Your USDC is on its way to @{user.username}</p>
      </div>
    );
  }

  return (
    <div className="hush-card p-5 space-y-4">
      {ready && !authenticated ? (
        <div className="space-y-3">
          <p className="text-xs text-white-4 text-center">Sign in to pay @{user.username}</p>
          <button onClick={login}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary-h text-white text-sm font-semibold rounded-lg transition-colors">
            Sign in to pay
          </button>
        </div>
      ) : (
        <form onSubmit={async (e) => {
          e.preventDefault(); setError(""); setLoading(true);
          const token = await getAccessToken();
          const res = await fetch("/api/transfer", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify({ to: user.walletAddress, amountUsdc: amount, note: note || undefined }),
          });
          const data = await res.json();
          setLoading(false);
          if (!res.ok) { setError(data.error ?? "Payment failed"); return; }
          setSuccess(true);
        }} className="space-y-3">
          <div className="relative">
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00" min="0.01" step="0.01" required
              className="w-full bg-bg border border-line-2 rounded-lg px-3 py-3.5 text-white-2 text-sm pr-16 outline-none focus:border-primary transition-colors" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white-4 font-semibold">USDC</span>
          </div>
          <input value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)" maxLength={200}
            className="w-full bg-bg border border-line-2 rounded-lg px-3 py-3.5 text-white-2 text-sm outline-none focus:border-primary transition-colors placeholder:text-white-4/50" />
          {error && (
            <div className="rounded-lg bg-down/10 border border-down/20 px-3 py-2">
              <p className="text-xs text-down">{error}</p>
            </div>
          )}
          <button type="submit" disabled={loading || !amount || !ready}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary-h text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
            <PaperPlaneTiltIcon size={15} weight="fill" />
            {loading ? "Sending..." : amount ? `Pay ${formatUsdc(amount)} USDC` : `Pay @${user.username}`}
          </button>
          <p className="text-center text-[11px] text-white-4">
            Private payments via Arc Privacy · <span>coming soon</span>
          </p>
        </form>
      )}
    </div>
  );
}