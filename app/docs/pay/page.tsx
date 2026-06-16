import Link from 'next/link';

const steps = [
  {
    step: 1,
    title: 'Merchant generates QR',
    body: 'The merchant creates a HushCash Pay QR code from their wallet address or payment link — either in-app or printed for in-store use.',
  },
  {
    step: 2,
    title: 'Customer scans or enters address',
    body: 'The customer scans the QR code with any compatible wallet or pastes the merchant\'s address into HushCash Send.',
  },
  {
    step: 3,
    title: 'Pay in USDC, see VND equivalent',
    body: 'The payment screen shows the amount in USDC and the live VND equivalent at current rates — no mental math required.',
  },
  {
    step: 4,
    title: 'Instant settlement',
    body: 'USDC lands in the merchant\'s wallet on Arc within seconds. No bank, no intermediary, no waiting.',
  },
];

const benefits = [
  {
    title: 'No intermediary',
    desc: 'Payments go directly from customer wallet to merchant wallet. HushCash never holds the funds.',
  },
  {
    title: 'Stable value',
    desc: 'USDC is pegged 1:1 to the US dollar — merchants avoid the volatility risk of other crypto assets.',
  },
  {
    title: 'VND display',
    desc: 'Prices and amounts are shown in VND alongside USDC, making it familiar for both merchants and customers.',
  },
  {
    title: 'Print-ready QR',
    desc: 'Merchants can download and print their payment QR to use at counters, on invoices, or in menus.',
  },
  {
    title: 'Near-zero fees',
    desc: 'Arc network gas is a fraction of a cent in USDC — far cheaper than card processing or bank transfers.',
  },
];

export default function HushCashPayPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-white-4">Features</p>
        <h1 className="text-2xl font-bold text-white">HushCash Pay</h1>
        <p className="text-sm text-white-3 leading-relaxed max-w-lg">
          A merchant payment solution built on USDC. Accept payments directly — no card terminals, no bank accounts, no intermediaries.
        </p>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.10] bg-white/[0.04]">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/70" />
          <span className="text-[11px] text-white-3">Coming soon</span>
        </div>
      </div>

      {/* How it works */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">How it works</h2>
        <div className="space-y-2.5">
          {steps.map(({ step, title, body }) => (
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
      </div>

      {/* USDC → VND */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">USDC / VND</h2>
        <p className="text-sm text-white-3 leading-relaxed">
          HushCash Pay displays live USDC ↔ VND rates on the payment screen. Merchants set prices in VND — HushCash calculates the exact USDC amount the customer needs to send. The rate is fetched in real time so both parties always see the current value.
        </p>
        <div className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] space-y-2">
          <p className="text-[12px] text-white-4 leading-relaxed">Example:</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 px-3 py-2.5 rounded-xl bg-black/30 border border-white/[0.06]">
              <p className="text-[11px] text-white-4 mb-0.5">Merchant sets</p>
              <p className="text-sm font-semibold text-white">500,000 VND</p>
            </div>
            <span className="text-white-4 text-sm">→</span>
            <div className="flex-1 px-3 py-2.5 rounded-xl bg-black/30 border border-white/[0.06]">
              <p className="text-[11px] text-white-4 mb-0.5">Customer pays</p>
              <p className="text-sm font-semibold text-primary">~20.00 USDC</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Why HushCash Pay</h2>
        <div className="space-y-2">
          {benefits.map(({ title, desc }) => (
            <div key={title} className="flex gap-3 px-4 py-3 rounded-xl border border-white/[0.07] bg-white/[0.02]">
              <p className="text-[12px] font-semibold text-white w-32 flex-shrink-0">{title}</p>
              <p className="text-[12px] text-white-4 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Use cases */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Use cases</h2>
        <ul className="space-y-1.5">
          {[
            'Coffee shops and restaurants — print QR at the counter.',
            'Freelancers — send a pay link on invoices.',
            'Online stores — embed a payment QR in order confirmation emails.',
            'Cross-border payments — receive USD-equivalent without a foreign bank account.',
          ].map((item) => (
            <li key={item} className="flex gap-2.5 text-sm text-white-3">
              <span className="text-white-4 flex-shrink-0">—</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex justify-start">
        <Link href="/docs" className="flex items-center gap-1.5 text-[13px] text-white-3 hover:text-white transition-colors">
          <span>←</span> Introduction
        </Link>
      </div>
    </div>
  );
}