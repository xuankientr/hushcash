import Link from 'next/link';

export default function SendPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-white-4">Features</p>
        <h1 className="text-2xl font-bold text-white">Send</h1>
        <p className="text-sm text-white-3 leading-relaxed">
          Send USDC privately to anyone — by X handle, wallet address, or pay link.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">How to send</h2>
        <ol className="space-y-2">
          {[
            'Tap Send on the dashboard.',
            'Enter a recipient: @handle, 0x address, or paste a pay link.',
            'Enter an amount in USDC.',
            'Add an optional note.',
            'Tap Send — the transaction is submitted on Arc.',
          ].map((s, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-white-3">
              <span className="text-white-4 flex-shrink-0">{i + 1}.</span> {s}
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Recipient formats</h2>
        <div className="space-y-2">
          {[
            ['@handle', 'Any X (Twitter) username registered on HushCash.'],
            ['0x address', 'Any valid Arc wallet address.'],
            ['Pay link', 'Paste a hushcash.xyz/pay/... link directly into the recipient field.'],
          ].map(([fmt, desc]) => (
            <div key={fmt as string} className="flex gap-3 p-3.5 rounded-xl border border-white/[0.07] bg-white/[0.02]">
              <code className="text-[12px] text-primary font-mono flex-shrink-0">{fmt}</code>
              <p className="text-[12px] text-white-4">{desc as string}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Privacy</h2>
        <p className="text-sm text-white-3 leading-relaxed">
          HushCash hides recipient identities in the app UI — your X handle or name is never shown to the sender unless you share your pay link publicly. Wallet-level on-chain privacy via ArcaneVM is coming in a future release.
        </p>
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex justify-between">
        <Link href="/docs/quickstart" className="flex items-center gap-1.5 text-[13px] text-white-3 hover:text-white transition-colors">
          <span>←</span> Quickstart
        </Link>
        <Link href="/docs/request" className="flex items-center gap-1.5 text-[13px] text-white-3 hover:text-white transition-colors">
          Request <span>→</span>
        </Link>
      </div>
    </div>
  );
}