"use client";

import { useState } from "react";
import { ArrowDownLeftIcon, XIcon, CopyIcon, CheckIcon } from "@phosphor-icons/react";

export function RequestModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    setLoading(true);
    const res = await fetch("/api/request", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountUsdc: amount || undefined, note: note || undefined }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setUrl(data.url);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-card rounded-t-3xl sm:rounded-3xl border border-white/[0.08]"
        style={{ boxShadow: "0 -8px 48px rgba(0,0,0,0.6)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <ArrowDownLeftIcon size={16} weight="bold" />
            <span>Request</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.06] text-white-4 hover:text-white transition-colors">
            <XIcon size={14} weight="bold" />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-3">
          {!url ? (
            <>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01" step="0.01"
                  className="w-full rounded-2xl px-4 py-3 text-sm text-white-2 pr-16 outline-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/USDC_Logo.png" alt="USDC" width={14} height={14} className="rounded-full" />
                  <span className="text-xs text-white-4 font-semibold">USDC</span>
                </div>
              </div>

              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's it for? (optional)"
                maxLength={200}
                className="w-full rounded-2xl px-4 py-3 text-sm text-white-2 placeholder:text-white-4/50 outline-none"
              />

              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full h-12 rounded-2xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-40"
              >
                {loading ? "Creating..." : "Create payment link"}
              </button>

              <p className="text-center text-[11px] text-white-4">
                Your wallet address stays hidden from the payer
              </p>
            </>
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl bg-up/10 border border-up/20 px-4 py-3">
                <p className="text-xs text-up font-medium mb-2">Link ready — share it</p>
                <div className="flex items-center gap-2">
                  <p className="flex-1 text-xs text-white-2 font-mono truncate">{url}</p>
                  <button onClick={handleCopy} className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-white/[0.08] text-white-3 hover:text-white transition-colors">
                    {copied ? <CheckIcon size={13} weight="bold" className="text-up" /> : <CopyIcon size={13} />}
                  </button>
                </div>
              </div>
              <button onClick={() => { setUrl(""); setAmount(""); setNote(""); }}
                className="w-full h-10 rounded-2xl border border-white/[0.08] text-white-4 text-sm hover:text-white hover:bg-white/[0.04] transition-all">
                Create another
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}