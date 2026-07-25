import Link from 'next/link';

const cards = [
  {
    icon: '→',
    title: 'Send',
    desc: 'Send USDC to any @username or wallet address. Scan a QR code to fill the recipient instantly.',
    href: '/docs/send',
  },
  {
    icon: '↗',
    title: 'Request',
    desc: 'Generate a shareable payment link. Split a total between people with custom % or fixed amounts.',
    href: '/docs/request',
  },
  {
    icon: '📄',
    title: 'Invoice',
    desc: 'Create an invoice with proof of work — photo, gallery, or URL. Client settles in one tap.',
    href: '/docs/invoice',
  },
  {
    icon: '⤵',
    title: 'Drop Cash',
    desc: 'Pre-load a claimable link — anyone with the link can claim the funds. No account needed.',
    href: '/docs/drop',
  },
  {
    icon: '⭐',
    title: 'Contacts',
    desc: 'Save frequent recipients as named contacts. One tap to fill the recipient field.',
    href: '/docs/contacts',
  },
  {
    icon: '👛',
    title: 'Wallet',
    desc: 'Your non-custodial Arc wallet — deposit, withdraw, and track your balance and activity.',
    href: '/docs/wallet',
  },
];

export default function DocsPage() {
  return (
    <div className='space-y-10'>
      {/* Header */}
      <div className='space-y-3'>
        <p className='text-xs font-semibold uppercase tracking-widest text-gray-400'>
          Introduction
        </p>
        <h1 className='text-2xl font-bold text-gray-900'>HushCash</h1>
        <p className='text-sm text-gray-600 leading-relaxed max-w-lg'>
          Private peer-to-peer payments on Arc. Send, request, invoice, and drop USDC — with a wallet that sets itself up automatically.
        </p>
      </div>

      {/* HushCash Pay — featured */}
      <Link
        href='/docs/pay'
        className='group block p-5 rounded-2xl border border-primary/30 bg-blue-50 hover:bg-blue-100/70 hover:border-primary/50 transition-all'
      >
        <div className='flex items-start justify-between gap-4'>
          <div className='space-y-1.5'>
            <div className='flex items-center gap-2'>
              <span className='text-sm'>💳</span>
              <p className='text-[13px] font-semibold text-gray-900'>HushCash Pay</p>
              <span className='text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-500 font-medium'>
                sandbox
              </span>
            </div>
            <p className='text-[12px] text-gray-600 leading-relaxed max-w-sm'>
              Accept USDC payments directly — merchants, freelancers, and businesses. Scan a QR or enter an address. Prices shown in VND.
            </p>
          </div>
          <span className='text-gray-400 group-hover:text-gray-700 transition-colors text-sm flex-shrink-0 mt-0.5'>→</span>
        </div>
      </Link>

      {/* Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        {cards.map(({ icon, title, desc, href }) => (
          <Link key={href} href={href}
            className='block p-4 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all'>
            <div className='flex items-center gap-2 mb-2'>
              <span className='text-base'>{icon}</span>
              <p className='text-[13px] font-semibold text-gray-800'>{title}</p>
            </div>
            <p className='text-[12px] text-gray-500 leading-relaxed'>{desc}</p>
          </Link>
        ))}
      </div>

      {/* Why HushCash */}
      <div className='space-y-3'>
        <h2 className='text-base font-semibold text-gray-900'>Why HushCash</h2>
        <ul className='space-y-2'>
          {[
            'No wallet required to pay — anyone can settle via a link.',
            'Pay by @username, wallet address, or QR scan.',
            'Split a bill between people — each person gets their own link, custom % or fixed amount.',
            'Invoice with proof of work — photo, gallery upload, or URL.',
            'Save contacts for one-tap sending to frequent recipients.',
            'Notification badge when you receive funds — no need to refresh.',
            'Activity auto-syncs when you open Settings — pending transactions update in real time.',
            'Native USDC on Arc — fast finality, near-zero fees.',
            'Non-custodial wallets powered by Circle.',
            'Drop Cash — claimable links backed by on-chain escrow.',
            'On-chain privacy via Arc Privacy — coming soon.',
          ].map((item) => (
            <li key={item} className='flex items-start gap-2.5 text-sm text-gray-600'>
              <span className='text-gray-300 mt-0.5 flex-shrink-0'>—</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* How it works */}
      <div className='space-y-3'>
        <h2 className='text-base font-semibold text-gray-900'>How it works</h2>
        <ol className='space-y-3'>
          {[
            ['Sign in', 'Connect with your email via Privy. No password or seed phrase required.'],
            ['Get a wallet', 'A non-custodial Arc wallet is created automatically — no setup needed.'],
            ['Deposit USDC', 'Fund your wallet by sending USDC to your Arc address via Settings → Deposit.'],
            ['Send, request, or invoice', 'Pay by @username, wallet address, QR scan, or link. Split bills, create invoices with proof of work, or drop claimable links.'],
          ].map(([step, desc], i) => (
            <li key={step} className='flex gap-3.5'>
              <span className='w-5 h-5 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-500 flex-shrink-0 mt-0.5'>
                {i + 1}
              </span>
              <div>
                <p className='text-[13px] font-semibold text-gray-800'>{step}</p>
                <p className='text-[12px] text-gray-500 mt-0.5 leading-relaxed'>{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}