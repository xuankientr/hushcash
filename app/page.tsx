import Link from 'next/link';

const features = [
  { icon: '→', label: 'Send by @handle or address', desc: 'Pay anyone on HushCash by their X handle or wallet address.' },
  { icon: '⤵', label: 'Drop Cash links', desc: 'Pre-load a claimable link — share it, anyone with the link can claim.' },
  { icon: '◎', label: 'Near-zero fees', desc: 'Native USDC on Arc. Gas costs a fraction of a cent.' },
];

export default function HomePage() {
  return (
    <main className='min-h-screen bg-bg flex flex-col items-center justify-center px-4 relative overflow-hidden'>
      {/* Ambient glow */}
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.06] blur-[140px]' />
        <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[250px] rounded-full bg-primary/[0.03] blur-[100px]' />
      </div>

      <div className='w-full max-w-sm relative z-10 py-20 space-y-10'>
        {/* Logo */}
        <div className='flex flex-col items-center'>
          <div className='relative mb-5'>
            <div className='absolute inset-0 scale-[1.4] rounded-3xl bg-primary/20 blur-2xl' />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src='/logo.png' alt='HushCash' width={64} height={64} className='relative rounded-2xl shadow-2xl' />
          </div>
          <h1 className='text-[26px] font-bold text-white tracking-tight'>HushCash</h1>
          <p className='text-sm text-white-4 mt-2 text-center leading-relaxed'>
            Private payments on Arc.
          </p>
        </div>

        {/* Features */}
        <div className='space-y-2.5'>
          {features.map(({ icon, label, desc }) => (
            <div key={label} className='flex gap-3.5 px-4 py-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.02]'>
              <span className='text-white-4 mt-0.5 flex-shrink-0 text-base'>{icon}</span>
              <div>
                <p className='text-[13px] font-semibold text-white'>{label}</p>
                <p className='text-[12px] text-white-4 mt-0.5 leading-relaxed'>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className='space-y-3'>
          <Link
            href='/login'
            className='flex items-center justify-center w-full h-12 rounded-2xl bg-primary hover:bg-primary-h text-white text-sm font-semibold transition-all shadow-lg shadow-primary/20 active:scale-[0.98]'
          >
            Open App
          </Link>
          <p className='text-[11px] text-white-4 text-center'>
            Runs on Arc Testnet · Non-custodial · Powered by Circle
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className='absolute bottom-6 left-0 right-0 flex items-center justify-center gap-4'>
        {[
          { label: 'X', href: 'https://x.com/hushcash_xyz' },
          { label: 'Docs', href: '/docs' },
          { label: 'Privacy', href: '/privacy' },
          { label: 'Terms', href: '/terms' },
        ].map(({ label, href }) => (
          <a key={label} href={href} className='text-[12px] text-white-3 hover:text-white-2 transition-colors'>
            {label}
          </a>
        ))}
      </div>
    </main>
  );
}