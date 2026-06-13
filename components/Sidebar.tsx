"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { SignOutIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/send", label: "Send" },
  { href: "/request", label: "Request" },
  { href: "/drop", label: "Drop Cash" },
  { href: "/settings", label: "Settings" },
];

interface SidebarProps {
  user: { name?: string | null; image?: string | null };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = usePrivy();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-52 flex flex-col border-r border-white/[0.05]"
      style={{ background: "linear-gradient(180deg, #0d0e18 0%, #09090f 100%)" }}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-[60px] border-b border-white/[0.05]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={26} height={26} className="rounded-lg flex-shrink-0" />
        <span className="font-semibold text-white text-sm tracking-tight">HushCash</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-px">
        {nav.map(({ href, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center h-9 px-3 rounded-xl text-[13px] font-medium transition-all",
                active
                  ? "bg-white/[0.08] text-white shadow-sm"
                  : "text-white-4 hover:text-white-2 hover:bg-white/[0.04]"
              )}>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-2.5 border-t border-white/[0.05]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/[0.05] transition-all group"
        >
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" width={28} height={28} className="rounded-full flex-shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
              {user.name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
          )}
          <div className="flex-1 text-left min-w-0">
            <p className="text-[13px] text-white-2 font-medium truncate leading-tight">{user.name ?? "User"}</p>
            <p className="text-[11px] text-white-4 truncate">Sign out</p>
          </div>
          <SignOutIcon size={13} className="text-white-4 group-hover:text-white-3 transition-colors flex-shrink-0" />
        </button>
      </div>
    </aside>
  );
}