import { formatUsdc, shortenAddress } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, ExternalLink, History } from "lucide-react";

const ARC_EXPLORER = "https://testnet.arcscan.app/tx";

type Transfer = {
  id: string;
  createdAt: Date;
  amountUsdc: string;
  note: string | null;
  toAddress: string | null;
  status: string;
  direction: "sent" | "received";
  txHash?: string | null;
};

const statusStyles: Record<string, { label: string; color: string }> = {
  COMPLETE: { label: "Completed", color: "bg-up/10 text-green-300" },
  PENDING: { label: "Pending", color: "bg-warn/10 text-amber-300" },
  FAILED: { label: "Failed", color: "bg-down/10 text-red-300" },
};

const dateFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" });

const columns = "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-5";

export function TransactionList({ transfers, compact = false }: { transfers: Transfer[]; compact?: boolean }) {
  const rowClass = compact ? columns : `${columns} md:grid-cols-[minmax(0,1fr)_7rem_7rem_8rem]`;

  return (
    <section className="hush-card" aria-label="Recent activity">
      <div className="flex items-center gap-2.5 px-4 py-4 sm:px-5">
        <History size={17} className="text-blue-300" />
        <h2 className="text-base font-semibold text-white">Recent activity</h2>
      </div>
      {transfers.length === 0 ? (
        <div className="border-t border-line px-4 py-10 text-center">
          <span className="mx-auto mb-3 grid size-11 place-items-center rounded-lg bg-blue-400/10 text-blue-300">
            <History size={20} />
          </span>
          <p className="font-medium text-white-2">No activity yet</p>
          <p className="mt-1 text-sm text-white-3">Your USDC transfers will appear here.</p>
        </div>
      ) : (
        <>
          {!compact && <div className={`${rowClass} hidden border-y border-line bg-bg/30 py-2.5 text-xs font-medium text-white-3 md:grid`} aria-hidden="true">
            <span>Transfer</span><span>Status</span><span>Date</span><span className="text-right">Amount</span>
          </div>}
          <ul className="max-h-[480px] divide-y divide-line overflow-y-auto">
            {transfers.map((transfer) => {
              const sent = transfer.direction === "sent";
              const Icon = sent ? ArrowUpRight : ArrowDownLeft;
              const status = statusStyles[transfer.status] ?? { label: transfer.status, color: "bg-white/5 text-white-3" };
              const date = new Date(transfer.createdAt);
              const amount = `${sent ? "−" : "+"}${formatUsdc(transfer.amountUsdc)}`;
              return (
                <li key={`${transfer.direction}-${transfer.id}`} className={`${rowClass} py-3 hover:bg-white/[0.025]`}>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-blue-400/10 text-blue-300">
                      <Icon size={17} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-white-2">{sent ? "Sent" : "Received"}</p>
                      <p className="truncate text-xs text-white-3">
                        {transfer.toAddress ? shortenAddress(transfer.toAddress) : transfer.note ?? "USDC"}
                      </p>
                      <div className={compact ? "mt-1" : "mt-1 md:hidden"}>
                        <span className={`badge ${status.color}`}>{status.label}</span>
                      </div>
                    </div>
                  </div>
                  {!compact && <div className="hidden md:block">
                    <span className={`badge ${status.color}`}>{status.label}</span>
                  </div>}
                  {!compact && <time className="hidden text-xs text-white-3 md:block" dateTime={date.toISOString()}>
                    {dateFormat.format(date)}
                  </time>}
                  <div className={`text-right font-semibold tabular-nums ${sent ? "text-white-2" : "text-green-300"}`}>
                    {transfer.txHash ? (
                      <a href={`${ARC_EXPLORER}/${transfer.txHash}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 hover:underline" aria-label={`View ${amount} transfer on Arc explorer`}>
                        {amount}<ExternalLink size={12} className="text-white-3" />
                      </a>
                    ) : amount}
                    <time className={`block text-xs font-normal text-white-3 ${compact ? "" : "md:hidden"}`} dateTime={date.toISOString()}>
                      {dateFormat.format(date)}
                    </time>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
