"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon, ArrowSquareOutIcon } from "@phosphor-icons/react";

type Cfg = { to: string; amount: string; note: string; label: string };
type Tab = "script" | "react";

const DEMO_ADDRESS = "0x0000000000000000000000000000000000000001";

function buildPopupUrl(cfg: Cfg) {
  const p = new URLSearchParams();
  p.set("to", cfg.to || DEMO_ADDRESS);
  if (cfg.amount) p.set("amount", cfg.amount);
  if (cfg.note) p.set("note", cfg.note);
  return `/plug/pay?${p.toString()}`;
}

function openPlug(url: string, onSuccess: (d: Record<string, unknown>) => void) {
  const w = 420, h = 620;
  const left = Math.max(0, (screen.width - w) / 2);
  const top = Math.max(0, (screen.height - h) / 2);
  const popup = window.open(
    url,
    `hushpay_${Date.now()}`,
    `width=${w},height=${h},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,resizable=no`
  );
  const handler = (e: MessageEvent) => {
    if (e.data?.type === "hushpay:success") {
      window.removeEventListener("message", handler);
      onSuccess(e.data as Record<string, unknown>);
    }
  };
  window.addEventListener("message", handler);
  const poll = setInterval(() => {
    if (!popup || popup.closed) { clearInterval(poll); window.removeEventListener("message", handler); }
  }, 500);
}

function snippet(tab: Tab, cfg: Cfg) {
  const to = cfg.to || DEMO_ADDRESS;
  const label = cfg.label || "Pay with HushCash";
  if (tab === "script") {
    const attrs = [
      `  data-hushpay-to="${to}"`,
      cfg.amount ? `  data-hushpay-amount="${cfg.amount}"` : null,
      cfg.note ? `  data-hushpay-note="${cfg.note}"` : null,
      `  data-hushpay-label="${label}"`,
    ]
      .filter(Boolean)
      .join("\n");
    return `<script src="https://hushcash.xyz/plug.js"></script>\n<button\n${attrs}\n>\n  ${label}\n</button>`;
  }
  const props = [
    `  to="${to}"`,
    cfg.amount ? `  amount="${cfg.amount}"` : null,
    cfg.note ? `  note="${cfg.note}"` : null,
    `  label="${label}"`,
    `  onSuccess={(data) => console.log("paid", data)}`,
  ]
    .filter(Boolean)
    .join("\n");
  return `import { HushPay } from "@hushcash/plug";\n\n<HushPay\n${props}\n/>`;
}

const inp =
  "w-full bg-bg border border-line-2 rounded-xl px-3 py-2.5 text-white-2 text-sm outline-none focus:border-primary transition-colors placeholder:text-white-4/40";

