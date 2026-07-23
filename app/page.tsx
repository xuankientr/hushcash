import Link from 'next/link';

export default function HomePage() {
  return (
    <main className='min-h-screen bg-white flex flex-col'>
      {/* Logo */}
      <div className='flex justify-center pt-10'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src='/logo.png' alt='HushCash' width={40} height={40} className='rounded-xl' />
      </div>

      {/* Hero */}
      <div className='flex-1 flex flex-col items-center justify-center px-6 text-center'>
        <h1 className='text-[2.6rem] font-bold tracking-tight leading-tight text-gray-900'>
          Send. Request. Claim.
          <br />
          <span className='text-gray-400'>Privately.</span>
        </h1>

        <p className='mt-5 text-[15px] text-gray-500 leading-relaxed max-w-xs'>
          Private USDC payments on Arc.<br />
          No bank. No middleman.
        </p>

        <Link
          href='/login'
          className='mt-8 inline-flex items-center justify-center w-72 h-14 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-semibold transition-all active:scale-[0.98]'
        >
          Get started
        </Link>

        <div className='mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-gray-50'>
          <span className='w-2 h-2 rounded-full bg-primary' />
          <span className='text-[13px] text-gray-500'>
            ArcaneVM
          </span>
          <span className='text-gray-300 text-[13px]'>·</span>
          <span className='text-[13px] text-gray-500'>
            Privacy coming soon →
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className='flex items-center justify-center gap-4 pb-8'>
        {[
          { label: 'X', href: 'https://x.com/hushcash_xyz' },
          { label: 'Docs', href: '/docs' },
          { label: 'Privacy', href: '/privacy' },
          { label: 'Terms', href: '/terms' },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className='text-[13px] text-gray-400 hover:text-gray-600 transition-colors'
          >
            {label}
          </a>
        ))}
      </div>
    </main>
  );
}