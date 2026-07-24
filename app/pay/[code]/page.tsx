import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PayWidget } from "@/components/PayWidget";

export default async function PayPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const request = await prisma.paymentRequest.findUnique({
    where: { code },
    include: { user: { select: { username: true, walletAddress: true } } },
  });

  if (!request || request.status !== "ACTIVE") notFound();

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "#09090f" }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="HushCash" width={40} height={40} className="rounded-xl mb-3" />
          <h1 className="text-lg font-bold text-white">Payment Request</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Private payments via Arc Privacy · coming soon</p>
        </div>
        <PayWidget request={request} />
      </div>
    </main>
  );
}
