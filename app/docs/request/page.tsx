import Link from 'next/link';

export default function RequestPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-white-4">Features</p>
        <h1 className="text-2xl font-bold text-white">Request</h1>
        <p className="text-sm text-white-3 leading-relaxed">
          Create a shareable payment link to request a fixed or open amount of USDC from anyone — no account needed to pay.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">How to request</h2>
        <ol className="space-y-2">
          {[
            'Tap Request on the dashboard.',
            'Set an amount (or leave blank to accept any amount).',
            'Add an optional note.',
            'Copy and share your pay link — hushcash.xyz/pay/...',
            'The sender opens the link, enters their X handle or connects a wallet, and pays.',
          ].map((s, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-white-3">
              <span className="text-white-4 flex-shrink-0">{i + 1}.</span> {s}
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Pay page</h2>
        <p className="text-sm text-white-3 leading-relaxed">
          Anyone who opens your pay link sees a minimal page with your avatar and the requested amount. They never see your wallet address. Once paid, the link is marked complete.
        </p>
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex justify-between">
        <Link href="/docs/send" className="flex items-center gap-1.5 text-[13px] text-white-3 hover:text-white transition-colors">
          <span>←</span> Send
        </Link>
        <Link href="/docs/drop" className="flex items-center gap-1.5 text-[13px] text-white-3 hover:text-white transition-colors">
          Drop Cash <span>→</span>
        </Link>
      </div>
    </div>
  );
}