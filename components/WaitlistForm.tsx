"use client";

import { useState } from "react";
import { ArrowRightIcon, CheckIcon } from "@phosphor-icons/react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex items-center gap-2.5 h-12 px-5 rounded-2xl bg-white/[0.06] border border-white/[0.10]">
        <CheckIcon size={15} weight="bold" className="text-up flex-shrink-0" />
        <span className="text-sm text-white-2">You&apos;re on the list — we&apos;ll reach out soon.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-2.5">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.10] px-4 text-sm text-white placeholder:text-white-4/60 outline-none focus:border-white/20 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !email}
          className="h-12 px-5 rounded-2xl bg-primary hover:bg-primary-h text-white text-sm font-semibold transition-all disabled:opacity-40 shadow-lg shadow-primary/20 active:scale-[0.97] flex items-center gap-2"
        >
          {loading ? (
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <ArrowRightIcon size={15} weight="bold" />
          )}
        </button>
      </div>
      {error && (
        <p className="text-xs text-down px-1">{error}</p>
      )}
    </form>
  );
}