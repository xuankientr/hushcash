"use client";

import { useState } from "react";
import { BalanceCard } from "./BalanceCard";
import { TransactionList } from "./TransactionList";
import { SendModal } from "./SendModal";
import { RequestModal } from "./RequestModal";

type Transfer = {
  id: string; createdAt: Date; amountUsdc: string;
  note: string | null; toAddress: string | null;
  status: string; direction: "sent" | "received";
};

type Modal = null | "send" | "request";

export function DashboardClient({
  walletId,
  transfers,
}: {
  walletId?: string | null;
  transfers: Transfer[];
}) {
  const [modal, setModal] = useState<Modal>(null);

  return (
    <>
      <div className="max-w-sm mx-auto px-5 pt-12 space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="HushCash" width={36} height={36} className="rounded-xl" />
          <div>
            <h1 className="text-2xl font-bold text-white leading-tight">
              Send. Request. Claim.
            </h1>
            <p className="text-white-4 text-base mt-0.5">Privately.</p>
          </div>
        </div>

        {/* Balance */}
        <BalanceCard walletId={walletId} />

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setModal("send")}
            className="flex-1 h-12 rounded-2xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all active:scale-[0.97]"
          >
            Send
          </button>
          <button
            onClick={() => setModal("request")}
            className="flex-1 h-12 rounded-2xl border border-white/[0.12] text-white text-sm font-semibold hover:bg-white/[0.05] transition-all active:scale-[0.97]"
          >
            Request
          </button>
        </div>

        {/* Activity */}
        <TransactionList transfers={transfers} />
      </div>

      {modal === "send" && <SendModal onClose={() => setModal(null)} />}
      {modal === "request" && <RequestModal onClose={() => setModal(null)} />}
    </>
  );
}