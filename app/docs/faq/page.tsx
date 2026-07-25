import Link from 'next/link';

const faqs = [
  {
    q: 'Is HushCash on mainnet?',
    a: 'No. HushCash currently runs on Arc Testnet. USDC used here is testnet currency with no real monetary value. Mainnet launch will be announced on our X account (@hushcash_xyz).',
  },
  {
    q: 'Do I need a crypto wallet to sign in?',
    a: 'No. You can sign in with your email. HushCash creates an Arc wallet for you automatically — no seed phrase or browser extension required.',
  },
  {
    q: 'Who controls my wallet keys?',
    a: "Your wallet is non-custodial and managed via Circle's Developer Controlled Wallets. Circle encrypts and stores key material — HushCash never has direct access to your private key.",
  },
  {
    q: 'Is my identity hidden on-chain?',
    a: 'Partially. HushCash hides identities in the app UI — senders and recipients see wallet addresses, not names. On-chain transactions on Arc Testnet are currently public. Full cryptographic privacy via Arc Privacy is coming in a future release.',
  },
  {
    q: 'What fees does HushCash charge?',
    a: 'HushCash charges no platform fees. Arc Testnet transactions use a small amount of USDC as gas (~0.001 USDC), which is deducted from your wallet automatically.',
  },
  {
    q: 'What happens if a Drop Cash link is never claimed?',
    a: "Funds remain locked in the escrow wallet. You can cancel the link from your dashboard to reclaim the funds.",
  },
  {
    q: 'What are contacts?',
    a: 'Contacts let you save frequent recipients — @usernames or wallet addresses — with a friendly name. After a successful send, tap "Save contact?" to store them. They appear as quick-fill chips the next time you open Send.',
  },
  {
    q: 'Why is a transaction showing as pending?',
    a: 'Arc Testnet transactions are usually confirmed in seconds. If a transfer still shows pending after opening the Activity tab in Settings, tap it again — the tab automatically syncs with the network and updates the status.',
  },
  {
    q: 'Can I split a bill with multiple people?',
    a: 'Yes. In the Request modal, toggle "Split between people". Each person gets their own independent payment link. You can enter a fixed USDC amount or a percentage per person — no forced equal split.',
  },
];

export default function FaqPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-white-4">Reference</p>
        <h1 className="text-2xl font-bold text-white">FAQ</h1>
        <p className="text-sm text-white-3 leading-relaxed">
          Frequently asked questions about HushCash.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map(({ q, a }) => (
          <div key={q} className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] space-y-1.5">
            <p className="text-[13px] font-semibold text-white">{q}</p>
            <p className="text-[12px] text-white-4 leading-relaxed">{a}</p>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex justify-between">
        <Link href="/docs/arc-privacy" className="flex items-center gap-1.5 text-[13px] text-white-3 hover:text-white transition-colors">
          <span>←</span> Arc Privacy
        </Link>
        <Link href="/docs/fees" className="flex items-center gap-1.5 text-[13px] text-white-3 hover:text-white transition-colors">
          Fees <span>→</span>
        </Link>
      </div>
    </div>
  );
}