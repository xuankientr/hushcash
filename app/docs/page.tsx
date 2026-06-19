import Link from 'next/link';

const cards = [
  {
    icon: '',
    title: 'Quickstart',
    desc: 'Create your wallet and send your first private payment in minutes.',
    href: '/docs/quickstart',
  },
  {
    icon: '→',
    title: 'Send',
    desc: 'Send USDC privately to any address, X handle, or payment link.',
    href: '/docs/send',
  },
  {
    icon: '↗',
    title: 'Request',
    desc: 'Generate a shareable payment link to request USDC from anyone.',
    href: '/docs/request',
  },
  {
    icon: '⤵',
    title: 'Drop Cash',
    desc: 'Pre-load a claimable link — anyone with the link can claim the funds.',
    href: '/docs/drop',
  },
];

export default function DocsPage() {
  return (
    <div className='space-y-10'>
      {/* Header */}
      <div className='space-y-3'>
        <p className='text-xs font-semibold uppercase tracking-widest text-white-4'>
          Introduction
        </p>
        <h1 className='text-2xl font-bold text-white'>HushCash</h1>
        <p className='text-sm text-white-3 leading-relaxed max-w-lg'>
          HushCash is a private payments app built on Arc.
        </p>
      </div>

      {/* HushCash Pay — featured */}
      <Link
        href='/docs/pay'
        className='group block p-5 rounded-2xl border border-primary/30 bg-primary/[0.06] hover:bg-primary/[0.10] hover:border-primary/50 transition-all'
      >
        <div className='flex items-start justify-between gap-4'>
          <div className='space-y-1.5'>
            <div className='flex items-center gap-2'>
              <span className='text-sm'></span>
              <p className='text-[13px] font-semibold text-white'>
                HushCash Pay
              </p>
              <span className='text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.07] text-white-4 font-medium'>
                sandbox
              </span>
            </div>
            <p className='text-[12px] text-white-3 leading-relaxed max-w-sm'>
              Accept USDC payments directly — merchants, freelancers, and
              businesses. Scan a QR or enter an address. Prices shown in VND.
            </p>
          </div>
          <span className='text-white-4 group-hover:text-white transition-colors text-sm flex-shrink-0 mt-0.5'>
            →
          </span>
        </div>
      </Link>

      {/* Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        {cards.map(({ icon, title, desc, href }) => (
          <div
            key={href}
            className='block p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] cursor-default select-none'
          >
            <div className='flex items-center gap-2 mb-2'>
              <span className='text-base'>{icon}</span>
              <p className='text-[13px] font-semibold text-white'>{title}</p>
            </div>
            <p className='text-[12px] text-white-4 leading-relaxed'>{desc}</p>
          </div>
        ))}
      </div>

      {/* Why HushCash */}
      <div className='space-y-3'>
        <h2 className='text-base font-semibold text-white'>Why HushCash</h2>
        <ul className='space-y-2'>
          {[
            'No wallet required to pay — anyone can send via a link.',
            'Pay by X handle, wallet address, or shareable link.',
            'Native USDC on Arc — fast finality, near-zero fees.',
            'Non-custodial wallets powered by Circle.',
            'Transaction memos — attach invoice refs, notes, or categories to any payment.',
            'Selective disclosure — choose which memo fields are public or private per transaction.',
            'On-chain privacy via ArcaneVM — coming soon.',
          ].map((item) => (
            <li
              key={item}
              className='flex items-start gap-2.5 text-sm text-white-3'
            >
              <span className='text-white-4 mt-0.5 flex-shrink-0'>—</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* How it works */}
      <div className='space-y-3'>
        <h2 className='text-base font-semibold text-white'>How it works</h2>
        <ol className='space-y-3'>
          {[
            ['Sign in', 'Connect with your X account or email via Privy.'],
            [
              'Get a wallet',
              'A non-custodial Arc wallet is created automatically — no seed phrase needed.',
            ],
            [
              'Deposit USDC',
              'Fund your wallet by sending USDC to your Arc address.',
            ],
            [
              'Send privately',
              'Pay by address, X handle, or link. Recipients see amounts, not identities.',
            ],
          ].map(([step, desc], i) => (
            <li key={step} className='flex gap-3.5'>
              <span className='w-5 h-5 rounded-full bg-white/[0.07] border border-white/[0.10] flex items-center justify-center text-[10px] font-semibold text-white-3 flex-shrink-0 mt-0.5'>
                {i + 1}
              </span>
              <div>
                <p className='text-[13px] font-semibold text-white'>{step}</p>
                <p className='text-[12px] text-white-4 mt-0.5 leading-relaxed'>
                  {desc}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
