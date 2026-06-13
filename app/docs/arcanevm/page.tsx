import Link from 'next/link';

export default function ArcaneVMPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-white-4">Privacy</p>
        <h1 className="text-2xl font-bold text-white">ArcaneVM</h1>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.10] bg-white/[0.04]">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/70" />
          <span className="text-[11px] text-white-3">Coming soon</span>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">What is ArcaneVM?</h2>
        <p className="text-sm text-white-3 leading-relaxed">
          ArcaneVM is Arc&apos;s confidential smart contract environment. It runs smart contracts inside hardware-secured enclaves (TEEs), so transaction data — amounts, addresses, and logic — is encrypted and invisible to validators and the public.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">What it means for HushCash</h2>
        <p className="text-sm text-white-3 leading-relaxed">
          Today, HushCash provides app-layer privacy — recipient addresses are hidden in the UI, but on-chain data remains publicly visible. Once ArcaneVM is live, HushCash will route transfers through confidential contracts, making transaction data cryptographically private at the protocol level.
        </p>
      </div>

      <div className="p-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.04] space-y-1">
        <p className="text-[12px] font-semibold text-yellow-300/80">Not available yet</p>
        <p className="text-[12px] text-white-4 leading-relaxed">
          ArcaneVM is not yet deployed on Arc Testnet. HushCash will integrate it automatically when it becomes available. No action required from users.
        </p>
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex justify-between">
        <Link href="/docs/arc" className="flex items-center gap-1.5 text-[13px] text-white-3 hover:text-white transition-colors">
          <span>←</span> Arc Network
        </Link>
        <Link href="/docs/faq" className="flex items-center gap-1.5 text-[13px] text-white-3 hover:text-white transition-colors">
          FAQ <span>→</span>
        </Link>
      </div>
    </div>
  );
}