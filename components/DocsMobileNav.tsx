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
      { label: "Drop Cash", href: "/docs/drop" },
      { label: "Wallet", href: "/docs/wallet" },
      { label: "HushCash Pay", href: "/docs/pay" },
    ],
  },
  {
    group: "Privacy",
    items: [
      { label: "Arc Network", href: "/docs/arc" },
      { label: "ArcaneVM", href: "/docs/arcanevm" },
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

const linkable = new Set(["/docs", "/docs/pay"]);

export function DocsMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <Link href="/" className="flex items-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="HushCash" width={18} height={18} className="rounded-md" />
          <span className="text-sm font-semibold text-gray-900">HushCash</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
        >
          <ListIcon size={20} />
        </button>
      </div>

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-64 max-w-[80vw] bg-white h-full shadow-xl flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="HushCash" width={20} height={20} className="rounded-md" />
                <span className="text-sm font-semibold text-gray-900">HushCash</span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <XIcon size={16} />
              </button>
            </div>

            {/* Nav groups */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
              {nav.map(({ group, items }) => (
                <div key={group}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-2 mb-1.5">
                    {group}
                  </p>
                  <ul className="space-y-0.5">
                    {items.map(({ label, href }) => (
                      <li key={href}>
                        {linkable.has(href) ? (
                          <Link
                            href={href}
                            onClick={() => setOpen(false)}
                            className="block px-2 py-2 text-[13px] text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            {label}
                          </Link>
                        ) : (
                          <span className="flex items-center justify-between px-2 py-2 text-[13px] text-gray-400 cursor-default select-none">
                            {label}
                            <span className="text-[10px] text-gray-300">soon</span>
                          </span>
                        )}
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