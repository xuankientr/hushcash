import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CopyPaymentLink } from "@/components/PaymentActions";

export const metadata = { title: "Payment receipt · HushCash", robots: { index: false, follow: false } };

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transfer = await prisma.transfer.findUnique({
    where: { id }, select: { amountUsdc: true, confirmedAt: true, txHash: true, paymentKey: true, status: true },
  });
  if (!transfer?.paymentKey || !transfer.confirmedAt || !transfer.txHash || transfer.status !== "COMPLETE") notFound();
  const [kind, reference] = transfer.paymentKey.split(":");
  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <section className="hush-card space-y-5 p-6">
        <header>
          <p className="text-sm font-medium text-green-300">Confirmed on Arc Testnet</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Payment receipt</h1>
        </header>
        <dl className="space-y-3">
          <div><dt className="text-white-3">Amount</dt><dd className="text-2xl font-semibold text-white">{transfer.amountUsdc} USDC</dd></div>
          <div><dt className="text-white-3">Confirmed</dt><dd><time dateTime={transfer.confirmedAt.toISOString()}>{transfer.confirmedAt.toISOString().replace("T", " ").slice(0, 19)} UTC</time></dd></div>
          <div><dt className="text-white-3">{kind === "invoice" ? "Invoice reference" : "Request reference"}</dt><dd className="break-all font-mono">{reference}</dd></div>
        </dl>
        <a className="block text-blue-300 hover:underline" href={`https://testnet.arcscan.app/tx/${transfer.txHash}`}
          target="_blank" rel="noreferrer">View transaction on ArcScan</a>
        <CopyPaymentLink path={`/receipt/${id}`} label="Copy receipt link" />
      </section>
    </main>
  );
}
