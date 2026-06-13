import Link from 'next/link';

export default function WalletPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-white-4">Features</p>
        <h1 className="text-2xl font-bold text-white">Wallet</h1>
        <p className="text-sm text-white-3 leading-relaxed">
          HushCash manages an Arc wallet for you automatically. You own it — we never hold your keys.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">How wallets work</h2>
        <p className="text-sm text-white-3 leading-relaxed">
          When you sign in for the first time, HushCash creates a developer-controlled wallet on Arc via Circle. The wallet is non-custodial — Circle encrypts and stores the key material, and only your account can authorize transactions.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Deposit</h2>
        <p className="text-sm text-white-3 leading-relaxed">
          Go to Settings → Deposit to copy your Arc wallet address. Send USDC on Arc Testnet to that address from any compatible wallet.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Withdraw</h2>
        <p className="text-sm text-white-3 leading-relaxed">
          Go to Settings → Withdraw. Enter a destination address and amount to move funds out of HushCash to any Arc wallet.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Balance</h2>
        <p className="text-sm text-white-3 leading-relaxed">
          Your USDC balance is shown on the Settings page and refreshes every 30 seconds. The balance reflects confirmed on-chain state.
        </p>
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex justify-between">
        <Link href="/docs/drop" className="flex items-center gap-1.5 text-[13px] text-white-3 hover:text-white transition-colors">
          <span>←</span> Drop Cash
        </Link>
        <Link href="/docs/arc" className="flex items-center gap-1.5 text-[13px] text-white-3 hover:text-white transition-colors">
          Arc Network <span>→</span>
        </Link>
      </div>
    </div>
  );
}