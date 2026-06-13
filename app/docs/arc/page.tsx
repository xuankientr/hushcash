import Link from 'next/link';

export default function ArcPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-white-4">Privacy</p>
        <h1 className="text-2xl font-bold text-white">Arc Network</h1>
        <p className="text-sm text-white-3 leading-relaxed">
          HushCash is built on Arc — a high-performance EVM blockchain designed for private finance.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">What is Arc?</h2>
        <p className="text-sm text-white-3 leading-relaxed">
          Arc is an EVM-compatible blockchain optimized for speed, low fees, and privacy. It uses USDC as its native gas token, meaning you only need USDC to transact — no separate gas token required.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Key details</h2>
        <div className="space-y-2">
          {[
            ['Chain ID', '5042002'],
            ['Gas token', 'USDC (native)'],
            ['RPC', 'rpc.testnet.arc.network'],
            ['Explorer', 'testnet.arcscan.app'],
            ['Network', 'Testnet (mainnet coming soon)'],
          ].map(([k, v]) => (
            <div key={k as string} className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02]">
              <p className="text-[12px] text-white-4 w-24 flex-shrink-0">{k}</p>
              <code className="text-[12px] text-white-2 font-mono">{v}</code>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex justify-between">
        <Link href="/docs/wallet" className="flex items-center gap-1.5 text-[13px] text-white-3 hover:text-white transition-colors">
          <span>←</span> Wallet
        </Link>
        <Link href="/docs/arcanevm" className="flex items-center gap-1.5 text-[13px] text-white-3 hover:text-white transition-colors">
          ArcaneVM <span>→</span>
        </Link>
      </div>
    </div>
  );
}