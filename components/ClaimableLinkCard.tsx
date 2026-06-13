"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon, GiftIcon } from "@phosphor-icons/react";
import { formatUsdc, cn } from "@/lib/utils";

interface ClaimableLink {
  id: string; code: string; amountUsdc: string;
  note: string | null; status: string; createdAt: Date;
}

const statusCls: Record<string, string> = {
  UNCLAIMED: "text-primary bg-primary-dim",
  CLAIMED: "text-white-4 bg-card-2",
  CANCELLED: "text-down bg-down/10",
  EXPIRED: "text-warn bg-warn/10",
};

export function ClaimableLinkCard({ link }: { link: ClaimableLink }) {
  const [copied, setCopied] = useState(false);
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/claim/${link.code}`;

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="hush-card p-3.5 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary-dim flex items-center justify-center flex-shrink-0">
        <GiftIcon size={15} weight="duotone" className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white-2">{formatUsdc(link.amountUsdc)}</p>
          <span className={cn("text-2xs px-2 py-0.5 rounded-full font-medium", statusCls[link.status] ?? "text-white-4 bg-card-2")}>
            {link.status.toLowerCase()}
          </span>
        </div>
        {link.note && <p className="text-xs text-white-4 truncate">{link.note}</p>}
        <p className="text-2xs text-white-4 font-mono truncate">{url}</p>
      </div>
      {link.status === "UNCLAIMED" && (
        <button onClick={copy} className="p-1.5 rounded-md hover:bg-card-2 transition-colors">
          {copied ? <CheckIcon size={13} weight="bold" className="text-up" /> : <CopyIcon size={13} className="text-white-4" />}
        </button>
      )}
    </div>
  );
}
