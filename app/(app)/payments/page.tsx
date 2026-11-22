import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateAuthUser } from "@/lib/privy-server";
import { paymentKey, reconcilePayment } from "@/lib/payment-links";
import { CopyPaymentLink, RefreshPaymentStatus } from "@/components/PaymentActions";
import { NewRequestButton } from "@/components/NewRequestButton";

export default async function PaymentsPage() {
  const user = await getOrCreateAuthUser();
  if (!user) redirect("/login");

  const [invoices, requests] = await Promise.all([
    prisma.invoice.findMany({ where: { creatorId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.paymentRequest.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);
  const keys = [
    ...invoices.map((invoice) => paymentKey("invoice", invoice.code)),
    ...requests.map((request) => paymentKey("request", request.code)),
  ];
  const transfers = await prisma.transfer.findMany({
    where: { paymentKey: { in: keys } },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { username: true } } },
  });
  const pending = transfers.filter((item) => !item.confirmedAt && item.circleTransferId).slice(0, 12);
  const refreshed = new Map(await Promise.all(pending.map(async (item) => [item.id, await reconcilePayment(item)] as const)));
  const byKey = new Map(transfers.map((item) => [item.paymentKey, { item, payment: refreshed.has(item.id) ? refreshed.get(item.id) : item }]));
  const groupById = new Map<string, typeof requests>();
  for (const request of requests) {
    const key = request.splitGroup ?? request.id;
    const group = groupById.get(key);
    if (group) group.push(request);
    else groupById.set(key, [request]);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Payments</h1>
          <p className="mt-1 text-white-3">Track invoices and payment requests you created.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <NewRequestButton />
          <Link href="/invoice/new" className="rounded-lg bg-blue-400 px-4 py-2 font-semibold text-bg hover:bg-blue-300">New invoice</Link>
        </div>
      </header>

      <section className="hush-card divide-y divide-line" aria-labelledby="invoices">
        <h2 id="invoices" className="px-5 py-4 text-lg font-semibold text-white">Invoices</h2>
        {invoices.length === 0 && <p className="px-5 py-6 text-white-3">Your invoices will appear here.</p>}
        {invoices.map((invoice) => {
          const match = byKey.get(paymentKey("invoice", invoice.code));
          return <PaymentRow key={invoice.id} title={invoice.title} path={`/invoice/${invoice.code}`} amount={invoice.amountUsdc}
            status={match?.payment ? match.payment.confirmedAt ? "Paid" : "Confirming" : invoice.status === "PAID" ? "Previously marked paid" : invoice.status === "CANCELLED" ? "Cancelled" : "Awaiting payment"}
            receiptId={match?.payment?.confirmedAt ? match.payment.id : undefined} payer={match?.item.sender.username} />;
        })}
      </section>

      <section className="hush-card divide-y divide-line" aria-labelledby="requests">
        <h2 id="requests" className="px-5 py-4 text-lg font-semibold text-white">Payment requests</h2>
        {requests.length === 0 && <p className="px-5 py-6 text-white-3">Your payment links will appear here.</p>}
        {[...groupById.entries()].map(([groupId, group]) => (
          <div key={groupId} className="divide-y divide-line">
            {group[0].splitGroup && (
              <h3 className="bg-bg/35 px-5 py-3 text-sm font-semibold text-white-2">
                {group[0].note || "Split payment"} · {group.filter((item) => byKey.get(paymentKey("request", item.code))?.payment?.confirmedAt).length}/{group.length} confirmed
              </h3>
            )}
            {group.map((request) => {
              const match = byKey.get(paymentKey("request", request.code));
              let status = "Awaiting payment";
              if (match?.payment) status = match.payment.confirmedAt ? "Paid" : "Confirming";
              else if (request.status === "PAID") status = "Previously marked paid";
              else if (request.status === "CANCELLED") status = "Cancelled";
              else if (request.status === "EXPIRED" || (request.expiresAt && request.expiresAt <= new Date())) status = "Expired";

              return <PaymentRow key={request.id} title={request.participant || request.note || "Payment request"}
                path={`/pay/${request.code}`} amount={request.amountUsdc} status={status}
                receiptId={match?.payment?.confirmedAt ? match.payment.id : undefined} payer={match?.item.sender.username} />;
            })}
          </div>
        ))}
      </section>
      {pending.length > 0 && <RefreshPaymentStatus />}
    </div>
  );
}

function PaymentRow({ title, path, amount, status, receiptId, payer }: {
  title: string; path: string; amount: string | null; status: string; receiptId?: string; payer?: string | null;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
      <div className="min-w-0">
        <Link href={path} className="break-words font-semibold text-white hover:text-blue-300">{title}</Link>
        <p className="text-sm text-white-3">{amount ? `${amount} USDC` : "Any amount"}{payer ? ` · @${payer}` : ""}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className={`badge ${receiptId ? "bg-up/10 text-green-300" : "bg-blue-400/10 text-blue-200"}`}>{status}</span>
        <CopyPaymentLink path={path} />
        {receiptId && <Link className="rounded-md border border-line-2 px-3 py-1.5 text-blue-200 hover:bg-blue-400/10" href={`/receipt/${receiptId}`}>Receipt</Link>}
      </div>
    </div>
  );
}
