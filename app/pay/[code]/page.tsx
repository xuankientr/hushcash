import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { RefreshPaymentStatus } from "@/components/PaymentActions";
import { getLinkedPayment } from "@/lib/payment-links";
import { PayWidget } from "@/components/PayWidget";

export default async function PayPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const request = await prisma.paymentRequest.findUnique({
    where: { code },
    include: { user: { select: { username: true, walletAddress: true } } },
  });

  if (!request) notFound();
  const payment = await getLinkedPayment("request", code);
  const confirming = !!payment?.circleTransferId && !payment.confirmedAt;
  const payable = request.status === "ACTIVE" && (!request.expiresAt || request.expiresAt > new Date());

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "#09090f" }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="HushCash" width={40} height={40} className="rounded-xl mb-3" />
          <h1 className="text-lg font-bold text-white">Payment Request</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Private payments via Arc Privacy · coming soon</p>
        </div>
        {payment?.confirmedAt ? (
          <div className="hush-card p-5 text-center"><p className="text-green-300">Payment confirmed</p>
            <Link className="text-blue-300 hover:underline" href={`/receipt/${payment.id}`}>View payment receipt</Link>
          </div>
        ) : confirming ? (
          <div className="hush-card p-5 text-center" role="status">Confirming payment on Arc…<RefreshPaymentStatus /></div>
        ) : payable ? <PayWidget request={request} /> : (
          <p className="hush-card p-5 text-center">{request.status === "PAID" ? "Previously marked paid" : "This payment request is closed"}</p>
        )}
      </div>
    </main>
  );
}
