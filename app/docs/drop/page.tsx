import Link from 'next/link';

export default function DropPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-white-4">Features</p>
        <h1 className="text-2xl font-bold text-white">Drop Cash</h1>
        <p className="text-sm text-white-3 leading-relaxed">
          Pre-load a claimable link with USDC. Anyone with the link can claim the funds — no HushCash account required.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">How it works</h2>
        <ol className="space-y-2">
          {[
            'Tap Drop on the dashboard.',
            'Enter an amount to lock into the link.',
            'Add an optional note.',
            'HushCash creates an escrow wallet and locks the funds.',
            'Share the link — hushcash.xyz/claim/...',
            'The first person to open it can claim the funds to any wallet address.',
          ].map((s, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-white-3">
              <span className="text-white-4 flex-shrink-0">{i + 1}.</span> {s}
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Use cases</h2>
        <ul className="space-y-1.5">
          {[
            'Send money to someone who doesn\'t have a crypto wallet yet.',
            'Split costs — drop a link in a group chat.',
            'Anonymous gifting.',
          ].map((item) => (
            <li key={item} className="flex gap-2.5 text-sm text-white-3">
              <span className="text-white-4 flex-shrink-0">—</span> {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
        <p className="text-[12px] font-semibold text-white-2 mb-1">One claim per link</p>
        <p className="text-[12px] text-white-4 leading-relaxed">
          Each Drop Cash link can only be claimed once. After claiming, the link is marked complete and the funds are released to the claimer&apos;s address.
        </p>
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex justify-between">
        <Link href="/docs/request" className="flex items-center gap-1.5 text-[13px] text-white-3 hover:text-white transition-colors">
          <span>←</span> Request
        </Link>
        <Link href="/docs/wallet" className="flex items-center gap-1.5 text-[13px] text-white-3 hover:text-white transition-colors">
          Wallet <span>→</span>
        </Link>
      </div>
    </div>
  );
}