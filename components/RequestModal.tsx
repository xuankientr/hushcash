"use client";

import { useState, useEffect } from "react";
import {
  ArrowDownLeftIcon, XIcon, CopyIcon, CheckIcon,
  PlusIcon, MinusIcon,
} from "@phosphor-icons/react";

// Parse a person's input: "30%" → 30% of total, "1.5" → 1.5 USDC
function parsePersonAmount(input: string, total: number): number {
  const s = input.trim();
  if (!s) return 0;
  if (s.endsWith("%")) {
    const pct = parseFloat(s.slice(0, -1));
    return isNaN(pct) ? 0 : (total * pct) / 100;
  }
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function fmt(n: number) {
  return n.toFixed(2);
}

interface SplitLink {
  label: string;
  url: string;
  copied: boolean;
}

export function RequestModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const [note, setNote]     = useState("");
  const [loading, setLoading] = useState(false);

  // Single-link result
  const [url, setUrl]       = useState("");
  const [copied, setCopied] = useState(false);

  // Split
  const [split, setSplit]   = useState(false);
  const [people, setPeople] = useState<string[]>(["", ""]);
  const [splitLinks, setSplitLinks] = useState<SplitLink[]>([]);
  const [copiedAll, setCopiedAll]   = useState(false);

  const total = parseFloat(amount) || 0;

  // Auto-fill equal shares when total or number of people changes
  useEffect(() => {
    if (!split || !total) return;
    const eq = fmt(total / people.length);
    setPeople((prev) => prev.map(() => eq));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, split]);

  const personAmounts = people.map((p) => parsePersonAmount(p, total));
  const splitTotal    = personAmounts.reduce((a, b) => a + b, 0);
  const balanced      = total > 0 && Math.abs(splitTotal - total) < 0.005;
  const diff          = splitTotal - total;

  function addPerson() {
    setPeople((p) => [...p, total ? fmt(0) : ""]);
  }
  function removePerson(i: number) {
    if (people.length <= 2) return;
    setPeople((p) => p.filter((_, idx) => idx !== i));
  }
  function updatePerson(i: number, val: string) {
    setPeople((p) => p.map((v, idx) => idx === i ? val : v));
  }

  // ── single link ────────────────────────────────────────────────────────────
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

  // ── split links ────────────────────────────────────────────────────────────
  async function handleSplit() {
    setLoading(true);
    const results: SplitLink[] = [];
    for (let i = 0; i < people.length; i++) {
      const amt = fmt(personAmounts[i]);
      const res = await fetch("/api/request", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountUsdc: amt, note: note || undefined }),
      });
      const data = await res.json();
      if (res.ok) results.push({ label: `Person ${i + 1}`, url: data.url, copied: false });
    }
    setSplitLinks(results);
    setLoading(false);
  }

  async function copySplitLink(i: number) {
    await navigator.clipboard.writeText(splitLinks[i].url);
    setSplitLinks((prev) => prev.map((l, idx) => idx === i ? { ...l, copied: true } : l));
    setTimeout(() => setSplitLinks((prev) => prev.map((l, idx) => idx === i ? { ...l, copied: false } : l)), 2000);
  }

  async function copyAllLinks() {
    const text = splitLinks.map((l, i) => `Person ${i + 1}: ${l.url}`).join("\n");
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  function reset() {
    setUrl(""); setSplitLinks([]); setAmount(""); setNote("");
    setPeople(["", ""]); setSplit(false);
  }

  // ── result views ───────────────────────────────────────────────────────────
  const showSingleResult = !split && url;
  const showSplitResult  = split && splitLinks.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-sm bg-card rounded-t-3xl sm:rounded-3xl border border-white/[0.08]"
        style={{ boxShadow: "0 -8px 48px rgba(0,0,0,0.6)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <ArrowDownLeftIcon size={16} weight="bold" />
            <span>Request</span>
            {split && !showSplitResult && (
              <span className="text-[11px] font-normal text-white-4 ml-1">· Split</span>
            )}
          </div>
          <button onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/[0.06] text-white-4 hover:text-white transition-colors">
            <XIcon size={14} weight="bold" />
          </button>
        </div>

        <div className="px-5 space-y-3" style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>

          {/* ── single result ── */}
          {showSingleResult && (
            <div className="space-y-3">
              <div className="flex justify-center pt-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=${encodeURIComponent(url)}`}
                  alt="Payment link QR" width={160} height={160} className="rounded-2xl"
                />
              </div>
              <div className="rounded-2xl bg-up/10 border border-up/20 px-4 py-3">
                <p className="text-xs text-up font-medium mb-2">Link ready — share or scan</p>
                <div className="flex items-center gap-2">
                  <p className="flex-1 text-xs text-white-2 font-mono truncate">{url}</p>
                  <button onClick={handleCopy}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-white/[0.08] text-white-3 hover:text-white transition-colors">
                    {copied ? <CheckIcon size={13} weight="bold" className="text-up" /> : <CopyIcon size={13} />}
                  </button>
                </div>
              </div>
              <button onClick={reset}
                className="w-full h-10 rounded-2xl border border-white/[0.08] text-white-4 text-sm hover:text-white hover:bg-white/[0.04] transition-all">
                Create another
              </button>
            </div>
          )}

          {/* ── split result ── */}
          {showSplitResult && (
            <div className="space-y-2">
              <p className="text-[11px] text-white-4 pb-1">
                {splitLinks.length} links · {fmt(total)} USDC total
              </p>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {splitLinks.map((link, i) => (
                  <div key={i} className="flex items-center gap-2 bg-black/20 border border-white/[0.07] rounded-2xl px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-white-4 mb-0.5">
                        {link.label} · {fmt(personAmounts[i])} USDC
                      </p>
                      <p className="text-xs font-mono text-white-2 truncate">{link.url}</p>
                    </div>
                    <button onClick={() => copySplitLink(i)}
                      className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl bg-white/[0.08] text-white-3 hover:text-white transition-colors">
                      {link.copied ? <CheckIcon size={13} weight="bold" className="text-up" /> : <CopyIcon size={13} />}
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={copyAllLinks}
                className="w-full h-10 rounded-2xl border border-white/[0.08] text-white-3 text-xs hover:text-white hover:bg-white/[0.04] transition-all flex items-center justify-center gap-2">
                {copiedAll ? <><CheckIcon size={12} className="text-up" /> All copied</> : <><CopyIcon size={12} /> Copy all links</>}
              </button>
              <button onClick={reset}
                className="w-full h-10 rounded-2xl border border-white/[0.08] text-white-4 text-xs hover:text-white transition-all">
                New request
              </button>
            </div>
          )}

          {/* ── form ── */}
          {!showSingleResult && !showSplitResult && (
            <>
              {/* Total amount */}
              <div className="relative">
                <input type="number" value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={split ? "Total amount" : "0.00 (optional)"}
                  min="0.01" step="0.01"
                  className="w-full rounded-2xl px-4 py-3 text-sm text-white-2 pr-16 outline-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/USDC_Logo.png" alt="USDC" width={14} height={14} className="rounded-full" />
                  <span className="text-xs text-white-4 font-semibold">USDC</span>
                </div>
              </div>

              {/* Note */}
              <input value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="What's it for? (optional)" maxLength={200}
                className="w-full rounded-2xl px-4 py-3 text-sm text-white-2 placeholder:text-white-4/50 outline-none"
              />

              {/* Split toggle */}
              <button
                onClick={() => { setSplit((s) => !s); if (!split && total) setPeople([fmt(total / 2), fmt(total / 2)]); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-all text-sm font-medium ${
                  split
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-white/[0.08] text-white-4 hover:text-white hover:border-white/[0.14]"
                }`}
              >
                <span>Split between people</span>
                <div className={`w-8 h-4 rounded-full transition-colors relative flex-shrink-0 ${split ? "bg-primary" : "bg-white/[0.12]"}`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${split ? "left-4" : "left-0.5"}`} />
                </div>
              </button>

              {/* Split person rows */}
              {split && (
                <div className="space-y-2">
                  {people.map((val, i) => {
                    const computed = parsePersonAmount(val, total);
                    const pct = total > 0 ? ((computed / total) * 100).toFixed(0) : "—";
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[11px] text-white-4 w-14 flex-shrink-0">Person {i + 1}</span>
                        <div className="relative flex-1">
                          <input
                            value={val}
                            onChange={(e) => updatePerson(i, e.target.value)}
                            placeholder="1.00 or 30%"
                            className="w-full rounded-xl px-3 py-2 text-sm text-white-2 pr-12 outline-none bg-black/20 border border-white/[0.07] focus:border-primary/50 transition-colors"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white-4">
                            {total > 0 ? `${pct}%` : "USDC"}
                          </span>
                        </div>
                        <button
                          onClick={() => removePerson(i)}
                          disabled={people.length <= 2}
                          className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg text-white-4 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-20"
                        >
                          <MinusIcon size={12} weight="bold" />
                        </button>
                      </div>
                    );
                  })}

                  <div className="flex items-center justify-between pt-0.5">
                    <button onClick={addPerson}
                      className="flex items-center gap-1 text-[11px] text-white-4 hover:text-white transition-colors">
                      <PlusIcon size={11} weight="bold" /> Add person
                    </button>
                    {total > 0 && (
                      <p className={`text-[11px] ${balanced ? "text-up" : "text-yellow-400"}`}>
                        {balanced
                          ? `✓ ${fmt(splitTotal)} USDC`
                          : `${diff > 0 ? "+" : ""}${fmt(diff)} USDC off`}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={split ? handleSplit : handleCreate}
                disabled={loading || (split && (!amount || !balanced))}
                className="w-full h-12 rounded-2xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-40"
              >
                {loading
                  ? "Creating..."
                  : split
                    ? `Generate ${people.length} payment links`
                    : "Create payment link"}
              </button>

              <p className="text-center text-[11px] text-white-4">
                Private transactions via Arc Privacy · <span>coming soon</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}