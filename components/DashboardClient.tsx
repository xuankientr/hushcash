"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Gift, ReceiptText } from "lucide-react";
import { BalanceCard } from "./BalanceCard";
import { TransactionList } from "./TransactionList";
import { SendModal } from "./SendModal";
import { RequestModal } from "./RequestModal";

type Modal = null | "send" | "request";

const actionClass = "flex min-h-16 items-center gap-2 rounded-lg border border-line px-2.5 sm:gap-3 sm:px-3 py-2 text-left font-medium text-white transition-colors hover:border-blue-400/40 hover:bg-blue-400/10";
const iconClass = "shrink-0 rounded-md bg-blue-400/10 p-2 text-blue-300";

export function DashboardClient({
  transfers,
}: {
  transfers: React.ComponentProps<typeof TransactionList>["transfers"];
}) {
  const [modal, setModal] = useState<Modal>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Wallet overview</h1>
          <p className="mt-1 text-white-3">Manage your USDC payments on Arc.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-medium text-blue-200">
          <span className="size-1.5 rounded-full bg-blue-300" /> Arc testnet
        </span>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <BalanceCard />
        <section className="hush-card p-4 sm:p-5" aria-labelledby="payment-actions">
          <h2 id="payment-actions" className="mb-4 text-base font-semibold text-white">Payments</h2>
          <div className="grid grid-cols-2 gap-2.5">
            <button type="button" onClick={() => setModal("send")} className={`${actionClass} border-blue-400/40 bg-blue-400/10`}>
              <ArrowUpRight size={34} className={iconClass} /> Send
            </button>
            <button type="button" onClick={() => setModal("request")} className={actionClass}>
              <ArrowDownLeft size={34} className={iconClass} /> Request
            </button>
            <Link href="/invoice/new" className={actionClass}>
              <ReceiptText size={34} className={iconClass} /> Invoice
            </Link>
            <Link href="/drop" className={actionClass}>
              <Gift size={34} className={iconClass} /> Drop Cash
            </Link>
          </div>
          <Link href="/plug" className="mt-3 inline-block text-xs text-blue-200 hover:underline">Embed payments with The Plug</Link>
        </section>
      </div>

      <div className="mt-6">
        <TransactionList transfers={transfers} />
      </div>

      {modal === "send" && <SendModal onClose={() => setModal(null)} />}
      {modal === "request" && <RequestModal onClose={() => setModal(null)} />}
    </div>
  );
}
