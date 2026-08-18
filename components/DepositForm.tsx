"use client";

import { useState } from "react";
import {
  ArrowCircleDownIcon, CopyIcon, CheckIcon,
  WalletIcon, CheckCircleIcon, WarningIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";

// Arc Testnet config
const ARC_CHAIN_ID = "0x4CEDD2"; // 5042002
const ARC_PARAMS = {
  chainId: ARC_CHAIN_ID,
  chainName: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: ["https://rpc.testnet.arc.io"],
  blockExplorerUrls: ["https://testnet.arcscan.app"],
};

// USDC is native on Arc (18 decimals) — same as sending ETH on Ethereum
function usdcToWei(usdc: string): string {
  const val = parseFloat(usdc);
  if (isNaN(val) || val <= 0) return "0x0";
  return "0x" + BigInt(Math.round(val * 1e18)).toString(16);
}

export function DepositForm() {
  const [copied, setCopied] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "switching" | "sending" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const { data } = useQuery({
    queryKey: ["wallet-address"],
    queryFn: () => fetch("/api/wallet/address").then((r) => r.json()),
  });
  const hushAddress: string = data?.address ?? "";

  async function copy() {
    if (!hushAddress) return;
    await navigator.clipboard.writeText(hushAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function connectWallet() {
    const eth = (window as unknown as { ethereum?: { request: (a: unknown) => Promise<unknown> } }).ethereum;
    if (!eth) {
      setErrMsg("No wallet detected. Install MetaMask or a compatible wallet.");
      setStatus("error");
      return;
    }
    setStatus("switching");
    setErrMsg("");
    try {
      // Switch to Arc Testnet (add if not present)
      try {
        await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: ARC_CHAIN_ID }] });
      } catch (switchErr: unknown) {
        const code = (switchErr as { code?: number })?.code;
        if (code === 4902) {
          await eth.request({ method: "wallet_addEthereumChain", params: [ARC_PARAMS] });
        } else throw switchErr;
      }
      const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
      setAccount(accounts[0]);
      setStatus("idle");
    } catch (e: unknown) {
      setErrMsg((e as Error)?.message ?? "Failed to connect wallet");
      setStatus("error");
    }
  }

  async function sendDeposit() {
    const eth = (window as unknown as { ethereum?: { request: (a: unknown) => Promise<unknown> } }).ethereum;
    if (!eth || !account || !hushAddress || !amount) return;
    setStatus("sending");
    setErrMsg("");
    try {
      const hash = (await eth.request({
        method: "eth_sendTransaction",
        params: [{
          from: account,
          to: hushAddress,
          value: usdcToWei(amount),
          chainId: ARC_CHAIN_ID,
        }],
      })) as string;
      setTxHash(hash);
      setStatus("success");
      setAmount("");
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message ?? "Transaction failed";
      setErrMsg(msg.includes("User denied") ? "Transaction cancelled" : msg);
      setStatus("error");
    }
  }

  return (
    <div className="hush-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <ArrowCircleDownIcon size={15} weight="duotone" className="text-up" />
        <h2 className="text-sm font-semibold text-white-2">Deposit USDC</h2>
      </div>

      {/* Success */}
      {status === "success" && (
        <div className="rounded-2xl p-4 space-y-2" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)" }}>
          <div className="flex items-center gap-2">
            <CheckCircleIcon size={16} weight="duotone" className="text-up" />
            <p className="text-sm font-semibold text-up">Deposit sent!</p>
          </div>
          {txHash && (
            <a
              href={`https://testnet.arcscan.app/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-up/60 hover:text-up/80 underline break-all"
            >
              {txHash.slice(0, 20)}…{txHash.slice(-8)}
            </a>
          )}
          <p className="text-xs text-up/60">Balance updates may take a few seconds.</p>
        </div>
      )}

      {/* Error */}
      {status === "error" && errMsg && (
        <div className="rounded-xl px-3 py-2" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)" }}>
          <div className="flex items-center gap-2">
            <WarningIcon size={13} className="text-down flex-shrink-0" />
            <p className="text-xs text-down">{errMsg}</p>
          </div>
        </div>
      )}

      {!account ? (
        /* Not connected */
        <div className="space-y-3">
          <p className="text-xs text-white-3 leading-relaxed">
            Connect your wallet to deposit USDC directly, or copy your address below.
          </p>
          <button
            onClick={connectWallet}
            disabled={status === "switching"}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl bg-primary hover:bg-primary-h text-white text-sm font-semibold transition-all disabled:opacity-50"
          >
            <WalletIcon size={15} weight="fill" />
            {status === "switching" ? "Switching to Arc…" : "Connect Wallet"}
          </button>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[11px] text-white-4">or copy address</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>
          <AddressBox address={hushAddress} copied={copied} onCopy={copy} />
        </div>
      ) : (
        /* Connected */
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-2 h-2 rounded-full bg-up" />
            <p className="text-xs text-white-3 font-mono truncate flex-1">{account.slice(0, 8)}…{account.slice(-6)}</p>
            <button onClick={() => { setAccount(null); setStatus("idle"); }} className="text-[11px] text-white-4 hover:text-white-3">Disconnect</button>
          </div>

          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              className="w-full bg-bg border border-line-2 rounded-xl px-4 py-3 text-white-2 text-sm pr-16 outline-none focus:border-primary transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white-4 font-semibold">USDC</span>
          </div>

          <button
            onClick={sendDeposit}
            disabled={!amount || parseFloat(amount) <= 0 || status === "sending"}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl bg-up hover:bg-up/90 text-white text-sm font-semibold transition-all disabled:opacity-40"
          >
            <ArrowCircleDownIcon size={15} weight="fill" />
            {status === "sending" ? "Confirm in wallet…" : amount ? `Deposit ${amount} USDC` : "Deposit"}
          </button>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[11px] text-white-4">or copy address</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>
          <AddressBox address={hushAddress} copied={copied} onCopy={copy} />
        </div>
      )}
    </div>
  );
}

function AddressBox({ address, copied, onCopy }: { address: string; copied: boolean; onCopy: () => void }) {
  return (
    <div className="flex items-center gap-2 bg-black/30 border border-white/[0.07] rounded-xl px-3.5 py-2.5">
      <p className="flex-1 text-xs font-mono text-white-2 truncate">{address || "Loading…"}</p>
      <button onClick={onCopy} className="flex-shrink-0 p-1 rounded-lg text-white-4 hover:text-white-2 transition-colors">
        {copied ? <CheckIcon size={13} weight="bold" className="text-up" /> : <CopyIcon size={13} />}
      </button>
    </div>
  );
}
