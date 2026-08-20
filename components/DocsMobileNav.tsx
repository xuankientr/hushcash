"use client";

import { useState } from "react";
import Link from "next/link";
import { ListIcon, XIcon } from "@phosphor-icons/react";

const nav = [
  {
    group: "Get started",
    items: [
      { label: "Introduction", href: "/docs" },
      { label: "Quickstart", href: "/docs/quickstart" },
    ],
  },
  {
    group: "Features",
    items: [
      { label: "Send", href: "/docs/send" },
      { label: "Request", href: "/docs/request" },
      { label: "Invoice", href: "/docs/invoice" },
      { label: "Drop Cash", href: "/docs/drop" },
      { label: "Contacts", href: "/docs/contacts" },
      { label: "Wallet", href: "/docs/wallet" },
      { label: "HushCash Pay", href: "/docs/pay" },
    ],
  },
  {
    group: "Privacy",
    items: [
      { label: "Arc Network", href: "/docs/arc" },
      { label: "Arc Privacy", href: "/docs/arc-privacy" },
    ],
  },
  {
    group: "Reference",
    items: [
      { label: "FAQ", href: "/docs/faq" },
      { label: "Fees", href: "/docs/fees" },
    ],
  },
];

export function DocsMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] bg-white/[0.02]">
        <Link href="/" className="flex items-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="HushCash" width={18} height={18} className="rounded-md" />
          <span className="text-sm font-semibold text-white">HushCash</span>
        </Link>
        <button onClick={() => setOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-white-3 hover:bg-white/[0.06] transition-colors">
          <ListIcon size={20} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative w-64 max-w-[80vw] bg-bg h-full shadow-xl flex flex-col border-r border-white/[0.07]">
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.07]">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="HushCash" width={20} height={20} className="rounded-md" />
                <span className="text-sm font-semibold text-white">HushCash</span>
              </Link>
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-white-4 hover:bg-white/[0.06] transition-colors">
                <XIcon size={16} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
              {nav.map(({ group, items }) => (
                <div key={group}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white-4 px-2 mb-1.5">
                    {group}
                  </p>
                  <ul className="space-y-0.5">
                    {items.map(({ label, href }) => (
                      <li key={href}>
                        <Link href={href} onClick={() => setOpen(false)}
                          className="block px-2 py-2 text-[13px] text-white-3 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors">
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
