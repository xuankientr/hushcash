import Link from 'next/link';

export default function WalletPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-white-4">Features</p>
        <h1 className="text-2xl font-bold text-white">Wallet</h1>
        <p className="text-sm text-white-3 leading-relaxed">
          HushCash manages a non-custodial Arc wallet for you. You own it — no seed phrase, no setup.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">How wallets work</h2>
        <p className="text-sm text-white-3 leading-relaxed">
          When you sign in for the first time, HushCash creates a developer-controlled wallet on Arc via Circle. The wallet is non-custodial — Circle encrypts and stores the key material, and only your account can authorize transactions. HushCash never has direct access to your private key.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Deposit</h2>
        <p className="text-sm text-white-3 leading-relaxed">
          Go to Settings → Wallet tab → Deposit. Your Arc wallet address and a QR code are shown. Send USDC on Arc Testnet to that address from any compatible wallet or the Arc faucet.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Withdraw</h2>
        <p className="text-sm text-white-3 leading-relaxed">
          Go to Settings → Wallet tab → Withdraw. Enter a destination address and the USDC amount. Funds are sent directly to that address on Arc — standard network gas applies.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Balance</h2>
        <p className="text-sm text-white-3 leading-relaxed">
          Your USDC balance is shown on the dashboard and the Settings wallet tab. It refreshes automatically every 30 seconds and reflects confirmed on-chain state. Tap the refresh icon to trigger an immediate update.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Activity</h2>
        <p className="text-sm text-white-3 leading-relaxed">
          The Activity tab in Settings shows your last 20 transactions. When you open the tab, HushCash automatically syncs pending transactions with the network — status and transaction hashes update in real time without requiring a page reload.
        </p>
        <p className="text-sm text-white-3 leading-relaxed">
          A notification badge appears on the Settings icon in the bottom nav when you have unread incoming transfers. It clears when you open the Activity tab.
        </p>
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex justify-between">
        <Link href="/docs/contacts" className="flex items-center gap-1.5 text-[13px] text-white-3 hover:text-white transition-colors">
          <span>←</span> Contacts
        </Link>
        <Link href="/docs/arc" className="flex items-center gap-1.5 text-[13px] text-white-3 hover:text-white transition-colors">
          Arc Network <span>→</span>
        </Link>
      </div>
    </div>
  );
}