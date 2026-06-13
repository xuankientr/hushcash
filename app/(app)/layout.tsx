import { redirect } from "next/navigation";
import { getOrCreateAuthUser } from "@/lib/privy-server";
import { BottomNav } from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getOrCreateAuthUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-bg">
      <main className="pb-28">{children}</main>
      <BottomNav />
    </div>
  );
}