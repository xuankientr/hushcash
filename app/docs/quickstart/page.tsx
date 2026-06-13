import Link from 'next/link';

export default function QuickstartPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-white-4">Get started</p>
        <h1 className="text-2xl font-bold text-white">Quickstart</h1>
        <p className="text-sm text-white-3 leading-relaxed">
          Get up and running with HushCash in under two minutes.
        </p>
      </div>

      <div className="space-y-4">
        {[
          {
            step: 1,
            title: 'Sign in',
            body: 'Go to hushcash.xyz and click Get started. Sign in with your X (Twitter) account or email via Privy. No password or seed phrase required.',
          },
          {
            step: 2,
            title: 'Your wallet is created',
            body: 'HushCash automatically creates a non-custodial Arc wallet for you. You can find your wallet address on the Settings page.',
          },
          {
            step: 3,
            title: 'Deposit USDC',
            body: 'Tap Deposit on the Settings page to see your wallet address. Send USDC on Arc Testnet to that address from any compatible wallet or faucet.',
          },
          {
            step: 4,
            title: 'Send your first payment',
            body: 'Tap Send on the dashboard. Enter an X handle (e.g. @alice), a wallet address, or paste a HushCash pay link. Enter an amount and send.',
          },
        ].map(({ step, title, body }) => (
          <div key={step} className="flex gap-4 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            <span className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[11px] font-bold text-primary flex-shrink-0 mt-0.5">
              {step}
            </span>
            <div>
              <p className="text-[13px] font-semibold text-white">{title}</p>
              <p className="text-[12px] text-white-4 mt-1 leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] space-y-1">
        <p className="text-[12px] font-semibold text-white-2">Testnet note</p>
        <p className="text-[12px] text-white-4 leading-relaxed">
          HushCash is currently running on Arc Testnet. USDC used here is testnet currency and holds no real value. Get testnet USDC from the Arc faucet.
        </p>
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex justify-between">
        <Link href="/docs" className="flex items-center gap-1.5 text-[13px] text-white-3 hover:text-white transition-colors">
          <span>←</span> Introduction
        </Link>
        <Link href="/docs/send" className="flex items-center gap-1.5 text-[13px] text-white-3 hover:text-white transition-colors">
          Send <span>→</span>
        </Link>
      </div>
    </div>
  );
}