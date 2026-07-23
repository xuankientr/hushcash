'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) router.push('/dashboard');
  }, [ready, authenticated, router]);

  return (
    <main className='min-h-screen bg-bg flex items-center justify-center px-4 relative overflow-hidden'>
      {/* Ambient glow */}
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-primary/[0.07] blur-[120px]' />
        <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] rounded-full bg-primary/[0.04] blur-[80px]' />
      </div>

      <div className='w-full max-w-[300px] relative z-10'>
        {/* Logo */}
        <div className='flex flex-col items-center mb-12'>
          <div className='relative mb-5'>
            <div className='absolute inset-0 scale-[1.4] rounded-3xl bg-primary/20 blur-2xl' />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src='/logo.png'
              alt='HushCash'
              width={64}
              height={64}
              className='relative rounded-2xl shadow-2xl'
            />
          </div>
          <h1 className='text-[22px] font-bold text-white tracking-tight'>
            HushCash
          </h1>
          <p className='text-sm text-white-4 mt-1.5 text-center'>
            Private payments on Arc.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={login}
          disabled={!ready}
          className='w-full h-12 rounded-2xl bg-primary hover:bg-primary-h text-white text-sm font-semibold transition-all disabled:opacity-40 shadow-lg shadow-primary/20 active:scale-[0.98]'
        >
          {ready ? 'Get started' : 'Loading...'}
        </button>
      </div>

      {/* Footer */}
      <div className='absolute bottom-6 left-0 right-0 flex items-center justify-center gap-4'>
        {[
          { label: 'X', href: 'https://x.com/hushcash_xyz' },
          { label: 'Docs', href: '/docs' },
          { label: 'Privacy', href: '/privacy' },
          { label: 'Terms', href: '/terms' },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className='text-[12px] text-white-3 hover:text-white-2 transition-colors'
          >
            {label}
          </a>
        ))}
      </div>
    </main>
  );
}
