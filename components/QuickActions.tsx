import Link from 'next/link';

export function QuickActions() {
  return (
    <div className='flex gap-3'>
      <Link
        href='/send'
        className='flex-1 flex items-center justify-center h-12 rounded-2xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all active:scale-[0.97]'
      >
        Send
      </Link>
      <Link
        href='/request'
        className='flex-1 flex items-center justify-center h-12 rounded-2xl border border-white/[0.12] text-white text-sm font-semibold hover:bg-white/[0.05] transition-all active:scale-[0.97]'
      >
        Request
      </Link>
    </div>
  );
}
