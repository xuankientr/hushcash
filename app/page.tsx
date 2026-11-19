'use client';

import Link from 'next/link';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, ReceiptText } from 'lucide-react';
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
    <div className='flex min-h-dvh flex-col bg-bg'>
      <header className='border-b border-line bg-bg-2'>
        <div className='mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8'>
          <Link href='/' className='flex items-center gap-3 text-lg font-semibold tracking-tight text-white'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src='/logo.png' alt='' width={34} height={34} className='rounded-lg' />
            HushCash
          </Link>
          <Link href='/docs' className='rounded-lg border border-line px-4 py-2 font-medium text-white-2 hover:bg-white/5'>
            Docs
          </Link>
        </div>
      </header>

      <main className='mx-auto grid w-full max-w-7xl flex-1 items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-20'>
        <div>
          <div className='mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-medium text-blue-200'>
            <span className='size-1.5 rounded-full bg-blue-300' /> USDC on Arc testnet
          </div>
          <h1 className='max-w-xl text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl xl:text-7xl'>
            Private payments <span className='text-blue-300'>on Arc.</span>
          </h1>
          <p className='mt-5 max-w-md text-base leading-relaxed text-white-3 sm:text-lg'>
            Send and request USDC or create an invoice from your HushCash wallet.
          </p>
          <button
            type='button'
            onClick={login}
            disabled={!ready}
            className='mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-blue-400 px-5 font-semibold text-bg transition-colors hover:bg-blue-300 disabled:opacity-50'
          >
            {ready ? 'Get started' : 'Loading…'}
            <ArrowRight size={17} />
          </button>
        </div>

        <section className='hush-card wallet-grid border-blue-400/20 p-5 sm:p-8' aria-label='Wallet features'>
          <div className='mb-6 flex items-center gap-3'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src='/USDC_Logo.png' alt='' width={38} height={38} className='rounded-full' />
            <div>
              <h2 className='font-semibold text-white'>USDC wallet</h2>
              <p className='text-xs text-blue-200'>Arc testnet</p>
            </div>
          </div>
          <ul className='divide-y divide-line rounded-lg border border-line bg-bg/70'>
            {[
              { Icon: ArrowUpRight, label: 'Send', detail: 'Pay a contact or wallet address' },
              { Icon: ArrowDownLeft, label: 'Request', detail: 'Share a payment link' },
              { Icon: ReceiptText, label: 'Invoice', detail: 'Create an invoice payable in USDC' },
            ].map(({ Icon, label, detail }) => (
              <li key={label} className='flex items-center gap-3 px-4 py-4'>
                <span className='grid size-9 shrink-0 place-items-center rounded-lg bg-blue-400/10 text-blue-300'>
                  <Icon size={17} />
                </span>
                <div>
                  <p className='font-medium text-white'>{label}</p>
                  <p className='text-xs text-white-3 sm:text-sm'>{detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className='border-t border-line'>
        <div className='mx-auto flex max-w-7xl flex-wrap gap-x-6 gap-y-3 px-5 py-5 sm:px-8'>
          {[
            { label: 'X', href: 'https://x.com/hushcash_xyz' },
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
          ].map(({ label, href }) => (
            <a key={label} href={href} className='text-xs text-white-3 hover:text-white'>{label}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