export default function PlugPlayground() {
  const [cfg, setCfg] = useState<Cfg>({
    to: "",
    amount: "",
    note: "",
    label: "Pay with HushCash",
  });
  const [tab, setTab] = useState<Tab>("script");
  const [lastSuccess, setLastSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const code = snippet(tab, cfg);

  function copy() {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="min-h-screen bg-bg text-white">
      {/* Nav */}
      <header
        className="px-6 py-4 flex items-center gap-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={26} height={26} className="rounded-lg" />
        <span className="text-sm font-semibold">HushCash</span>
        <span className="text-white-4 text-sm">/</span>
        <span className="text-sm text-white-3">Plug</span>
        <a
          href="https://hushcash.xyz"
          className="ml-auto text-xs text-white-4 hover:text-white-3 transition-colors flex items-center gap-1"
        >
          hushcash.xyz
          <ArrowSquareOutIcon size={11} />
        </a>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Left: Config ── */}
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">HushCash Plug</h1>
            <p className="text-sm text-white-3">
              Embed a &ldquo;Pay with HushCash&rdquo; button on any site. Configure below, then copy the snippet.
            </p>
          </div>

          <div className="hush-card p-5 space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white-4">Configuration</p>

            <div>
              <label className="text-xs text-white-4 mb-1.5 block">Recipient *</label>
              <input
                value={cfg.to}
                onChange={(e) => setCfg((c) => ({ ...c, to: e.target.value }))}
                placeholder="0x wallet address"
                className={inp}
              />
            </div>

            <div>
              <label className="text-xs text-white-4 mb-1.5 block">
                Amount <span className="text-white-4/50">(optional)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={cfg.amount}
                  onChange={(e) => setCfg((c) => ({ ...c, amount: e.target.value }))}
                  placeholder="Leave blank — user sets amount"
                  min="0.01"
                  step="0.01"
                  className={inp + " pr-14"}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white-4 font-semibold">
                  USDC
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs text-white-4 mb-1.5 block">
                Note <span className="text-white-4/50">(optional)</span>
              </label>
              <input
                value={cfg.note}
                onChange={(e) => setCfg((c) => ({ ...c, note: e.target.value }))}
                placeholder="e.g. Coffee ☕"
                maxLength={200}
                className={inp}
              />
            </div>

            <div>
              <label className="text-xs text-white-4 mb-1.5 block">Button label</label>
              <input
                value={cfg.label}
                onChange={(e) => setCfg((c) => ({ ...c, label: e.target.value }))}
                placeholder="Pay with HushCash"
                className={inp}
              />
            </div>
          </div>

          {/* How it works */}
          <div className="hush-card p-5 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white-4">How it works</p>
            {[
              ["1", "User clicks your button on any site"],
              ["2", "HushCash popup opens — sign in + confirm payment"],
              ["3", "onSuccess fires with transaction ID"],
            ].map(([n, text]) => (
              <div key={n} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {n}
                </div>
                <p className="text-sm text-white-3">{text}</p>
              </div>
            ))}
          </div>

          {/* onSuccess result */}
          {lastSuccess && (
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)" }}
            >
              <p className="text-xs font-semibold text-green-400 mb-2">onSuccess fired</p>
              <pre className="text-xs font-mono text-green-300 whitespace-pre-wrap break-all">
                {lastSuccess}
              </pre>
            </div>
          )}
        </div>

        {/* ── Right: Preview + Code ── */}
        <div className="space-y-5">
          {/* Live preview */}
          <div className="hush-card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white-4 mb-4">
              Live preview
            </p>
            <div
              className="flex items-center justify-center py-10 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <button
                onClick={() =>
                  openPlug(buildPopupUrl(cfg), (data) =>
                    setLastSuccess(JSON.stringify(data, null, 2))
                  )
                }
                className="flex items-center gap-2.5 px-5 py-3 bg-primary hover:bg-primary-h text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.97]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="" width={22} height={22} className="rounded-md" />
                {cfg.label || "Pay with HushCash"}
              </button>
            </div>
            <p className="text-[11px] text-white-4 mt-3 text-center">
              Click to open the live payment popup
            </p>
          </div>

          {/* Code snippet */}
          <div className="hush-card overflow-hidden">
            <div className="flex items-center gap-1 px-4 pt-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {(["script", "react"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    tab === t
                      ? "bg-primary/20 text-primary"
                      : "text-white-4 hover:text-white-3"
                  }`}
                >
                  {t === "script" ? "Script tag" : "React component"}
                </button>
              ))}
              <button
                onClick={copy}
                className="ml-auto flex items-center gap-1.5 text-xs text-white-4 hover:text-white-3 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.04]"
              >
                {copied ? <CheckIcon size={12} className="text-up" /> : <CopyIcon size={12} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="p-4 overflow-x-auto">
              <pre className="text-[12px] leading-relaxed font-mono text-white-3 whitespace-pre">
                {code}
              </pre>
            </div>
          </div>

          {/* npm note for React tab */}
          {tab === "react" && (
            <div
              className="rounded-2xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <p className="text-xs text-white-4">
                <span className="text-white-3 font-medium">Coming soon:</span> npm package{" "}
                <code className="font-mono text-primary">@hushcash/plug</code>. For now, use the{" "}
                <button className="underline" onClick={() => setTab("script")}>
                  script tag
                </button>{" "}
                embed.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
