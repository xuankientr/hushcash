"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PaperPlaneTiltIcon, AtIcon, WalletIcon, CheckCircleIcon } from "@phosphor-icons/react";

type Mode = "handle" | "address";
const inp = "w-full rounded-xl px-3.5 py-2.5 text-white-2 text-sm placeholder:text-white-4/60 font-mono outline-none";

export function SendForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("handle");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    setError(""); setLoading(true);
    const toValue = mode === "handle" && !to.startsWith("@") ? `@${to}` : to;
    const res = await fetch("/api/transfer", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: toValue, amountUsdc: amount, note }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Transfer failed"); return; }
    setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 2000);
  }

  if (success) {
    return (
      <div className="hush-card p-10 text-center">
        <CheckCircleIcon size={40} weight="duotone" className="text-up mx-auto mb-3" />
        <p className="text-lg font-bold text-white mb-1">Sent!</p>
        <p className="text-sm text-white-3">Your USDC is on its way</p>
      </div>
    );
  }

  return (
    <div className="hush-card p-5 space-y-4">
      <div className="flex bg-black/30 rounded-2xl p-1 gap-1 border border-white/[0.06]">
        {(["handle", "address"] as Mode[]).map((m) => (
          <button key={m} type="button" onClick={() => { setMode(m); setTo(""); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
              mode === m ? "bg-primary text-white shadow-sm" : "text-white-4 hover:text-white-2"
            }`}
          >
            {m === "handle"
              ? <AtIcon size={13} weight={mode === m ? "bold" : "regular"} />
              : <WalletIcon size={13} weight={mode === m ? "bold" : "regular"} />}
            {m === "handle" ? "X Handle" : "Wallet Address"}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-3">
        <div>
          <label className="text-xs text-white-4 mb-1.5 block">{mode === "handle" ? "X / Twitter handle" : "Wallet address"}</label>
          <input type="text" value={to} onChange={(e) => setTo(e.target.value)}
            placeholder={mode === "handle" ? "@username" : "0x..."} className={inp} required />
        </div>
        <div>
          <label className="text-xs text-white-4 mb-1.5 block">Amount</label>
          <div className="relative">
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00" min="0.01" step="0.01" className={inp + " pr-16"} required />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white-4 font-semibold">USDC</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-white-4 mb-1.5 block">Note <span className="text-white-4">(optional)</span></label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="What's it for?" maxLength={200} className={inp} />
        </div>
        {error && <div className="rounded-xl bg-down/10 border border-down/20 px-3.5 py-2.5"><p className="text-xs text-down">{error}</p></div>}
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-h text-white text-sm font-semibold rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-primary/20 active:scale-[0.98]">
          <PaperPlaneTiltIcon size={15} weight="fill" />
          {loading ? "Sending..." : "Send privately"}
        </button>
      </form>
    </div>
  );
}
