"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon, TrashIcon, LinkIcon } from "@phosphor-icons/react";
import { formatUsdc, cn } from "@/lib/utils";

interface PaymentRequest {
  id: string; code: string; amountUsdc: string | null;
  note: string | null; status: string; createdAt: Date;
}

export function PaymentRequestCard({ request }: { request: PaymentRequest }) {
  const [copied, setCopied] = useState(false);
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/pay/${request.code}`;

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function cancel() {
    await fetch(`/api/request?id=${request.id}`, { method: "DELETE" });
    window.location.reload();
  }

  return (
    <div className={cn("hush-card p-3.5 flex items-center gap-3", request.status !== "ACTIVE" && "opacity-50")}>
      <div className="w-8 h-8 rounded-lg bg-primary-dim flex items-center justify-center flex-shrink-0">
        <LinkIcon size={15} weight="duotone" className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white-2">
          {request.amountUsdc ? formatUsdc(request.amountUsdc) : "Any amount"}
        </p>
        {request.note && <p className="text-xs text-white-4 truncate">{request.note}</p>}
        <p className="text-2xs text-white-4 font-mono truncate">{url}</p>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={copy} className="p-1.5 rounded-md hover:bg-card-2 transition-colors">
          {copied ? <CheckIcon size={13} weight="bold" className="text-up" /> : <CopyIcon size={13} className="text-white-4" />}
        </button>
        {request.status === "ACTIVE" && (
          <button onClick={cancel} className="p-1.5 rounded-md hover:bg-card-2 transition-colors">
            <TrashIcon size={13} className="text-down/70 hover:text-down" />
          </button>
        )}
      </div>
    </div>
  );
}
