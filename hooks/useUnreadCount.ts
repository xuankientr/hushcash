"use client";

import { useState, useEffect, useCallback } from "react";

const LS_KEY = "hushcash:activityLastSeen";

export function getLastSeen(): string {
  if (typeof window === "undefined") return new Date(0).toISOString();
  return localStorage.getItem(LS_KEY) ?? new Date(Date.now() - 86_400_000).toISOString();
}

export function markActivityRead() {
  if (typeof window !== "undefined") {
    localStorage.setItem(LS_KEY, new Date().toISOString());
  }
}

export function useUnreadCount() {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const since = getLastSeen();
      const res = await fetch(`/api/activity/unread?since=${encodeURIComponent(since)}`);
      if (res.ok) {
        const data = await res.json();
        setCount(data.count ?? 0);
      }
    } catch { /* non-blocking */ }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  // Reset badge when user marks read externally
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === LS_KEY) setCount(0);
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return count;
}