"use client";

import { useState } from "react";
import { KeyIcon, WarningIcon, EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";

export function ExportKeyForm({ walletId }: { walletId?: string | null }) {
  const [confirmed, setConfirmed] = useState(false);
  const [key, setKey] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  async function exportKey() {
    setLoading(true);
    const res = await fetch("/api/wallet/export", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setKey(data.privateKey);
  }

  return (
    <div className="hush-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <KeyIcon size={15} weight="duotone" className="text-warn" />
        <h2 className="text-sm font-semibold text-white-2">Export Private Key</h2>
      </div>
      <div className="flex items-start gap-2.5 p-3 bg-warn/5 border border-warn/20 rounded-lg">
        <WarningIcon size={15} weight="fill" className="text-warn flex-shrink-0 mt-0.5" />
        <p className="text-xs text-warn/80 leading-relaxed">
          Never share your private key. Anyone with it has full control of your wallet.
        </p>
      </div>
      {!key ? (
        <div className="space-y-3">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}
              className="rounded border-line-2 bg-bg accent-primary" />
            <span className="text-xs text-white-3">I understand the risks</span>
          </label>
          <button onClick={exportKey} disabled={!confirmed || loading || !walletId}
            className="w-full py-2.5 bg-warn/10 border border-warn/20 text-warn text-sm font-medium rounded-lg hover:bg-warn/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? "Exporting..." : "Export private key"}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white-4 font-medium">Private key</p>
            <button onClick={() => setVisible((v) => !v)} className="text-white-4 hover:text-white-2 transition-colors p-1">
              {visible ? <EyeSlashIcon size={14} /> : <EyeIcon size={14} />}
            </button>
          </div>
          <div className="bg-warn/5 border border-warn/20 rounded-lg px-3 py-2.5">
            <p className="text-xs font-mono text-warn/90 break-all">{visible ? key : "•".repeat(64)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
