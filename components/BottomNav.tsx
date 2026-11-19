"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HouseIcon, GearIcon, ReceiptIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function BottomNav({ unread }: { unread: number }) {
  const pathname = usePathname();

  const items = [
    { href: "/dashboard", Icon: HouseIcon, label: "Overview", badge: 0 },
    { href: "/invoice/new", Icon: ReceiptIcon, label: "Invoice", badge: 0 },
    { href: "/settings", Icon: GearIcon, label: "Settings", badge: unread },
  ];

  return (
    <nav aria-label="Mobile navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center pointer-events-none" style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>
      <div className="flex items-center gap-1 bg-card border border-white/[0.08] rounded-full px-1.5 py-1.5 shadow-2xl pointer-events-auto"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
        {items.map(({ href, Icon, label, badge }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex items-center justify-center flex-col gap-1 px-3 min-w-[60px] h-12 rounded-full transition-all",
                active ? "bg-primary/20 text-blue-200" : "text-white-4 hover:text-white-2 hover:bg-white/[0.05]"
              )}>
              <Icon size={18} weight={active ? "fill" : "regular"} />
              <span className="text-[10px] leading-none">{label}</span>
              {badge > 0 && (
                <span className="absolute top-1 right-1.5 size-2 rounded-full bg-blue-300 ring-2 ring-card">
                  <span className="sr-only">{badge} unread</span>
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}