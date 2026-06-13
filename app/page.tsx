import { WaitlistForm } from '@/components/WaitlistForm';

export default function HomePage() {
  return (
    <main className='min-h-screen bg-bg flex flex-col items-center justify-center px-4 relative overflow-hidden'>
      {/* Ambient glow */}
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.06] blur-[140px]' />
        <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[250px] rounded-full bg-primary/[0.03] blur-[100px]' />
      </div>

      <div className='w-full max-w-sm relative z-10 py-20'>
        {/* Logo */}
        <div className='flex flex-col items-center mb-10'>
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
          <h1 className='text-[26px] font-bold text-white tracking-tight'>
            HushCash
          </h1>
          <p className='text-sm text-white-4 mt-2 text-center leading-relaxed'>
            Private payments on Arc.
            <br />
          </p>
        </div>

        {/* Waitlist */}
        <div className='space-y-3'>
          <p className='text-xs text-white-4 text-center'>
            Get early access - join the waitlist
          </p>
          <WaitlistForm />
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
