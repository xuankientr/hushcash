import Link from 'next/link';

export default function ContactsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-white-4">Features</p>
        <h1 className="text-2xl font-bold text-white">Contacts</h1>
        <p className="text-sm text-white-3 leading-relaxed">
          Save frequent recipients as named contacts for one-tap sending — no need to type a username or address twice.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Saving a contact</h2>
        <ol className="space-y-2">
          {[
            'Send USDC to any @username or wallet address.',
            'On the success screen, a "Save contact?" prompt appears.',
            'Edit the suggested label (defaults to the handle or address) and tap save.',
            'The contact is stored to your account.',
          ].map((s, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-white-3">
              <span className="text-white-4 flex-shrink-0">{i + 1}.</span> {s}
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Using contacts</h2>
        <p className="text-sm text-white-3 leading-relaxed">
          Open Send and tap Continue past the amount step. Above the recipient input, your saved contacts appear as chips. Tap any chip to fill the recipient field instantly — the mode (Username / Wallet) switches automatically to match.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Removing a contact</h2>
        <p className="text-sm text-white-3 leading-relaxed">
          On the recipient step, hover over a contact chip — a trash icon appears on the right. Tap it to delete the contact. The deletion is immediate.
        </p>
      </div>

      <div className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
        <p className="text-[12px] font-semibold text-white-2 mb-1">Privacy note</p>
        <p className="text-[12px] text-white-4 leading-relaxed">
          Contacts are stored on your account server-side, not just locally. They are private to you and never visible to other users.
        </p>
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex justify-between">
        <Link href="/docs/drop" className="flex items-center gap-1.5 text-[13px] text-white-3 hover:text-white transition-colors">
          <span>←</span> Drop Cash
        </Link>
        <Link href="/docs/wallet" className="flex items-center gap-1.5 text-[13px] text-white-3 hover:text-white transition-colors">
          Wallet <span>→</span>
        </Link>
      </div>
    </div>
  );
}