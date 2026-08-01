"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { PaperPlaneTiltIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { formatUsdc } from "@/lib/utils";

function PlugPayInner() {
  const params = useSearchParams();
  const to = params.get("to") ?? "";
  const amountParam = params.get("amount") ?? "";
  const noteParam = params.get("note") ?? "";

  const { ready, authenticated, login, getAccessToken } = usePrivy();
  const [amount, setAmount] = useState(amountParam);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txId, setTxId] = useState("");
  const [error, setError] = useState("");

  const displayTo =
    to.startsWith("@")
      ? to
      : to.length > 16
      ? `${to.slice(0, 6)}…${to.slice(-4)}`
      : to;

  useEffect(() => {
    if (!success || !txId) return;
    window.opener?.postMessage({ type: "hushpay:success", txId, to, amount }, "*");
    const t = setTimeout(() => window.close(), 2200);
    return () => clearTimeout(t);
  }, [success, txId, to, amount]);

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <CheckCircleIcon size={52} weight="duotone" className="text-up mb-4" />
        <h2 className="text-xl font-bold text-white mb-1">Sent!</h2>
        <p className="text-sm text-white-3">Closing window…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-[340px] space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={26} height={26} className="rounded-lg" />
          <span className="text-sm font-semibold text-white">HushCash</span>
          <span className="ml-auto badge" style={{ background: "rgba(39,117,202,0.15)", color: "#2775ca" }}>Pay</span>
        </div>

        {/* Recipient card */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-[11px] text-white-4 mb-1">Paying</p>
          <p className="text-base font-semibold text-white">{displayTo || "—"}</p>
          {noteParam && (
            <p className="text-xs text-white-3 mt-1.5 italic">&ldquo;{noteParam}&rdquo;</p>
          )}
        </div>

        {ready && !authenticated ? (
          <div className="space-y-3">
            <p className="text-xs text-white-4 text-center">Sign in to complete payment</p>
            <button
              onClick={login}
              className="w-full py-3.5 bg-primary hover:bg-primary-h text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Sign in with HushCash
            </button>
          </div>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setLoading(true);
              const token = await getAccessToken();
              const res = await fetch("/api/transfer", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ to, amountUsdc: amount, note: noteParam || undefined }),
              });
              const data = await res.json();
              setLoading(false);
              if (!res.ok) { setError(data.error ?? "Payment failed"); return; }
              setTxId(data.transfer?.id ?? "done");
              setSuccess(true);
            }}
            className="space-y-3"
          >
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                readOnly={!!amountParam}
                required
                className="w-full bg-bg border border-line-2 rounded-xl px-4 py-3.5 text-white-2 text-sm pr-16 outline-none focus:border-primary transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white-4 font-semibold">
                USDC
              </span>
            </div>
            {error && (
              <div className="rounded-lg bg-down/10 border border-down/20 px-3 py-2">
                <p className="text-xs text-down">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !ready || !amount}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary-h text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              <PaperPlaneTiltIcon size={15} weight="fill" />
              {loading ? "Sending…" : amount ? `Pay ${formatUsdc(amount)} USDC` : "Pay"}
            </button>
          </form>
        )}

        <p className="text-center text-[11px] text-white-4">
          Private payments on Arc ·{" "}
          <a
            href="https://hushcash.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            hushcash.xyz
          </a>
        </p>
      </div>
    </div>
  );
}

export default function PlugPayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-sm text-white-4">Loading…</p>
        </div>
      }
    >
      <PlugPayInner />
    </Suspense>
  );
}
