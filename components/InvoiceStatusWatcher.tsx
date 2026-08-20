"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { CheckCircleIcon } from "@phosphor-icons/react";

export function InvoiceStatusWatcher({ invoiceCode }: { invoiceCode: string }) {
  const router = useRouter();
  const { authenticated } = usePrivy();
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/invoice/${invoiceCode}/status`);
        const { status } = await res.json();
        if (status === "PAID") {
          clearInterval(id);
          setPaid(true);
          setTimeout(() => router.push(authenticated ? "/dashboard" : "/"), 2000);
        }
      } catch { /* ignore network errors */ }
    }, 3000);
    return () => clearInterval(id);
  }, [invoiceCode, router, authenticated]);

  if (!paid) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg"
        style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)" }}>
        <CheckCircleIcon size={16} weight="duotone" className="text-green-400" />
        <p className="text-sm font-semibold text-green-400">Payment received! Redirecting…</p>
      </div>
    </div>
  );
}
