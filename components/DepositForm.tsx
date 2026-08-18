"use client";

import { useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import {
  ArrowCircleDownIcon, CopyIcon, CheckIcon,
  CheckCircleIcon, WarningIcon, ArrowSquareOutIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";

const ARC_CHAIN_ID = "0x4CEDD2"; // 5042002
const ARC_PARAMS = {
  chainId: ARC_CHAIN_ID,
  chainName: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: ["https://rpc.testnet.arc.io"],
  blockExplorerUrls: ["https://testnet.arcscan.app"],
};

function usdcToWei(usdc: string): string {
  const val = parseFloat(usdc);
  if (isNaN(val) || val <= 0) return "0x0";
  return "0x" + BigInt(Math.round(val * 1e18)).toString(16);
}

export function DepositForm() {
  const { wallets } = useWallets();
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "switching" | "sending" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const { data } = useQuery({
    queryKey: ["wallet-address"],
    queryFn: () => fetch("/api/wallet/address").then((r) => r.json()),
  });
  const hushAddress: string = data?.address ?? "";

  // External wallet connected during sign-in (MetaMask, Rabby, etc.)
  const externalWallet = wallets.find((w) => w.walletClientType !== "privy");

  async function copy() {
    if (!hushAddress) return;
    await navigator.clipboard.writeText(hushAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function sendDeposit() {
    if (!externalWallet || !hushAddress || !amount) return;
    setStatus("switching");
    setErrMsg("");
    try {
      const provider = await externalWallet.getEthereumProvider();

      // Switch to Arc Testnet if needed
      try {
        await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: ARC_CHAIN_ID }] });
      } catch (switchErr: unknown) {
        if ((switchErr as { code?: number })?.code === 4902) {
          await provider.request({ method: "wallet_addEthereumChain", params: [ARC_PARAMS] });
        } else throw switchErr;
      }

      setStatus("sending");
      const hash = (await provider.request({
        method: "eth_sendTransaction",
        params: [{
          from: externalWallet.address,
          to: hushAddress,
          value: usdcToWei(amount),
        }],
      })) as string;

      setTxHash(hash);
      setStatus("success");
      setAmount("");
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message ?? "Transaction failed";
      setErrMsg(msg.toLowerCase().includes("user denied") || msg.toLowerCase().includes("rejected")
        ? "Transaction cancelled"
        : msg);
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
        <div className="rounded-2xl p-4 space-y-1.5" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)" }}>
          <div className="flex items-center gap-2">
            <CheckCircleIcon size={15} weight="duotone" className="text-up" />
            <p className="text-sm font-semibold text-up">Deposit sent!</p>
          </div>
          {txHash && (
            <a href={`https://testnet.arcscan.app/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] font-mono text-up/60 hover:text-up/80 underline">
              {txHash.slice(0, 18)}…{txHash.slice(-6)}
              <ArrowSquareOutIcon size={10} />
            </a>
          )}
          <p className="text-[11px] text-up/50">Balance updates in a few seconds.</p>
        </div>
      )}

      {/* Error */}
      {status === "error" && errMsg && (
        <div className="rounded-xl px-3 py-2.5 flex items-start gap-2"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)" }}>
          <WarningIcon size={13} className="text-down flex-shrink-0 mt-0.5" />
          <p className="text-xs text-down">{errMsg}</p>
        </div>
      )}

      {externalWallet ? (
        /* ── Has external wallet from sign-in ── */
        <div className="space-y-3">
          {/* Wallet badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-2 h-2 rounded-full bg-up flex-shrink-0" />
            <p className="text-xs text-white-3 font-mono truncate flex-1">
              {externalWallet.address.slice(0, 8)}…{externalWallet.address.slice(-6)}
            </p>
            <span className="text-[11px] text-white-4 capitalize">{externalWallet.walletClientType}</span>
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
            disabled={!amount || parseFloat(amount) <= 0 || status === "sending" || status === "switching"}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl bg-up hover:bg-up/90 text-white text-sm font-semibold transition-all disabled:opacity-40"
          >
            <ArrowCircleDownIcon size={15} weight="fill" />
            {status === "switching" ? "Switching to Arc…"
              : status === "sending" ? "Confirm in wallet…"
              : amount ? `Deposit ${amount} USDC`
              : "Deposit"}
          </button>

          <Divider />
          <AddressBox address={hushAddress} copied={copied} onCopy={copy} />
        </div>
      ) : (
        /* ── Email / embedded wallet user ── */
        <div className="space-y-3">
          <p className="text-xs text-white-3 leading-relaxed">
            Send USDC to your address below on Arc Testnet, or get free testnet USDC from the faucet.
          </p>

          <a
            href="https://faucet.circle.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/10 transition-all"
          >
            Get testnet USDC
            <ArrowSquareOutIcon size={13} />
          </a>

          <Divider />
          <AddressBox address={hushAddress} copied={copied} onCopy={copy} />
        </div>
      )}
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-px bg-white/[0.06]" />
      <span className="text-[11px] text-white-4">or copy address</span>
      <div className="flex-1 h-px bg-white/[0.06]" />
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
