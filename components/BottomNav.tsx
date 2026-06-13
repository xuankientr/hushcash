"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HouseIcon, GearIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", Icon: HouseIcon, label: "Home" },
  { href: "/settings", Icon: GearIcon, label: "Settings" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center pb-5 pointer-events-none">
      <div className="flex items-center gap-0.5 bg-card border border-white/[0.08] rounded-full px-1.5 py-1.5 shadow-2xl pointer-events-auto"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
        {items.map(({ href, Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} title={label}
              className={cn(
                "flex items-center justify-center w-11 h-10 rounded-full transition-all",
                active ? "bg-white/[0.12] text-white" : "text-white-4 hover:text-white-2 hover:bg-white/[0.05]"
              )}>
              <Icon size={18} weight={active ? "fill" : "regular"} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}