export default function DashboardLoading() {
  return (
    <div className="max-w-sm mx-auto px-5 pt-12 space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/[0.06]" />
        <div className="space-y-2 text-center">
          <div className="h-7 w-48 rounded-xl bg-white/[0.06] mx-auto" />
          <div className="h-4 w-16 rounded-lg bg-white/[0.04] mx-auto" />
        </div>
      </div>

      {/* Balance */}
      <div className="text-center py-2 space-y-3">
        <div className="h-14 w-44 rounded-2xl bg-white/[0.06] mx-auto" />
        <div className="h-4 w-24 rounded-lg bg-white/[0.04] mx-auto" />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-12 rounded-2xl bg-white/[0.06]" />
        ))}
      </div>

      {/* Activity rows */}
      <div className="space-y-2">
        <div className="h-4 w-20 rounded-lg bg-white/[0.04]" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <div className="w-8 h-8 rounded-full bg-white/[0.06] flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-24 rounded bg-white/[0.06]" />
              <div className="h-2.5 w-16 rounded bg-white/[0.04]" />
            </div>
            <div className="h-3 w-14 rounded bg-white/[0.06]" />
          </div>
        ))}
      </div>
    </div>
  );
}