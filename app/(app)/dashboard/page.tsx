import { getOrCreateAuthUser } from '@/lib/privy-server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { DashboardClient } from '@/components/DashboardClient';

export default async function DashboardPage() {
  const user = await getOrCreateAuthUser();
  if (!user) redirect('/login');

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      sentTransfers: { take: 10, orderBy: { createdAt: 'desc' } },
      receivedTransfers: { take: 10, orderBy: { createdAt: 'desc' } },
    },
  });

  const transfers = [
    ...(dbUser?.sentTransfers ?? []).map((t) => ({ ...t, direction: 'sent' as const })),
    ...(dbUser?.receivedTransfers ?? []).map((t) => ({ ...t, direction: 'received' as const })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

  return <DashboardClient walletId={dbUser?.walletId} transfers={transfers} />;
}