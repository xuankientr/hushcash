"use client";

import { useState } from "react";
import { ArrowCircleDownIcon, CopyIcon, CheckIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";

export function DepositForm() {
  const [copied, setCopied] = useState(false);
  const { data } = useQuery({
    queryKey: ["wallet-address"],
    queryFn: () => fetch("/api/wallet/address").then((r) => r.json()),
  });
  const address: string = data?.address ?? "";

  async function copy() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="hush-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <ArrowCircleDownIcon size={15} weight="duotone" className="text-up" />
        <h2 className="text-sm font-semibold text-white-2">Deposit USDC</h2>
      </div>
      <p className="text-xs text-white-3 leading-relaxed">Send USDC to your wallet address below on Arc (Arbitrum Sepolia).</p>
      <div>
        <p className="text-xs text-white-4 mb-2">Your wallet address</p>
        <div className="flex items-center gap-2 bg-black/30 border border-white/[0.07] rounded-xl px-3.5 py-2.5">
          <p className="flex-1 text-xs font-mono text-white-2 truncate">{address || "Loading..."}</p>
          <button onClick={copy} className="flex-shrink-0 p-1 rounded-lg text-white-4 hover:text-white-2 transition-colors">
            {copied ? <CheckIcon size={13} weight="bold" className="text-up" /> : <CopyIcon size={13} />}
          </button>
        </div>
      </div>
    </div>
  );
}
