export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-bg px-5 pt-12 pb-28 animate-pulse">
      <div className="max-w-sm mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="h-5 w-32 rounded-lg bg-white/[0.06]" />
          <div className="h-3.5 w-20 rounded bg-white/[0.04]" />
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4 space-y-2">
              <div className="h-3 w-16 rounded bg-white/[0.06]" />
              <div className="h-5 w-20 rounded-lg bg-white/[0.06]" />
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex gap-2">
          <div className="h-9 flex-1 rounded-xl bg-white/[0.06]" />
          <div className="h-9 flex-1 rounded-xl bg-white/[0.04]" />
        </div>

        {/* Activity rows */}
        <div className="space-y-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <div className="w-8 h-8 rounded-full bg-white/[0.06] flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-28 rounded bg-white/[0.06]" />
                <div className="h-2.5 w-16 rounded bg-white/[0.04]" />
              </div>
              <div className="h-3 w-14 rounded bg-white/[0.06]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}