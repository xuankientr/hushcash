import Link from 'next/link';

export default function SendPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-white-4">Features</p>
        <h1 className="text-2xl font-bold text-white">Send</h1>
        <p className="text-sm text-white-3 leading-relaxed">
          Send USDC to anyone — by @username, wallet address, or by scanning their QR code.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">How to send</h2>
        <ol className="space-y-2">
          {[
            'Tap Send on the dashboard.',
            'Enter the amount in USDC using the keypad.',
            'Tap Continue to go to the recipient step.',
            'Choose Username or Wallet mode, then type — or tap the QR icon to scan.',
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
            ['@username', 'Any HushCash username — automatically resolved to their wallet.'],
            ['0x address', 'Any valid Arc wallet address.'],
            ['QR scan', 'Tap the QR icon to open the camera and scan a HushCash profile QR or a bare wallet address QR.'],
          ].map(([fmt, desc]) => (
            <div key={fmt as string} className="flex gap-3 p-3.5 rounded-xl border border-white/[0.07] bg-white/[0.02]">
              <code className="text-[12px] text-primary font-mono flex-shrink-0">{fmt}</code>
              <p className="text-[12px] text-white-4">{desc as string}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">QR scanner</h2>
        <p className="text-sm text-white-3 leading-relaxed">
          On the recipient step, tap the QR icon inside the address field (or the "Scan QR to fill address" button). HushCash opens your camera and scans continuously. When a QR is detected it automatically fills in the recipient and picks the right mode — no extra taps needed.
        </p>
        <p className="text-sm text-white-3 leading-relaxed">
          Supported QR formats: HushCash profile page URLs, bare Ethereum/Arc wallet addresses, and EIP-681 payment URIs.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Privacy</h2>
        <p className="text-sm text-white-3 leading-relaxed">
          Your username is never exposed to the sender — they enter it explicitly or scan your QR. Wallet-level on-chain privacy via Arc Privacy is coming in a future release.
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