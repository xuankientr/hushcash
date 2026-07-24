"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRightIcon, XIcon, ArrowLeftIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { AtIcon, WalletIcon } from "@phosphor-icons/react";

const KEYS = [["1","2","3"],["4","5","6"],["7","8","9"],[".","0","⌫"]];

type Step = "amount" | "recipient" | "success";
type Mode = "handle" | "address";

export function SendModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("0");
  const [mode, setMode] = useState<Mode>("handle");
  const [to, setTo] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleKey(key: string) {
    if (key === "⌫") {
      setAmount((p) => (p.length > 1 ? p.slice(0, -1) : "0"));
      return;
    }
    if (key === ".") {
      if (!amount.includes(".")) setAmount((p) => p + ".");
      return;
    }
    setAmount((p) => {
      if (p === "0") return key;
      const dec = p.split(".")[1];
      if (dec !== undefined && dec.length >= 2) return p;
      return p + key;
    });
  }

  async function handleSend() {
    setError(""); setLoading(true);
    const toValue = mode === "handle" && !to.startsWith("@") ? `@${to}` : to;
    const res = await fetch("/api/transfer", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: toValue, amountUsdc: amount, note }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Transfer failed"); return; }
    setStep("success");
    setTimeout(() => { onClose(); router.refresh(); }, 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-card rounded-t-3xl sm:rounded-3xl border border-white/[0.08] overflow-hidden"
        style={{ boxShadow: "0 -8px 48px rgba(0,0,0,0.6)" }}>

        {/* Success */}
        {step === "success" && (
          <div className="p-10 text-center">
            <CheckCircleIcon size={48} weight="duotone" className="text-up mx-auto mb-4" />
            <p className="text-xl font-bold text-white">Sent!</p>
            <p className="text-sm text-white-4 mt-1">Your USDC is on its way</p>
          </div>
        )}

        {/* Step 1: Amount */}
        {step === "amount" && (
          <>
            <div className="flex items-center justify-between px-5 pt-5 pb-2">
              <div className="flex items-center gap-2 text-white font-semibold">
                <ArrowUpRightIcon size={16} weight="bold" />
                <span>Send</span>
              </div>
              <button onClick={onClose} className="w-11 h-11 flex items-center justify-center rounded-full bg-white/[0.06] text-white-4 hover:text-white transition-colors">
                <XIcon size={14} weight="bold" />
              </button>
            </div>

            <div className="px-5 py-4 text-center">
              <p className="font-bold text-white tracking-tight leading-none" style={{ fontSize: 'clamp(2rem, 11vw, 3.25rem)' }}>
                {amount}
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/USDC_Logo.png" alt="USDC" width={18} height={18} className="rounded-full" />
                <span className="text-sm text-white-4 font-medium">USDC</span>
              </div>
              <p className="text-xs text-white-4 mt-2">0 USDC available</p>
            </div>

            <div className="grid grid-cols-3 gap-px bg-white/[0.04] border-t border-white/[0.06]">
              {KEYS.flat().map((k) => (
                <button key={k} onClick={() => handleKey(k)}
                  className="h-16 flex items-center justify-center text-xl font-medium text-white bg-card hover:bg-white/[0.06] active:bg-white/[0.1] transition-colors">
                  {k === "⌫" ? <span className="text-lg text-white-4">⌫</span> : k}
                </button>
              ))}
            </div>

            <div className="p-4">
              <button
                onClick={() => setStep("recipient")}
                disabled={!amount || amount === "0"}
                className="w-full h-12 rounded-2xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-30"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {/* Step 2: Recipient */}
        {step === "recipient" && (
          <>
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <button onClick={() => setStep("amount")} className="flex items-center gap-1.5 text-white-3 hover:text-white transition-colors">
                <ArrowLeftIcon size={14} weight="bold" />
                <span className="text-sm">Back</span>
              </button>
              <span className="text-sm font-semibold text-white">{amount} USDC</span>
              <button onClick={onClose} className="w-11 h-11 flex items-center justify-center rounded-full bg-white/[0.06] text-white-4 hover:text-white transition-colors">
                <XIcon size={14} weight="bold" />
              </button>
            </div>

            <div className="px-5 space-y-4" style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>
              {/* Mode toggle */}
              <div className="flex bg-black/30 rounded-2xl p-1 gap-1 border border-white/[0.06]">
                {(["handle", "address"] as Mode[]).map((m) => (
                  <button key={m} onClick={() => { setMode(m); setTo(""); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${mode === m ? "bg-primary text-white" : "text-white-4 hover:text-white-2"}`}>
                    {m === "handle" ? <AtIcon size={12} /> : <WalletIcon size={12} />}
                    {m === "handle" ? "Username" : "Wallet"}
                  </button>
                ))}
              </div>

              <input
                autoFocus
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder={mode === "handle" ? "@username" : "0x..."}
                className="w-full rounded-2xl px-4 py-3 text-sm text-white-2 font-mono placeholder:text-white-4/50 outline-none"
              />

              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note (optional)"
                maxLength={200}
                className="w-full rounded-2xl px-4 py-3 text-sm text-white-2 placeholder:text-white-4/50 outline-none"
              />

              {error && (
                <div className="rounded-xl bg-down/10 border border-down/20 px-4 py-2.5">
                  <p className="text-xs text-down">{error}</p>
                </div>
              )}

              <button
                onClick={handleSend}
                disabled={!to || loading}
                className="w-full h-12 rounded-2xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-30"
              >
                {loading ? "Sending..." : "Send"}
              </button>
              <p className="text-center text-[11px] text-white-4/60">
                Private transactions via Arc Privacy · <span className="text-white-4">coming soon</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}