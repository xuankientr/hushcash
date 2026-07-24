"use client";

import { useState } from "react";
import { ScissorsIcon, XIcon, CopyIcon, CheckIcon } from "@phosphor-icons/react";

interface SplitLink {
  url: string;
  amount: string;
  copied: boolean;
}

export function SplitModal({ onClose }: { onClose: () => void }) {
  const [total, setTotal] = useState("");
  const [count, setCount] = useState("2");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState<SplitLink[]>([]);
  const [copiedAll, setCopiedAll] = useState(false);

  const n = Math.max(2, parseInt(count) || 2);
  const perPerson = total ? (parseFloat(total) / n).toFixed(2) : "0.00";

  async function handleSplit() {
    if (!total || n < 2) return;
    setLoading(true);
    const amount = (parseFloat(total) / n).toFixed(6);
    const results: SplitLink[] = [];
    for (let i = 0; i < n; i++) {
      const res = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountUsdc: amount, note: note || undefined }),
      });
      const data = await res.json();
      if (res.ok) results.push({ url: data.url, amount, copied: false });
    }
    setLinks(results);
    setLoading(false);
  }

  async function copyLink(i: number) {
    await navigator.clipboard.writeText(links[i].url);
    setLinks((prev) => prev.map((l, idx) => idx === i ? { ...l, copied: true } : l));
    setTimeout(() => setLinks((prev) => prev.map((l, idx) => idx === i ? { ...l, copied: false } : l)), 2000);
  }

  async function copyAll() {
    const text = links.map((l, i) => `Person ${i + 1}: ${l.url}`).join("\n");
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-card rounded-t-3xl sm:rounded-3xl border border-white/[0.08]"
        style={{ boxShadow: "0 -8px 48px rgba(0,0,0,0.6)" }}>

        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <ScissorsIcon size={16} weight="bold" />
            <span>Split Bill</span>
          </div>
          <button onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/[0.06] text-white-4 hover:text-white transition-colors">
            <XIcon size={14} weight="bold" />
          </button>
        </div>

        <div className="px-5 space-y-3" style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>
          {!links.length ? (
            <>
              <div className="relative">
                <input type="number" value={total} onChange={(e) => setTotal(e.target.value)}
                  placeholder="Total amount" min="0.01" step="0.01"
                  className="w-full rounded-2xl px-4 py-3 text-sm text-white-2 pr-16 outline-none" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white-4 font-semibold">USDC</span>
              </div>

              <div className="flex items-center gap-3 bg-black/20 rounded-2xl px-4 py-3 border border-white/[0.06]">
                <span className="text-xs text-white-4 flex-shrink-0">Split between</span>
                <input type="number" value={count}
                  onChange={(e) => setCount(e.target.value)}
                  min="2" max="20"
                  className="w-12 bg-transparent text-white text-sm font-semibold text-center outline-none" />
                <span className="text-xs text-white-4 flex-shrink-0">people</span>
                {total && (
                  <span className="ml-auto text-xs font-semibold text-white-3 flex-shrink-0">
                    {perPerson} each
                  </span>
                )}
              </div>

              <input value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="What's it for? (optional)" maxLength={200}
                className="w-full rounded-2xl px-4 py-3 text-sm text-white-2 placeholder:text-white-4/50 outline-none" />

              <button onClick={handleSplit} disabled={!total || n < 2 || loading}
                className="w-full h-12 rounded-2xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-40">
                {loading ? "Generating links..." : `Generate ${n} payment links`}
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] text-white-4 pb-1">Share each link — {perPerson} USDC per person</p>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {links.map((link, i) => (
                  <div key={i} className="flex items-center gap-2 bg-black/20 border border-white/[0.07] rounded-2xl px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-white-4 mb-0.5">Person {i + 1}</p>
                      <p className="text-xs font-mono text-white-2 truncate">{link.url}</p>
                    </div>
                    <button onClick={() => copyLink(i)}
                      className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl bg-white/[0.08] text-white-3 hover:text-white transition-colors">
                      {link.copied
                        ? <CheckIcon size={13} weight="bold" className="text-up" />
                        : <CopyIcon size={13} />}
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={copyAll}
                className="w-full h-10 rounded-2xl border border-white/[0.08] text-white-3 text-xs hover:text-white hover:bg-white/[0.04] transition-all flex items-center justify-center gap-2">
                {copiedAll
                  ? <><CheckIcon size={12} className="text-up" /> All copied</>
                  : <><CopyIcon size={12} /> Copy all links</>}
              </button>
              <button onClick={() => { setLinks([]); setTotal(""); setCount("2"); setNote(""); }}
                className="w-full h-10 rounded-2xl border border-white/[0.08] text-white-4 text-xs hover:text-white transition-all">
                New split
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}