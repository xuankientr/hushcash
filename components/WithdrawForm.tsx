"use client";

import { useState } from "react";
import { ArrowCircleUpIcon, CheckCircleIcon } from "@phosphor-icons/react";

const inp = "w-full bg-bg border border-line-2 rounded-lg px-3 py-2.5 text-white-2 text-sm placeholder:text-white-4 focus:border-primary transition-colors outline-none";

export function WithdrawForm() {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError(""); setLoading(true);
    const res = await fetch("/api/transfer", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: address, amountUsdc: amount }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Withdrawal failed"); return; }
    setSuccess(true); setAddress(""); setAmount("");
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <div className="hush-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <ArrowCircleUpIcon size={15} weight="duotone" className="text-primary" />
        <h2 className="text-sm font-semibold text-white-2">Withdraw USDC</h2>
      </div>
      {success ? (
        <div className="flex items-center justify-center gap-2 py-4">
          <CheckCircleIcon size={16} weight="fill" className="text-up" />
          <p className="text-sm text-up font-medium">Withdrawal initiated!</p>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-3">
          <div>
            <label className="text-xs text-white-4 mb-1.5 block">Destination address</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..." required className={inp + " font-mono"} />
          </div>
          <div>
            <label className="text-xs text-white-4 mb-1.5 block">Amount</label>
            <div className="relative">
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00" min="0.01" step="0.01" required className={inp + " pr-16"} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white-4 font-semibold">USDC</span>
            </div>
          </div>
          {error && <div className="rounded-lg bg-down/10 border border-down/20 px-3 py-2"><p className="text-xs text-down">{error}</p></div>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-card-2 border border-line-2 text-white-2 text-sm font-medium rounded-lg hover:border-primary/40 hover:text-white transition-colors disabled:opacity-50">
            {loading ? "Processing..." : "Withdraw"}
          </button>
        </form>
      )}
    </div>
  );
}
