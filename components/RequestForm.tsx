"use client";

import { useState } from "react";
import { LinkIcon, CopyIcon, CheckIcon } from "@phosphor-icons/react";

const inp = "w-full bg-bg border border-line-2 rounded-lg px-3 py-2.5 text-white-2 text-sm placeholder:text-white-4 focus:border-primary transition-colors outline-none";

export function RequestForm() {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    const res = await fetch("/api/request", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountUsdc: amount || undefined, note: note || undefined }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) { setUrl(data.url); setAmount(""); setNote(""); }
  }

  return (
    <div className="hush-card p-5 space-y-4">
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-3">
        <div>
          <label className="text-xs text-white-4 mb-1.5 block">Amount <span className="text-white-4">(leave blank = any)</span></label>
          <div className="relative">
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00" min="0.01" step="0.01" className={inp + " pr-16"} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white-4 font-semibold">USDC</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-white-4 mb-1.5 block">Note <span className="text-white-4">(optional)</span></label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="For coffee ☕" maxLength={200} className={inp} />
        </div>
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary-h text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
          <LinkIcon size={15} weight="fill" />
          {loading ? "Creating..." : "Create payment link"}
        </button>
      </form>

      {url && (
        <div className="rounded-lg border border-primary/20 bg-primary-dim p-3">
          <p className="text-xs text-primary font-medium mb-2">Payment link ready</p>
          <div className="flex items-center gap-2">
            <p className="flex-1 text-xs text-white-2 font-mono truncate">{url}</p>
            <button onClick={async () => { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="flex-shrink-0 p-1.5 rounded-md bg-card-2 border border-line-2 hover:border-primary/40 transition-colors">
              {copied ? <CheckIcon size={13} weight="bold" className="text-up" /> : <CopyIcon size={13} className="text-white-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
