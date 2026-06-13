"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  CopyIcon, CheckIcon, SignOutIcon, XIcon,
  ArrowDownIcon, ArrowUpIcon, CheckCircleIcon,
} from "@phosphor-icons/react";
import { formatUsdc, shortenAddress } from "@/lib/utils";
import { TransactionList } from "./TransactionList";

type Tab = "wallet" | "activity";

type Transfer = {
  id: string; createdAt: Date; amountUsdc: string;
  note: string | null; toAddress: string | null;
  status: string; direction: "sent" | "received";
  txHash?: string | null;
};

interface Props {
  walletAddress: string | null;
  displayName: string | null;
  totalSent: string;
  totalReceived: string;
  totalRequested: string;
  totalClaimed: string;
  transfers: Transfer[];
}

function DepositModal({ walletAddress, onClose }: { walletAddress: string | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-card rounded-t-3xl sm:rounded-3xl border border-white/[0.08]"
        style={{ boxShadow: "0 -8px 48px rgba(0,0,0,0.6)" }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <ArrowDownIcon size={16} weight="bold" />
            <span>Deposit</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.06] text-white-4 hover:text-white transition-colors">
            <XIcon size={14} weight="bold" />
          </button>
        </div>
        <div className="px-5 pb-5 space-y-3">
          <p className="text-xs text-white-4 leading-relaxed">
            Send USDC to your wallet address on <span className="text-white-3">Arc Testnet</span>.
          </p>
          <div className="flex items-center gap-2 bg-black/30 border border-white/[0.07] rounded-2xl px-4 py-3">
            <p className="flex-1 text-xs font-mono text-white-2 truncate">
              {walletAddress ?? "Setting up wallet..."}
            </p>
            <button onClick={handleCopy} className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-white-4 hover:text-white transition-colors">
              {copied ? <CheckIcon size={13} weight="bold" className="text-up" /> : <CopyIcon size={13} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WithdrawModal({ onClose }: { onClose: () => void }) {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError(""); setLoading(true);
    const res = await fetch("/api/transfer", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: address, amountUsdc: amount }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Withdrawal failed"); return; }
    setSuccess(true);
    setTimeout(() => onClose(), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-card rounded-t-3xl sm:rounded-3xl border border-white/[0.08]"
        style={{ boxShadow: "0 -8px 48px rgba(0,0,0,0.6)" }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <ArrowUpIcon size={16} weight="bold" />
            <span>Withdraw</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.06] text-white-4 hover:text-white transition-colors">
            <XIcon size={14} weight="bold" />
          </button>
        </div>
        <div className="px-5 pb-5 space-y-3">
          {success ? (
            <div className="py-6 text-center">
              <CheckCircleIcon size={40} weight="duotone" className="text-up mx-auto mb-3" />
              <p className="text-sm font-semibold text-white">Withdrawal initiated</p>
            </div>
          ) : (
            <>
              <input value={address} onChange={(e) => setAddress(e.target.value)}
                placeholder="Destination address (0x...)"
                className="w-full rounded-2xl px-4 py-3 text-sm font-mono text-white-2 placeholder:text-white-4/50 outline-none" />
              <div className="relative">
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00" min="0.01" step="0.01"
                  className="w-full rounded-2xl px-4 py-3 text-sm text-white-2 pr-16 outline-none" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white-4 font-semibold">USDC</span>
              </div>
              {error && <div className="rounded-xl bg-down/10 border border-down/20 px-4 py-2.5"><p className="text-xs text-down">{error}</p></div>}
              <button onClick={handleSubmit} disabled={!address || !amount || loading}
                className="w-full h-12 rounded-2xl border border-white/[0.12] text-white text-sm font-semibold hover:bg-white/[0.05] transition-all disabled:opacity-30">
                {loading ? "Processing..." : "Withdraw"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function SettingsClient({ walletAddress, displayName, totalSent, totalReceived, totalRequested, totalClaimed, transfers }: Props) {
  const [tab, setTab] = useState<Tab>("wallet");
  const [copied, setCopied] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const { logout } = usePrivy();
  const router = useRouter();

  const { data: balanceData } = useQuery({
    queryKey: ["balance"],
    queryFn: () => fetch("/api/wallet/balance").then((r) => r.json()),
    refetchInterval: 30000,
  });
  const balance = balanceData?.balance ?? "0";
  const balanceUsd = parseFloat(balance).toFixed(2);

  async function handleCopy() {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  const identifier = walletAddress
    ? shortenAddress(walletAddress)
    : displayName ?? "User";

  return (
    <>
      <div className="max-w-sm mx-auto px-5 pt-14 space-y-5">
        {/* Logo */}
        <div className="flex justify-center mb-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="HushCash" width={32} height={32} className="rounded-xl" />
        </div>

        {/* Address bar */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-mono font-medium text-white-2">{identifier}</span>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.06] text-white-3 hover:text-white transition-colors">
              {copied ? <CheckIcon size={14} weight="bold" className="text-up" /> : <CopyIcon size={14} />}
            </button>
            <button onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-down/10 text-down hover:bg-down/20 transition-colors">
              <SignOutIcon size={14} weight="bold" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-black/30 rounded-2xl p-1 gap-1 border border-white/[0.06]">
          {(["wallet", "activity"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all ${tab === t ? "bg-white/[0.1] text-white" : "text-white-4 hover:text-white-2"}`}>
              {t === "wallet" ? "Wallet" : "Activity"}
            </button>
          ))}
        </div>

        {tab === "wallet" && (
          <div className="space-y-4">
            {/* Balance */}
            <div className="text-center py-2">
              <p className="text-[11px] text-white-4 uppercase tracking-widest mb-2">Total Balance</p>
              <p className="text-[44px] font-bold text-white tracking-tight leading-none">${balanceUsd}</p>
            </div>

            {/* Assets */}
            <div className="hush-card">
              <div className="flex items-center gap-3 px-4 py-3.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/USDC_Logo.png" alt="USDC" width={36} height={36} className="rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">USDC</p>
                  <p className="text-[11px] text-white-4">{balance} USDC</p>
                </div>
                <p className="text-sm font-semibold text-white">${balanceUsd}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="hush-card divide-y divide-white/[0.04]">
              {[
                { label: "Sent", value: totalSent },
                { label: "Received", value: totalReceived },
                { label: "Requested", value: totalRequested },
                { label: "Claimed", value: totalClaimed },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3">
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-sm text-white-3">{formatUsdc(value)} USDC</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => setShowDeposit(true)}
                className="flex-1 h-12 rounded-2xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all active:scale-[0.97]">
                Deposit
              </button>
              <button onClick={() => setShowWithdraw(true)}
                className="flex-1 h-12 rounded-2xl border border-white/[0.12] text-white text-sm font-semibold hover:bg-white/[0.05] transition-all active:scale-[0.97]">
                Withdraw
              </button>
            </div>
          </div>
        )}

        {tab === "activity" && (
          <TransactionList transfers={transfers} />
        )}
      </div>

      {showDeposit && <DepositModal walletAddress={walletAddress} onClose={() => setShowDeposit(false)} />}
      {showWithdraw && <WithdrawModal onClose={() => setShowWithdraw(false)} />}
    </>
  );
}