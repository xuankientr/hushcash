'use client';

import { useQuery } from '@tanstack/react-query';
import { formatUsdc } from '@/lib/utils';
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowsClockwiseIcon,
} from '@phosphor-icons/react';
import { useState } from 'react';

export function BalanceCard({ walletId }: { walletId?: string | null }) {
  const [hidden, setHidden] = useState(false);
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['balance'],
    queryFn: () => fetch('/api/wallet/balance').then((r) => r.json()),
    refetchInterval: 30000,
  });
  const balance = data?.balance ?? '0';

  return (
    <div className='text-center py-2'>
      {isLoading ? (
        <div className='h-14 w-44 bg-white/[0.05] rounded-2xl animate-pulse mx-auto' />
      ) : (
        <span className='text-[56px] font-bold text-white tracking-tight leading-none'>
          {hidden ? '$ ••••••' : formatUsdc(balance)}
        </span>
      )}

      <div className='flex items-center justify-center gap-2 mt-3'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/USDC_Logo.png" alt="USDC" width={15} height={15} className="rounded-full opacity-70" />
        <span className="text-xs text-white-4">USDC</span>
        <div className='flex items-center gap-1'>
          <button
            onClick={() => refetch()}
            className='w-6 h-6 flex items-center justify-center text-white-4 hover:text-white-3 transition-colors'
          >
            <ArrowsClockwiseIcon
              size={13}
              className={isFetching ? 'animate-spin' : ''}
            />
          </button>
          <button
            onClick={() => setHidden((h) => !h)}
            className='w-6 h-6 flex items-center justify-center text-white-4 hover:text-white-3 transition-colors'
          >
            {hidden ? <EyeSlashIcon size={13} /> : <EyeIcon size={13} />}
          </button>
        </div>
      </div>
    </div>
  );
}

