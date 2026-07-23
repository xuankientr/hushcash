import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { InvoicePayWidget } from "@/components/InvoicePayWidget";
import { formatUsdc } from "@/lib/utils";

export default async function InvoicePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { code },
    include: { creator: { select: { username: true, walletAddress: true } } },
  });

  if (!invoice) notFound();

  const isPaid = invoice.status === "PAID";

  return (
    <main className="min-h-screen flex items-start justify-center px-4 pt-12 pb-20" style={{ background: "#09090f" }}>
      <div className="w-full max-w-sm space-y-4">
        {/* Header */}
        <div className="flex flex-col items-center mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="HushCash" width={36} height={36} className="rounded-xl mb-3" />
          <h1 className="text-lg font-bold text-white">Invoice</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            from {invoice.creator.username ? `@${invoice.creator.username}` : "Anonymous"}
          </p>
        </div>

        {/* Invoice card */}
        <div className="rounded-3xl border p-5 space-y-4" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          {/* Title + amount */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{invoice.title}</p>
              {invoice.description && (
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>{invoice.description}</p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold text-white">{formatUsdc(invoice.amountUsdc)}</p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>USDC</p>
            </div>
          </div>

          {/* Date */}
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            Issued {new Date(invoice.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>

          {/* Proof of work */}
          {(invoice.proofNote || invoice.proofImageUrl) && (
            <div className="rounded-2xl p-3 space-y-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>Proof of Work</p>
              {invoice.proofNote && (
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{invoice.proofNote}</p>
              )}
              {invoice.proofImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={invoice.proofImageUrl}
                  alt="Proof"
                  className="w-full rounded-xl object-cover max-h-64"
                />
              )}
            </div>
          )}

          {/* Status badge if paid */}
          {isPaid && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <p className="text-xs font-medium text-green-400">Paid {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : ""}</p>
            </div>
          )}
        </div>

        {/* Pay widget */}
        {!isPaid && (
          <InvoicePayWidget
            invoiceCode={invoice.code}
            amountUsdc={invoice.amountUsdc}
            walletAddress={invoice.creator.walletAddress}
          />
        )}

        <p className="text-center text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>
          Powered by HushCash · Private payments on Arc
        </p>
      </div>
    </main>
  );
}