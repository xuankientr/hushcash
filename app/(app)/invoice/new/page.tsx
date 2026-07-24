"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import {
  ArrowLeftIcon, CopyIcon, CheckIcon, ReceiptIcon,
  CameraIcon, ImageIcon, XIcon, LinkIcon, DownloadSimpleIcon,
} from "@phosphor-icons/react";

const inp = "w-full rounded-2xl px-4 py-3 text-sm text-white-2 placeholder:text-white-4/60 outline-none resize-none";

async function compressImage(file: File, maxKb = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      const MAX_DIM = 1200;
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      let quality = 0.85;
      let dataUrl = canvas.toDataURL("image/jpeg", quality);
      while (dataUrl.length > maxKb * 1024 * 1.37 && quality > 0.3) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL("image/jpeg", quality);
      }
      resolve(dataUrl);
    };
    img.onerror = reject;
    img.src = url;
  });
}

type ProofMode = "upload" | "url";

export default function NewInvoicePage() {
  const router = useRouter();
  const { getAccessToken } = usePrivy();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [proofNote, setProofNote] = useState("");
  const [proofMode, setProofMode] = useState<ProofMode>("upload");
  const [proofImageUrl, setProofImageUrl] = useState("");
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function handleImageFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setImageUploading(true);
    try {
      const compressed = await compressImage(file);
      setProofPreview(compressed);
      setProofImageUrl(compressed);
    } catch {
      setError("Could not process image");
    } finally {
      setImageUploading(false);
    }
  }

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
      body: JSON.stringify({
        title, description, amountUsdc: amount,
        proofNote,
        proofImageUrl: proofMode === "url" ? proofImageUrl : (proofPreview ?? undefined),
      }),
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

  async function handleDownloadQR() {
    if (!result) return;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=16&data=${encodeURIComponent(result.url)}`;
    const res = await fetch(qrUrl);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "invoice-qr.png";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="min-h-screen bg-bg px-4 pt-12 pb-20">
      <div className="max-w-sm mx-auto space-y-5">
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
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. House Cleaning — July 2025" maxLength={100} className={inp} />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you did... (optional)" maxLength={1000} rows={2} className={inp} />
              <div className="relative">
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00" min="0.01" step="0.01" className={inp + " pr-16"} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white-4 font-semibold">USDC</span>
              </div>
            </div>

            {/* Proof of work */}
            <div className="hush-card p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-white-4 uppercase tracking-wider">Proof of Work</p>
                <p className="text-[11px] text-white-4/60 mt-0.5">Help your client verify the job is done</p>
              </div>

              <textarea value={proofNote} onChange={(e) => setProofNote(e.target.value)}
                placeholder="What was completed? e.g. Cleaned 3 rooms, vacuumed carpet, wiped surfaces..."
                maxLength={1000} rows={2} className={inp} />

              {/* Photo toggle */}
              <div className="flex gap-2">
                <button onClick={() => setProofMode("upload")}
                  className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-medium transition-all ${proofMode === "upload" ? "bg-primary text-white" : "bg-white/[0.04] text-white-4 hover:text-white-2 border border-white/[0.08]"}`}>
                  <ImageIcon size={13} />
                  Upload photo
                </button>
                <button onClick={() => setProofMode("url")}
                  className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-medium transition-all ${proofMode === "url" ? "bg-primary text-white" : "bg-white/[0.04] text-white-4 hover:text-white-2 border border-white/[0.08]"}`}>
                  <LinkIcon size={13} />
                  Paste URL
                </button>
              </div>

              {proofMode === "upload" ? (
                <>
                  {/* Hidden inputs */}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }} />
                  <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }} />

                  {proofPreview ? (
                    <div className="relative rounded-2xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={proofPreview} alt="Proof" className="w-full max-h-48 object-cover rounded-2xl" />
                      <button onClick={() => { setProofPreview(null); setProofImageUrl(""); }}
                        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors">
                        <XIcon size={12} weight="bold" />
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => cameraInputRef.current?.click()} disabled={imageUploading}
                        className="flex flex-col items-center justify-center gap-2 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] border-dashed hover:bg-white/[0.07] transition-all text-white-4 hover:text-white-2 disabled:opacity-40">
                        <CameraIcon size={20} />
                        <span className="text-[11px]">Take photo</span>
                      </button>
                      <button onClick={() => fileInputRef.current?.click()} disabled={imageUploading}
                        className="flex flex-col items-center justify-center gap-2 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] border-dashed hover:bg-white/[0.07] transition-all text-white-4 hover:text-white-2 disabled:opacity-40">
                        <ImageIcon size={20} />
                        <span className="text-[11px]">{imageUploading ? "Processing..." : "Gallery"}</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <input value={proofImageUrl} onChange={(e) => setProofImageUrl(e.target.value)}
                  placeholder="https://..." className={inp} />
              )}
            </div>

            {error && (
              <div className="rounded-2xl bg-down/10 border border-down/20 px-4 py-3">
                <p className="text-xs text-down">{error}</p>
              </div>
            )}

            <button onClick={handleCreate} disabled={loading || !title || !amount}
              className="w-full h-12 rounded-2xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-30 active:scale-[0.98]">
              {loading ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="hush-card p-5 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-up/10 border border-up/20 flex items-center justify-center mx-auto">
                <ReceiptIcon size={22} weight="duotone" className="text-up" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Invoice created!</p>
                <p className="text-xs text-white-4 mt-0.5">Share this link with your client</p>
              </div>

              {/* QR code */}
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=10&data=${encodeURIComponent(result.url)}`}
                  alt="Invoice QR" width={180} height={180} className="rounded-2xl"
                />
              </div>

              {/* Link row */}
              <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2.5">
                <p className="flex-1 text-xs text-white-2 font-mono truncate text-left">{result.url}</p>
                <button onClick={handleCopy}
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.08] text-white-3 hover:text-white transition-colors">
                  {copied ? <CheckIcon size={12} weight="bold" className="text-up" /> : <CopyIcon size={12} />}
                </button>
              </div>

              {/* Download QR */}
              <button onClick={handleDownloadQR}
                className="w-full flex items-center justify-center gap-2 h-9 rounded-xl border border-white/[0.08] text-white-4 text-xs hover:text-white hover:border-white/[0.18] transition-all">
                <DownloadSimpleIcon size={14} />
                Download QR image
              </button>
            </div>
            <button onClick={() => { setResult(null); setTitle(""); setDescription(""); setAmount(""); setProofNote(""); setProofPreview(null); setProofImageUrl(""); }}
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