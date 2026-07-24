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
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 border-r border-gray-200 px-4 py-8 sticky top-0 h-screen overflow-y-auto bg-gray-50">
        <Link href="/" className="flex items-center gap-2 mb-8 px-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="HushCash" width={22} height={22} className="rounded-md" />
          <span className="text-sm font-semibold text-gray-900">HushCash</span>
        </Link>

        <nav className="space-y-5 flex-1">
          {nav.map(({ group, items }) => (
            <div key={group}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-2 mb-1.5">
                {group}
              </p>
              <ul className="space-y-0.5">
                {items.map(({ label, href }) => (
                  <li key={href}>
                    {href === '/docs' || href === '/docs/pay' ? (
                      <Link
                        href={href}
                        className="block px-2 py-1.5 text-[13px] text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        {label}
                      </Link>
                    ) : (
                      <span className="flex items-center justify-between px-2 py-1.5 text-[13px] text-gray-400 cursor-default select-none">
                        {label}
                        <span className="text-[10px] text-gray-300">soon</span>
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
            className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-600 transition-colors">
            <XLogo size={13} weight="bold" />
            X / Twitter
          </a>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden flex flex-col w-full">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50">
          <Link href="/" className="flex items-center gap-1.5 mr-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="HushCash" width={18} height={18} className="rounded-md" />
            <span className="text-xs font-semibold text-gray-900">HushCash</span>
          </Link>
          <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            {nav.flatMap((g) => g.items).map(({ label, href }) => (
              <Link key={href} href={href}
                className="flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors whitespace-nowrap">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <main className="px-4 py-8 w-full">{children}</main>
      </div>

      {/* Content (desktop) */}
      <main className="hidden md:block flex-1 px-8 py-12 max-w-2xl">
        {children}
      </main>
    </div>
  );
}