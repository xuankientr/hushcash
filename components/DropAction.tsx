"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DropAction({ code, action }: { code: string; action: "refund" | "resume-funding" }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  return (
    <div>
      <button type="button" disabled={busy} className="rounded-md border border-line-2 px-3 py-1.5 text-blue-200 hover:bg-blue-400/10"
        onClick={async () => {
          setBusy(true);
          setMessage("");
          try {
            const response = await fetch("/api/drop", {
              method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, action }),
            });
            const result = await response.json();
            setMessage(response.ok ? "Submitted to Circle" : result.error ?? "Could not submit");
          } catch {
            setMessage("Could not verify submission. Retry the same action.");
          } finally {
            setBusy(false);
            router.refresh();
          }
        }}>
        {busy ? "Submitting…" : action === "refund" ? "Return funds to my wallet" : "Resume funding"}
      </button>
      <p role="status" className="text-xs text-white-3">{message}</p>
    </div>
  );
}
