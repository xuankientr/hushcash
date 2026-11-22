"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RequestModal } from "@/components/RequestModal";

export function NewRequestButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="rounded-lg border border-line-2 px-4 py-2 font-medium text-blue-200 hover:bg-blue-400/10" onClick={() => setOpen(true)}>
        New request
      </button>
      {open && <RequestModal onClose={() => { setOpen(false); router.refresh(); }} />}
    </>
  );
}
