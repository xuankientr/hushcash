"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function CopyPaymentLink({ path, label = "Copy link" }: { path: string; label?: string }) {
  const [feedback, setFeedback] = useState("");
  return (
    <div>
      <button type="button" className="rounded-md border border-line-2 px-3 py-1.5 text-blue-200 hover:bg-blue-400/10"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(new URL(path, window.location.origin).href);
            setFeedback("Copied");
          } catch {
            setFeedback("Could not copy. Open the link and copy its URL.");
          }
        }}>
        {label}
      </button>
      <span role="status" className="ml-2 text-xs text-white-3">{feedback}</span>
    </div>
  );
}

export function RefreshPaymentStatus() {
  const router = useRouter();
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 12_000);
    return () => clearInterval(timer);
  }, [router]);
  return null;
}
