import Link from 'next/link';
import { XLogo } from '@phosphor-icons/react/dist/ssr';

const nav = [
  {
    group: 'Get started',
    items: [
      { label: 'Introduction', href: '/docs' },
      { label: 'Quickstart', href: '/docs/quickstart' },
    ],
  },
  {
    group: 'Features',
    items: [
      { label: 'Send', href: '/docs/send' },
      { label: 'Request', href: '/docs/request' },
      { label: 'Drop Cash', href: '/docs/drop' },
      { label: 'Wallet', href: '/docs/wallet' },
      { label: 'HushCash Pay', href: '/docs/pay' },
    ],
  },
  {
    group: 'Privacy',
    items: [
      { label: 'Arc Network', href: '/docs/arc' },
      { label: 'ArcaneVM', href: '/docs/arcanevm' },
    ],
  },
  {
    group: 'Reference',
    items: [
      { label: 'FAQ', href: '/docs/faq' },
      { label: 'Fees', href: '/docs/fees' },
    ],
  },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 border-r border-white/[0.06] px-4 py-8 sticky top-0 h-screen overflow-y-auto">
        <Link href="/" className="flex items-center gap-2 mb-8 px-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="HushCash" width={22} height={22} className="rounded-md" />
          <span className="text-sm font-semibold text-white">HushCash</span>
        </Link>

        <nav className="space-y-5 flex-1">
          {nav.map(({ group, items }) => (
            <div key={group}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white-4 px-2 mb-1.5">
                {group}
              </p>
              <ul className="space-y-0.5">
                {items.map(({ label, href }) => (
                  <li key={href}>
                    {href === '/docs' || href === '/docs/pay' ? (
                      <Link
                        href={href}
                        className="block px-2 py-1.5 text-[13px] text-white-3 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"
                      >
                        {label}
                      </Link>
                    ) : (
                      <span className="flex items-center justify-between px-2 py-1.5 text-[13px] text-white-3/70 cursor-default select-none">
                        {label}
                        <span className="text-[10px] text-white-4/60">soon</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-6 px-2">
          <a href="https://x.com/hushcash_xyz" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[12px] text-white-4 hover:text-white-2 transition-colors">
            <XLogo size={13} weight="bold" />
            X / Twitter
          </a>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 px-6 py-12 max-w-2xl">
        {children}
      </main>
    </div>
  );
}