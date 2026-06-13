import { formatUsdc, shortenAddress } from '@/lib/utils';
import { ArrowUpRightIcon, ArrowDownLeftIcon, ArrowSquareOutIcon } from '@phosphor-icons/react/ssr';

const ARC_EXPLORER = 'https://testnet.arcscan.app/tx';

type Transfer = {
  id: string;
  createdAt: Date;
  amountUsdc: string;
  note: string | null;
  toAddress: string | null;
  status: string;
  direction: 'sent' | 'received';
  txHash?: string | null;
};

export function TransactionList({ transfers }: { transfers: Transfer[] }) {
  if (transfers.length === 0) {
    return (
      <div className='hush-card p-10 text-center'>
        <div className='w-10 h-10 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3'>
          <ArrowUpRightIcon size={18} className='text-white-4' />
        </div>
        <p className='text-sm font-medium text-white-3'>No activity yet</p>
      </div>
    );
  }

  return (
    <div>
      <p className='text-[11px] text-white-4 font-medium tracking-wider uppercase mb-3 px-0.5'>
        Recent activity
      </p>
      <div className='hush-card overflow-hidden divide-y divide-white/[0.04]'>
        {transfers.map((t) => (
          <div key={t.id} className='relative flex items-center gap-3.5 px-4 py-3.5 hover:bg-white/[0.02] transition-colors'>
            {t.txHash && (
              <a href={`${ARC_EXPLORER}/${t.txHash}`} target='_blank' rel='noopener noreferrer'
                className='absolute inset-0' aria-label='View on Arc explorer' />
            )}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                t.direction === 'sent'
                  ? 'bg-down/10 text-down'
                  : 'bg-up/10 text-up'
              }`}
            >
              {t.direction === 'sent' ? (
                <ArrowUpRightIcon size={15} weight='bold' />
              ) : (
                <ArrowDownLeftIcon size={15} weight='bold' />
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-[13px] text-white-2 font-medium'>
                {t.direction === 'sent' ? 'Sent' : 'Received'}
              </p>
              <p className='text-[11px] text-white-4 font-mono truncate mt-0.5'>
                {t.toAddress ? shortenAddress(t.toAddress) : (t.note ?? '—')}
              </p>
            </div>
            <div className='text-right flex-shrink-0'>
              <p
                className={`text-[13px] font-semibold ${t.direction === 'sent' ? 'text-down' : 'text-up'}`}
              >
                {t.direction === 'sent' ? '−' : '+'}
                {formatUsdc(t.amountUsdc)}
              </p>
              <div className='flex items-center justify-end gap-1 mt-0.5'>
                <p className='text-[11px] text-white-4'>
                  {new Date(t.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </p>
                {t.txHash && <ArrowSquareOutIcon size={10} className='text-white-4' />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
