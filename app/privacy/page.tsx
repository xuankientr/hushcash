export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-bg px-5 py-16">
      <div className="max-w-lg mx-auto space-y-8">
        <div>
          <h1 className="text-xl font-bold text-white">Privacy Policy</h1>
          <p className="text-xs text-white-4 mt-1">Last updated: June 13, 2026</p>
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white">Overview</h2>
          <p className="text-sm text-white-3 leading-relaxed">
            HushCash is a private payments app built on Arc. This policy explains what data we collect, how we use it, and what we share. We collect as little as possible.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white">What we collect</h2>
          <ul className="text-sm text-white-3 leading-relaxed space-y-1.5 list-none">
            <li>— <span className="text-white-2">Email address</span> — when you join the waitlist, used only to send you an invite.</li>
            <li>— <span className="text-white-2">Twitter/X profile</span> — name, handle, and avatar, if you sign in with X.</li>
            <li>— <span className="text-white-2">Wallet address</span> — your Arc wallet address, created via Circle when you sign up.</li>
            <li>— <span className="text-white-2">Transaction data</span> — amount, recipient address, and optional note for each transfer you make.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white">What we don&apos;t collect</h2>
          <p className="text-sm text-white-3 leading-relaxed">
            We do not collect passwords, private keys, or payment card information. We do not run ad tracking or sell your data to third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white">How we use it</h2>
          <ul className="text-sm text-white-3 leading-relaxed space-y-1.5 list-none">
            <li>— To send you a waitlist invite when access opens.</li>
            <li>— To create and manage your Arc wallet.</li>
            <li>— To show your transaction history inside the app.</li>
            <li>— To display your public handle on payment request pages.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white">Third-party services</h2>
          <p className="text-sm text-white-3 leading-relaxed">
            We use <span className="text-white-2">Privy</span> for authentication — they handle login via X and email. We use <span className="text-white-2">Circle</span> for developer-controlled wallets — they hold and execute on-chain transactions on your behalf. Both operate under their own privacy policies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white">On-chain data</h2>
          <p className="text-sm text-white-3 leading-relaxed">
            Transactions made through HushCash are recorded on Arc Testnet, a public blockchain. While HushCash hides recipient identities in the UI, on-chain transaction data (wallet addresses, amounts) is publicly visible. Full on-chain privacy via Arc&apos;s ArcaneVM is planned for a future release.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white">Data retention</h2>
          <p className="text-sm text-white-3 leading-relaxed">
            Waitlist emails are deleted once invites have been sent and you have had the opportunity to opt out. App account data is retained as long as your account is active. You can request deletion at any time by contacting us.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white">Contact</h2>
          <p className="text-sm text-white-3 leading-relaxed">
            Questions or deletion requests:{' '}
            <a href="mailto:hello@hushcash.xyz" className="text-white-2 hover:text-white transition-colors underline underline-offset-2">
              hello@hushcash.xyz
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}