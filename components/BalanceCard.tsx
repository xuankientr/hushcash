"use client";

import { useQuery } from "@tanstack/react-query";
import { formatUsdc } from "@/lib/utils";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { useState } from "react";

const controlClass = "grid size-10 place-items-center rounded-lg border border-white/10 bg-bg/40 text-white-2 hover:bg-blue-400/20 disabled:opacity-60";

export function BalanceCard() {
  const [hidden, setHidden] = useState(false);
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["balance"],
    queryFn: async () => {
      const response = await fetch("/api/wallet/balance");
      if (!response.ok) throw new Error("Balance unavailable");
      return (await response.json()) as { balance: string };
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
  });

  return (
    <section className="hush-card wallet-grid flex min-h-56 flex-col justify-between gap-5 border-blue-400/20 p-5 sm:p-6" aria-labelledby="wallet-balance">
      <div className="flex items-center justify-between gap-2">
        <h2 id="wallet-balance" className="text-sm font-medium text-blue-100">Wallet balance</h2>
        <div className="flex gap-2">
          <button type="button" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh balance" className={controlClass}>
            <span className={isFetching ? "motion-safe:animate-spin" : undefined}><RefreshCw size={15} /></span>
          </button>
          <button type="button" onClick={() => setHidden((value) => !value)} aria-label={hidden ? "Show balance" : "Hide balance"} className={controlClass}>
            {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <div aria-live="polite">
        {isLoading ? (
          <>
            <span className="sr-only">Loading balance</span>
            <div className="h-12 w-40 rounded-lg bg-white/10 motion-safe:animate-pulse" />
          </>
        ) : typeof data?.balance === "string" ? (
          <p className="break-words text-4xl font-semibold leading-none tracking-tight text-white tabular-nums sm:text-5xl">
            {hidden ? <span aria-label="Balance hidden">••••••</span> : formatUsdc(data.balance)}
          </p>
        ) : (
          <p className="text-lg font-medium text-white-2">Balance unavailable</p>
        )}
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-white-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/USDC_Logo.png" alt="" width={21} height={21} className="rounded-full" /> USDC
      </div>
    </section>
  );
}
