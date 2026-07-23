'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();
  const [settingUp, setSettingUp] = useState(false);

  useEffect(() => {
    if (ready && authenticated) {
      setSettingUp(true);
      router.push('/dashboard');
    }
  }, [ready, authenticated, router]);

  if (settingUp) {
    return (
      <main className='min-h-screen bg-bg flex items-center justify-center px-4'>
        <div className='flex flex-col items-center gap-5'>
          {/* Spinner */}
          <div className='relative w-14 h-14'>
            <div className='absolute inset-0 rounded-full border-2 border-white/[0.08]' />
            <div
              className='absolute inset-0 rounded-full border-2 border-transparent border-t-primary'
              style={{ animation: 'spin 0.9s linear infinite' }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src='/logo.png'
              alt=''
              width={28}
              height={28}
              className='absolute inset-0 m-auto rounded-lg'
            />
          </div>
          <div className='text-center space-y-1'>
            <p className='text-sm font-semibold text-white'>Setting up your account</p>
            <p className='text-xs text-white-4'>Creating your wallet on Arc…</p>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    );
  }

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