export default function TermsPage() {
  return (
    <main className="min-h-screen bg-bg px-5 py-16">
      <div className="max-w-lg mx-auto space-y-8">
        <div>
          <h1 className="text-xl font-bold text-white">Terms of Service</h1>
          <p className="text-xs text-white-4 mt-1">Last updated: June 13, 2026</p>
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white">Overview</h2>
          <p className="text-sm text-white-3 leading-relaxed">
            By joining the HushCash waitlist or using hushcash.xyz, you agree to these terms. HushCash is currently in waitlist mode — the product is not yet publicly available. Full terms will be published before launch; everyone on the waitlist will be notified before that change takes effect.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white">Waitlist</h2>
          <p className="text-sm text-white-3 leading-relaxed">
            Joining the waitlist does not guarantee access, pricing, or a launch date. We will contact you by email when invites open. You can leave the waitlist at any time by emailing hello@hushcash.xyz.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white">Testnet & Funds</h2>
          <p className="text-sm text-white-3 leading-relaxed">
            HushCash currently operates on Arc Testnet. Any USDC transferred through the app during this period is testnet currency and holds no real monetary value. We are not responsible for any loss of testnet funds.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white">Acceptable use</h2>
          <ul className="text-sm text-white-3 leading-relaxed space-y-1.5 list-none">
            <li>— Do not submit email addresses you do not own.</li>
            <li>— Do not attempt to disrupt, reverse-engineer, or scrape the service.</li>
            <li>— Do not use HushCash to violate any law that applies to you.</li>
            <li>— Do not use the service to send or receive funds related to illegal activity.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white">Intellectual property</h2>
          <p className="text-sm text-white-3 leading-relaxed">
            The HushCash name, logo, and site content are ours. You are welcome to link to us. You are not welcome to copy our copy or brand assets without permission.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white">Third-party services</h2>
          <p className="text-sm text-white-3 leading-relaxed">
            HushCash uses Privy for authentication and Circle for wallet infrastructure. Your use of the service is also subject to their respective terms of service and privacy policies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white">Disclaimer</h2>
          <p className="text-sm text-white-3 leading-relaxed">
            The site is provided &quot;as is&quot; while in waitlist and testnet mode. We make no warranties about availability, uptime, or fitness for any particular purpose. Production terms will replace this section at launch.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white">Liability</h2>
          <p className="text-sm text-white-3 leading-relaxed">
            To the maximum extent permitted by law, HushCash is not liable for indirect, incidental, or consequential damages arising from your use of this site or the waitlist.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white">Governing law</h2>
          <p className="text-sm text-white-3 leading-relaxed">
            These terms are governed by the laws of the United States. Any disputes will be resolved in the federal or state courts located there.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white">Contact</h2>
          <p className="text-sm text-white-3 leading-relaxed">
            Questions about these terms:{' '}
            <a href="mailto:hello@hushcash.xyz" className="text-white-2 hover:text-white transition-colors underline underline-offset-2">
              hello@hushcash.xyz
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}