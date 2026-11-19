"use client";

import { useState, useCallback, useEffect } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  CopyIcon, CheckIcon, SignOutIcon, XIcon,
  ArrowDownIcon, ArrowUpIcon, CheckCircleIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";
import { formatUsdc, shortenAddress, isValidUsername } from "@/lib/utils";
import { markActivityRead } from "@/hooks/useUnreadCount";
import { TransactionList } from "./TransactionList";

const ARC_CHAIN_ID = "0x4CEF52"; // Arc Testnet chain ID 5042002
const ARC_PARAMS = {
  chainId: ARC_CHAIN_ID, chainName: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: ["https://rpc.testnet.arc.network"],
  blockExplorerUrls: ["https://testnet.arcscan.app"],
};
function usdcToWei(usdc: string): string {
  const val = parseFloat(usdc);
  if (isNaN(val) || val <= 0) return "0x0";
  return "0x" + BigInt(Math.round(val * 1e18)).toString(16);
}

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
  const { wallets } = useWallets();
  const [copied, setCopied] = useState(false);
  const [amount, setAmount]   = useState("");
  const [status, setStatus]   = useState<"idle" | "switching" | "sending" | "success" | "error">("idle");
  const [txHash, setTxHash]   = useState("");
  const [errMsg, setErrMsg]   = useState("");

  const externalWallet = wallets.find((w: { walletClientType: string }) => w.walletClientType !== "privy");

  async function handleCopy() {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function sendDeposit() {
    if (!externalWallet || !walletAddress || !amount) return;
    setStatus("switching"); setErrMsg("");
    try {
      const provider = await externalWallet.getEthereumProvider();
      try {
        await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: ARC_CHAIN_ID }] });
      } catch (e: unknown) {
        if ((e as { code?: number })?.code === 4902) {
          await provider.request({ method: "wallet_addEthereumChain", params: [ARC_PARAMS] });
          await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: ARC_CHAIN_ID }] });
        } else throw e;
      }
      setStatus("sending");
      const gasPrice = await provider.request({ method: "eth_gasPrice" }) as string;
      const hash = (await provider.request({
        method: "eth_sendTransaction",
        params: [{ from: externalWallet.address, to: walletAddress, value: usdcToWei(amount), gas: "0x5208", gasPrice }],
      })) as string;
      setTxHash(hash); setStatus("success"); setAmount("");
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message ?? "Failed";
      setErrMsg(msg.toLowerCase().includes("denied") || msg.toLowerCase().includes("rejected") ? "Transaction cancelled" : msg);
      setStatus("error");
    }
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
          <button onClick={onClose} className="w-11 h-11 flex items-center justify-center rounded-full bg-white/[0.06] text-white-4 hover:text-white transition-colors">
            <XIcon size={14} weight="bold" />
          </button>
        </div>

        <div className="px-5 space-y-3" style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>

          {/* Success */}
          {status === "success" && (
            <div className="rounded-2xl p-3 space-y-1" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)" }}>
              <div className="flex items-center gap-2">
                <CheckIcon size={13} weight="bold" className="text-up" />
                <p className="text-sm font-semibold text-up">Deposit sent!</p>
              </div>
              {txHash && (
                <a href={`https://testnet.arcscan.app/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                  className="text-[11px] font-mono text-up/60 hover:text-up/80 underline break-all">
                  {txHash.slice(0, 18)}…{txHash.slice(-6)}
                </a>
              )}
            </div>
          )}

          {/* Error */}
          {status === "error" && errMsg && (
            <div className="rounded-xl px-3 py-2 text-xs text-down" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)" }}>
              {errMsg}
            </div>
          )}

          {externalWallet ? (
            <>
              {/* Wallet badge */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="w-2 h-2 rounded-full bg-up" />
                <p className="text-xs font-mono text-white-3 truncate flex-1">{externalWallet.address.slice(0, 8)}…{externalWallet.address.slice(-6)}</p>
                <span className="text-[11px] text-white-4 capitalize">{externalWallet.walletClientType}</span>
              </div>
              {/* Amount input */}
              <div className="relative">
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00" min="0.01" step="0.01"
                  className="w-full bg-bg border border-line-2 rounded-2xl px-4 py-3 text-white-2 text-sm pr-16 outline-none focus:border-primary transition-colors" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white-4 font-semibold">USDC</span>
              </div>
              <button onClick={sendDeposit} disabled={!amount || parseFloat(amount) <= 0 || status === "sending" || status === "switching"}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-up hover:bg-up/90 text-white text-sm font-semibold transition-all disabled:opacity-40">
                <ArrowDownIcon size={14} weight="bold" />
                {status === "switching" ? "Switching to Arc…" : status === "sending" ? "Confirm in wallet…" : amount ? `Deposit ${amount} USDC` : "Deposit"}
              </button>
            </>
          ) : (
            <>
              <p className="text-xs text-white-4 leading-relaxed">
                No wallet connected — get free testnet USDC from the faucet, or copy your address below.
              </p>
              <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/10 transition-all">
                Get testnet USDC ↗
              </a>
            </>
          )}

          {/* Divider + address */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[11px] text-white-4">or copy address</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>
          <div className="flex items-center gap-2 bg-black/30 border border-white/[0.07] rounded-2xl px-4 py-3">
            <p className="flex-1 text-xs font-mono text-white-2 truncate">{walletAddress ?? "Setting up…"}</p>
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
  const { wallets } = useWallets();
  const [manualAddress, setManualAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const externalWallet = wallets.find((w: { walletClientType: string }) => w.walletClientType !== "privy");
  const destination = externalWallet?.address ?? manualAddress;

  async function handleSubmit() {
    if (!destination || !amount) return;
    setError(""); setLoading(true);
    const res = await fetch("/api/transfer", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: destination, amountUsdc: amount }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Withdrawal failed"); return; }
    setSuccess(true);
    setTimeout(() => onClose(), 2500);
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
          <button onClick={onClose} className="w-11 h-11 flex items-center justify-center rounded-full bg-white/[0.06] text-white-4 hover:text-white transition-colors">
            <XIcon size={14} weight="bold" />
          </button>
        </div>
        <div className="px-5 space-y-3" style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>
          {success ? (
            <div className="py-6 text-center">
              <CheckCircleIcon size={40} weight="duotone" className="text-up mx-auto mb-3" />
              <p className="text-sm font-semibold text-white">Withdrawal initiated</p>
              <p className="text-xs text-white-4 mt-1">USDC on its way to your wallet</p>
            </div>
          ) : (
            <>
              {externalWallet ? (
                /* Wallet user — auto-fill destination */
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="w-2 h-2 rounded-full bg-up flex-shrink-0" />
                  <p className="text-xs text-white-3 font-mono truncate flex-1">
                    {externalWallet.address.slice(0, 8)}…{externalWallet.address.slice(-6)}
                  </p>
                  <span className="text-[11px] text-white-4 capitalize">{externalWallet.walletClientType}</span>
                </div>
              ) : (
                /* Email user — manual address entry */
                <input value={manualAddress} onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="Destination address (0x...)"
                  className="w-full rounded-2xl px-4 py-3 text-sm font-mono text-white-2 placeholder:text-white-4/50 outline-none" />
              )}

              <div className="relative">
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00" min="0.01" step="0.01"
                  className="w-full bg-bg border border-line-2 rounded-2xl px-4 py-3 text-white-2 text-sm pr-16 outline-none focus:border-primary transition-colors" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white-4 font-semibold">USDC</span>
              </div>

              {error && (
                <div className="rounded-xl bg-down/10 border border-down/20 px-4 py-2.5">
                  <p className="text-xs text-down">{error}</p>
                </div>
              )}

              <button onClick={handleSubmit} disabled={!destination || !amount || parseFloat(amount) <= 0 || loading}
                className="w-full h-12 rounded-2xl border border-white/[0.12] text-white text-sm font-semibold hover:bg-white/[0.05] transition-all disabled:opacity-30">
                {loading ? "Processing…" : amount ? `Withdraw ${amount} USDC` : "Withdraw"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function UsernameEditor({ current }: { current: string | null }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(current ?? "");
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [saving, setSaving] = useState(false);

  const check = useCallback(async (v: string) => {
    if (!isValidUsername(v)) { setStatus("invalid"); return; }
    if (v === current) { setStatus("available"); return; }
    setStatus("checking");
    try {
      const res = await fetch(`/api/user/username?check=${encodeURIComponent(v)}`);
      const data = await res.json();
      setStatus(data.available ? "available" : "taken");
    } catch { setStatus("idle"); }
  }, [current]);

  useEffect(() => {
    if (!editing) return;
    const t = setTimeout(() => check(value), 400);
    return () => clearTimeout(t);
  }, [value, editing, check]);

  async function handleSave() {
    if (status !== "available") return;
    setSaving(true);
    const res = await fetch("/api/user/username", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: value }),
    });
    setSaving(false);
    if (res.ok) { setEditing(false); router.refresh(); }
    else setStatus("taken");
  }

  const statusColor = { idle: "", checking: "text-white-4", available: "text-green-400", taken: "text-red-400", invalid: "text-yellow-400" }[status];
  const statusText = { idle: "", checking: "Checking...", available: "✓ Available", taken: "Already taken", invalid: "3–20 chars, letters/numbers/_" }[status];

  if (!editing) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-white-4 mb-0.5">Username</p>
          <p className="text-sm font-semibold text-white">
            {current ? `@${current}` : <span className="text-white-4 font-normal">Not set</span>}
          </p>
        </div>
        <button onClick={() => { setEditing(true); setValue(current ?? ""); setStatus("idle"); }}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-white/[0.06] text-white-4 hover:text-white transition-colors">
          <PencilSimpleIcon size={13} weight="bold" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-white-4">Username</p>
      <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.10] focus-within:border-primary/50 transition-colors">
        <span className="text-white-4 text-sm select-none">@</span>
        <input autoFocus value={value}
          onChange={(e) => setValue(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
          maxLength={20} className="flex-1 bg-transparent text-white text-sm outline-none" />
      </div>
      {statusText && <p className={`text-[11px] ${statusColor}`}>{statusText}</p>}
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={status !== "available" || saving}
          className="flex-1 h-9 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-h transition-all disabled:opacity-40">
          {saving ? "Saving..." : "Save"}
        </button>
        <button onClick={() => setEditing(false)}
          className="h-9 px-4 rounded-xl border border-white/[0.08] text-white-4 text-xs hover:text-white transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

export function SettingsClient({ walletAddress, displayName, totalSent, totalReceived, totalRequested, totalClaimed, transfers: initialTransfers }: Props) {
  const [tab, setTab] = useState<Tab>("wallet");
  const [copied, setCopied] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [transfers, setTransfers] = useState(initialTransfers);
  const [syncing, setSyncing] = useState(false);
  const { logout } = usePrivy();
  const router = useRouter();

  async function syncActivity() {
    setSyncing(true);
    try {
      const res = await fetch("/api/transfer/sync", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setTransfers(data.transfers);
      }
    } catch { /* non-blocking */ } finally {
      setSyncing(false);
    }
  }

  function openActivityTab() {
    setTab("activity");
    markActivityRead();
    syncActivity();
  }

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

  return (
    <>
      <div className="max-w-sm mx-auto px-5 pt-14 space-y-5">
        {/* Logo */}
        <div className="flex justify-center mb-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="HushCash" width={32} height={32} className="rounded-xl" />
        </div>

        {/* Profile */}
        <div className="hush-card p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <UsernameEditor current={displayName} />
            </div>
            <button onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-down/10 text-down hover:bg-down/20 transition-colors flex-shrink-0 mt-0.5">
              <SignOutIcon size={14} weight="bold" />
            </button>
          </div>

          {walletAddress && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-white-4 mb-0.5">Wallet</p>
                <p className="text-sm font-mono text-white-2">{shortenAddress(walletAddress)}</p>
              </div>
              <button onClick={handleCopy}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white/[0.06] text-white-4 hover:text-white transition-colors">
                {copied ? <CheckIcon size={13} weight="bold" className="text-up" /> : <CopyIcon size={13} />}
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-black/30 rounded-2xl p-1 gap-1 border border-white/[0.06]">
          {(["wallet", "activity"] as Tab[]).map((t) => (
            <button key={t} onClick={() => t === "activity" ? openActivityTab() : setTab(t)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all ${tab === t ? "bg-white/[0.1] text-white" : "text-white-4 hover:text-white-2"}`}>
              {t === "wallet" ? "Wallet" : syncing && tab === "activity" ? "Syncing…" : "Activity"}
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
          <TransactionList transfers={transfers} compact />
        )}
      </div>

      {showDeposit && <DepositModal walletAddress={walletAddress} onClose={() => setShowDeposit(false)} />}
      {showWithdraw && <WithdrawModal onClose={() => setShowWithdraw(false)} />}
    </>
  );
}