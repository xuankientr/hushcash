"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const input = "w-full rounded-lg bg-bg px-3 py-2.5 text-white-2";

export function DropForm() {
  const router = useRouter();
  const operation = useRef<{ amountUsdc: FormDataEntryValue | null; note?: FormDataEntryValue; hours: number; operationId: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [locked, setLocked] = useState(false);

  return (
    <form className="hush-card space-y-4 p-5" onSubmit={async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const data = new FormData(form);
      operation.current ??= { amountUsdc: data.get("amount"), note: data.get("note") || undefined, hours: Number(data.get("hours")), operationId: crypto.randomUUID() };
      setLoading(true);
      setMessage("");
      try {
        const response = await fetch("/api/drop", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(operation.current),
        });
        const result = await response.json();
        if (!response.ok) {
          if (response.status >= 500) setLocked(true);
          else if (!locked) operation.current = null;
          setMessage(result.error ?? "Could not create drop");
          return;
        }
        operation.current = null;
        setLocked(false);
        form.reset();
        setMessage(result.message ?? "Drop created. Your link is ready to share once funding confirms.");
        router.refresh();
      } catch {
        setLocked(true);
        setMessage("Submission is unverified. Retry this drop to check its status.");
      } finally {
        setLoading(false);
      }
    }}>
      <h2 className="text-lg font-semibold text-white">Create a drop</h2>
      <label className="block space-y-1"><span>Amount in USDC</span>
        <input name="amount" type="number" min="0.000001" step="0.000001" placeholder="0.00" required readOnly={locked} className={input} />
      </label>
      <label className="block space-y-1"><span>Note (optional)</span>
        <input name="note" maxLength={200} readOnly={locked} className={input} />
      </label>
      <label className="block space-y-1"><span>Claim within</span>
        <select name="hours" defaultValue="72" disabled={locked} className={input}>
          <option value="24">24 hours</option><option value="72">3 days</option><option value="168">7 days</option>
        </select>
      </label>
      <p className="text-sm text-white-3">Anyone with the funded link can claim. After expiry, you can return unclaimed funds to your wallet.</p>
      {message && <p role="status" className="text-sm text-blue-200">{message}</p>}
      <button type="submit" disabled={loading} className="rounded-lg bg-blue-400 px-4 py-2 font-semibold text-bg hover:bg-blue-300 disabled:opacity-50">
        {loading ? "Submitting…" : locked ? "Retry funding submission" : "Fund drop"}
      </button>
    </form>
  );
}
