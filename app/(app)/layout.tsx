import { redirect } from "next/navigation";
import { getOrCreateAuthUser } from "@/lib/privy-server";
import { AppNavigation } from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getOrCreateAuthUser();
  if (!user) redirect("/login");
  if (!user.username) redirect("/onboarding");

  return (
    <div className="min-h-screen bg-bg lg:flex">
      <AppNavigation />
      <main className="min-w-0 flex-1 pb-24 lg:pb-12">{children}</main>
    </div>
  );
}