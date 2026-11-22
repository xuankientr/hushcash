"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CircleDollarSign, Gift, LayoutGrid, ReceiptText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { BottomNav } from "./BottomNav";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/payments", label: "Payments", icon: ReceiptText },
  { href: "/drop", label: "Drop Cash", icon: Gift },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppNavigation() {
  const pathname = usePathname();
  const unread = useUnreadCount();

  return (
    <>
      <Sidebar pathname={pathname} unread={unread} />
      <BottomNav unread={unread} />
    </>
  );
}

function Sidebar({ pathname, unread }: { pathname: string; unread: number }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-bg-2 px-4 py-6 lg:flex">
      <Link href="/dashboard" className="mb-10 flex items-center gap-3 px-3 text-lg font-semibold tracking-tight text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={32} height={32} className="rounded-lg" />
        HushCash
      </Link>
      <nav aria-label="Main navigation" className="flex-1 space-y-1">
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors",
                active ? "bg-primary/15 text-blue-300" : "text-white-3 hover:bg-white/5 hover:text-white"
              )}>
              <Icon size={17} />
              {label}
              {href === "/settings" && unread > 0 && (
                <span className="ml-auto rounded-full bg-primary/20 px-2 text-xs text-blue-200">{unread}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <Link href="/docs" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-white-3 hover:bg-white/5 hover:text-white">
        <BookOpen size={17} /> Documentation
      </Link>
      <div className="mt-4 flex items-center gap-3 border-t border-line px-3 pt-5 text-xs text-white-3">
        <CircleDollarSign size={16} className="text-blue-300" /> USDC on Arc
      </div>
    </aside>
  );
}
