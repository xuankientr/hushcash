"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { ArrowLeftIcon, CopyIcon, CheckIcon, ReceiptIcon } from "@phosphor-icons/react";

const inp = "w-full rounded-2xl px-4 py-3 text-sm text-white-2 placeholder:text-white-4/60 outline-none resize-none";

export default function NewInvoicePage() {
  const router = useRouter();
  const { getAccessToken } = usePrivy();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [proofNote, setProofNote] = useState("");
  const [proofImageUrl, setProofImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setError("");
    if (!title || !amount) { setError("Title and amount are required"); return; }
    setLoading(true);
    const token = await getAccessToken();
    const res = await fetch("/api/invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ title, description, amountUsdc: amount, proofNote, proofImageUrl }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Failed to create invoice"); return; }
    setResult({ url: data.url });
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-bg px-4 pt-12 pb-20">
      <div className="max-w-sm mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.06] text-white-4 hover:text-white transition-colors">
            <ArrowLeftIcon size={14} weight="bold" />
          </button>
          <div className="flex items-center gap-2">
            <ReceiptIcon size={16} weight="bold" className="text-white" />
            <h1 className="text-base font-semibold text-white">New Invoice</h1>
          </div>
        </div>

        {!result ? (
          <div className="space-y-4">
            {/* Service info */}
            <div className="hush-card p-4 space-y-3">
              <p className="text-xs font-semibold text-white-4 uppercase tracking-wider">Service</p>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. House Cleaning — July 2025"
                maxLength={100}
                className={inp}
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you did... (optional)"
                maxLength={1000}
                rows={3}
                className={inp}
              />
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  className={inp + " pr-16"}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white-4 font-semibold">USDC</span>
              </div>
            </div>

            {/* Proof of work */}
            <div className="hush-card p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-white-4 uppercase tracking-wider">Proof of Work</p>
                <p className="text-[11px] text-white-4/60 mt-0.5">Optional — helps the payer verify the job was done</p>
              </div>
              <textarea
                value={proofNote}
                onChange={(e) => setProofNote(e.target.value)}
                placeholder="Describe what was completed, e.g. cleaned 3 rooms, vacuumed carpet..."
                maxLength={1000}
                rows={3}
                className={inp}
              />
              <input
                value={proofImageUrl}
                onChange={(e) => setProofImageUrl(e.target.value)}
                placeholder="Photo URL (optional) — paste an image link"
                className={inp}
              />
            </div>

            {error && (
              <div className="rounded-2xl bg-down/10 border border-down/20 px-4 py-3">
                <p className="text-xs text-down">{error}</p>
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={loading || !title || !amount}
              className="w-full h-12 rounded-2xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-30 active:scale-[0.98]"
            >
              {loading ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="hush-card p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-up/10 border border-up/20 flex items-center justify-center mx-auto">
                <ReceiptIcon size={22} weight="duotone" className="text-up" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Invoice created!</p>
                <p className="text-xs text-white-4 mt-0.5">Share this link with your client</p>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2.5">
                <p className="flex-1 text-xs text-white-2 font-mono truncate text-left">{result.url}</p>
                <button onClick={handleCopy}
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.08] text-white-3 hover:text-white transition-colors">
                  {copied ? <CheckIcon size={12} weight="bold" className="text-up" /> : <CopyIcon size={12} />}
                </button>
              </div>
            </div>

            <button onClick={() => { setResult(null); setTitle(""); setDescription(""); setAmount(""); setProofNote(""); setProofImageUrl(""); }}
              className="w-full h-10 rounded-2xl border border-white/[0.08] text-white-4 text-sm hover:text-white hover:bg-white/[0.04] transition-all">
              Create another
            </button>
            <button onClick={() => router.push("/dashboard")}
              className="w-full h-10 rounded-2xl text-white-4 text-sm hover:text-white transition-colors">
              Back to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}