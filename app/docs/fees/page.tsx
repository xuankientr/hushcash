import Link from 'next/link';

export default function FeesPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-white-4">Reference</p>
        <h1 className="text-2xl font-bold text-white">Fees</h1>
        <p className="text-sm text-white-3 leading-relaxed">
          HushCash itself charges nothing. The only cost is Arc network gas.
        </p>
      </div>

      <div className="space-y-2">
        {[
          ['HushCash fee', 'None', 'HushCash charges no platform fee.'],
          ['Arc gas', '~0.001 USDC', 'Paid in USDC — no separate gas token needed. Deducted automatically.'],
          ['Deposit', 'None', 'Depositing to your Arc wallet has no HushCash fee.'],
          ['Withdraw', '~0.001 USDC', 'Standard Arc gas only.'],
        ].map(([label, fee, note]) => (
          <div key={label as string} className="flex items-start gap-4 px-4 py-3 rounded-xl border border-white/[0.07] bg-white/[0.02]">
            <p className="text-[12px] text-white-2 font-medium w-28 flex-shrink-0">{label}</p>
            <p className="text-[12px] text-primary font-semibold w-24 flex-shrink-0">{fee}</p>
            <p className="text-[12px] text-white-4">{note}</p>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
        <p className="text-[12px] text-white-4 leading-relaxed">
          Fees shown are approximate testnet values. Mainnet fees will be confirmed before launch.
        </p>
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex justify-start">
        <Link href="/docs/faq" className="flex items-center gap-1.5 text-[13px] text-white-3 hover:text-white transition-colors">
          <span>←</span> FAQ
        </Link>
      </div>
    </div>
  );
}