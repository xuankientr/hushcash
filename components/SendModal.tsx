"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRightIcon, XIcon, ArrowLeftIcon, CheckCircleIcon,
  AtIcon, WalletIcon, QrCodeIcon, CameraIcon,
} from "@phosphor-icons/react";

const KEYS = [["1","2","3"],["4","5","6"],["7","8","9"],[".","0","⌫"]];

type Step = "amount" | "recipient" | "success";
type Mode = "handle" | "address";

// BarcodeDetector is not in default TS DOM lib
declare class BarcodeDetector {
  constructor(opts: { formats: string[] });
  detect(img: HTMLVideoElement): Promise<{ rawValue: string }[]>;
}

export function SendModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [step, setStep]       = useState<Step>("amount");
  const [amount, setAmount]   = useState("0");
  const [mode, setMode]       = useState<Mode>("handle");
  const [to, setTo]           = useState("");
  const [note, setNote]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // QR scanner state
  const [scanning, setScanning]     = useState(false);
  const [scanError, setScanError]   = useState("");
  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef    = useRef<number>(0);

  // Start/stop camera when scanning toggles
  useEffect(() => {
    if (!scanning) return;
    let active = true;
    setScanError("");

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream;
        if (videoRef.current && active) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        if (!("BarcodeDetector" in window)) {
          setScanError("QR scanning not supported in this browser");
          stopCamera();
          return;
        }

        const detector = new BarcodeDetector({ formats: ["qr_code"] });

        const tick = async () => {
          if (!active || !videoRef.current) return;
          try {
            const results = await detector.detect(videoRef.current);
            if (results.length) {
              const raw = results[0].rawValue;
              parseQR(raw);
              active = false;
              stopCamera();
              return;
            }
          } catch { /* frame not ready */ }
          if (active) rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
      } catch {
        setScanError("Camera access denied");
        active = false;
        setScanning(false);
      }
    })();

    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  function stopCamera() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }

  function parseQR(raw: string) {
    // HushCash profile URL → fill as username handle
    const profileMatch = raw.match(/hushcash\.xyz\/u\/([a-zA-Z0-9_-]+)/);
    if (profileMatch) {
      setMode("handle");
      setTo(`@${profileMatch[1]}`);
      return;
    }
    // Ethereum address (bare or EIP-681)
    const addrMatch = raw.match(/0x[a-fA-F0-9]{40}/);
    if (addrMatch) {
      setMode("address");
      setTo(addrMatch[0]);
      return;
    }
    // Plain @username
    if (raw.startsWith("@")) {
      setMode("handle");
      setTo(raw);
      return;
    }
    setScanError("QR not recognised — try manual entry");
  }

  function handleKey(key: string) {
    if (key === "⌫") { setAmount((p) => (p.length > 1 ? p.slice(0, -1) : "0")); return; }
    if (key === ".") { if (!amount.includes(".")) setAmount((p) => p + "."); return; }
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

        {/* ── Success ── */}
        {step === "success" && (
          <div className="p-10 text-center">
            <CheckCircleIcon size={48} weight="duotone" className="text-up mx-auto mb-4" />
            <p className="text-xl font-bold text-white">Sent!</p>
            <p className="text-sm text-white-4 mt-1">Your USDC is on its way</p>
          </div>
        )}

        {/* ── Step 1: Amount ── */}
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
              <p className="font-bold text-white tracking-tight leading-none" style={{ fontSize: "clamp(2rem, 11vw, 3.25rem)" }}>
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
              <button onClick={() => setStep("recipient")} disabled={!amount || amount === "0"}
                className="w-full h-12 rounded-2xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-30">
                Continue
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: Recipient ── */}
        {step === "recipient" && (
          <>
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <button onClick={() => { stopCamera(); setStep("amount"); }}
                className="flex items-center gap-1.5 text-white-3 hover:text-white transition-colors">
                <ArrowLeftIcon size={14} weight="bold" />
                <span className="text-sm">Back</span>
              </button>
              <span className="text-sm font-semibold text-white">{amount} USDC</span>
              <button onClick={() => { stopCamera(); onClose(); }}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white/[0.06] text-white-4 hover:text-white transition-colors">
                <XIcon size={14} weight="bold" />
              </button>
            </div>

            <div className="px-5 space-y-3" style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>
              {/* Mode toggle */}
              <div className="flex bg-black/30 rounded-2xl p-1 gap-1 border border-white/[0.06]">
                {(["handle", "address"] as Mode[]).map((m) => (
                  <button key={m} onClick={() => { setMode(m); setTo(""); stopCamera(); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${mode === m ? "bg-primary text-white" : "text-white-4 hover:text-white-2"}`}>
                    {m === "handle" ? <AtIcon size={12} /> : <WalletIcon size={12} />}
                    {m === "handle" ? "Username" : "Wallet"}
                  </button>
                ))}
              </div>

              {/* Camera view */}
              {scanning && (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-square">
                  <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                  {/* Crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-44 h-44 rounded-2xl"
                      style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.55), inset 0 0 0 2px rgba(255,255,255,0.6)" }} />
                  </div>
                  <div className="absolute bottom-3 inset-x-0 text-center">
                    <p className="text-xs text-white/60">Point at a QR code</p>
                  </div>
                  <button onClick={stopCamera}
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 text-white-3 hover:text-white">
                    <XIcon size={13} weight="bold" />
                  </button>
                </div>
              )}

              {/* Address / handle input */}
              {!scanning && (
                <div className="relative">
                  <input
                    autoFocus
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder={mode === "handle" ? "@username" : "0x..."}
                    className="w-full rounded-2xl px-4 py-3 text-sm text-white-2 font-mono placeholder:text-white-4/50 outline-none pr-12"
                  />
                  <button
                    onClick={() => { setScanError(""); setScanning(true); }}
                    title="Scan QR code"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl text-white-4 hover:text-white hover:bg-white/[0.08] transition-colors"
                  >
                    <QrCodeIcon size={16} />
                  </button>
                </div>
              )}

              {/* Scan error / hint */}
              {scanError && !scanning && (
                <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 px-3 py-2">
                  <p className="text-xs text-yellow-400">{scanError}</p>
                </div>
              )}

              {/* Scan button (standalone, shown below input when not scanning) */}
              {!scanning && !to && (
                <button
                  onClick={() => { setScanError(""); setScanning(true); }}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-2xl border border-white/[0.08] text-white-4 text-xs hover:text-white hover:border-white/[0.18] transition-all"
                >
                  <CameraIcon size={14} />
                  Scan QR to fill address
                </button>
              )}

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

              <button onClick={handleSend} disabled={!to || loading || scanning}
                className="w-full h-12 rounded-2xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-30">
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