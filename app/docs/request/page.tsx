import Link from 'next/link';

export default function RequestPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-white-4">Features</p>
        <h1 className="text-2xl font-bold text-white">Request</h1>
        <p className="text-sm text-white-3 leading-relaxed">
          Create shareable payment links to request USDC from anyone — no account needed to pay. Optionally split a total amount between multiple people with custom amounts.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Single request</h2>
        <ol className="space-y-2">
          {[
            'Tap Request on the dashboard.',
            'Set an amount (or leave blank to accept any amount).',
            'Add an optional note.',
            'Tap Create payment link — a QR code and shareable link appear.',
            'Share the link or let the payer scan the QR. No account needed to pay.',
          ].map((s, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-white-3">
              <span className="text-white-4 flex-shrink-0">{i + 1}.</span> {s}
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Split between people</h2>
        <p className="text-sm text-white-3 leading-relaxed">
          Toggle <strong className="text-white">Split between people</strong> to divide a total among multiple recipients. Each person gets their own independent payment link — no group coordination required.
        </p>
        <ol className="space-y-2 mt-2">
          {[
            'Enter the total amount.',
            'Toggle Split between people — shares auto-fill equally.',
            'Edit any row: enter a fixed USDC amount (e.g. "1.50") or a percentage (e.g. "30%"). Both formats are accepted.',
            'Add or remove people with + / − buttons.',
            'The balance indicator shows if all shares add up to the total.',
            'Tap Generate N payment links — each person gets their own link to copy and share.',
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
          Anyone who opens a pay link sees a minimal page with the requested amount. They never see your wallet address. Once paid, the link is marked complete.
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