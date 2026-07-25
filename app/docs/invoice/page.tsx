import Link from 'next/link';

export default function InvoicePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-white-4">Features</p>
        <h1 className="text-2xl font-bold text-white">Invoice</h1>
        <p className="text-sm text-white-3 leading-relaxed">
          Create a professional invoice with proof of work. Share a link — the client pays in one tap, no account required.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">How to create an invoice</h2>
        <ol className="space-y-2">
          {[
            'Tap Invoice on the dashboard.',
            'Enter a title (e.g. "House Cleaning — July 2025") and an optional description.',
            'Set the amount in USDC.',
            'Add proof of work: a note, a photo (camera or gallery), or a URL.',
            'Tap Create Invoice — a shareable link and QR code are generated.',
            'Send the link to your client. They open it and pay directly.',
          ].map((s, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-white-3">
              <span className="text-white-4 flex-shrink-0">{i + 1}.</span> {s}
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Proof of work</h2>
        <p className="text-sm text-white-3 leading-relaxed">
          Attach evidence that the job is done so the client can verify before paying. Three options:
        </p>
        <div className="space-y-2">
          {[
            ['Note', 'A short text description of what was completed.'],
            ['Photo', 'Take a photo with your camera or pick one from your gallery. Images are compressed automatically.'],
            ['URL', 'Paste a link to an external resource — a shared doc, a portfolio piece, or a video.'],
          ].map(([fmt, desc]) => (
            <div key={fmt as string} className="flex gap-3 p-3.5 rounded-xl border border-white/[0.07] bg-white/[0.02]">
              <code className="text-[12px] text-primary font-mono flex-shrink-0">{fmt}</code>
              <p className="text-[12px] text-white-4">{desc as string}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Sharing the invoice</h2>
        <p className="text-sm text-white-3 leading-relaxed">
          After creating, the success screen shows a QR code and a shareable link (<code className="text-white-2 text-xs">hushcash.xyz/invoice/...</code>). You can copy the link or download the QR image to share anywhere — email, chat, or printed.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Payment</h2>
        <p className="text-sm text-white-3 leading-relaxed">
          The client opens the invoice link and sees the title, amount, and proof of work. They enter their wallet address or connect via HushCash and pay. Funds go directly to the creator — no escrow.
        </p>
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex justify-between">
        <Link href="/docs/request" className="flex items-center gap-1.5 text-[13px] text-white-3 hover:text-white transition-colors">
          <span>←</span> Request
        </Link>
        <Link href="/docs/drop" className="flex items-center gap-1.5 text-[13px] text-white-3 hover:text-white transition-colors">
          Drop Cash <span>→</span>
        </Link>
      </div>
    </div>
  );
}