export default function Loading() {
  return (
    <div className="px-8 py-10">
      <div className="h-8 w-48 bg-card rounded-xl animate-pulse mb-2" />
      <div className="h-4 w-32 bg-card rounded-lg animate-pulse mb-8" />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-card animate-pulse" />
        ))}
      </div>

      <div className="h-10 rounded-xl bg-card animate-pulse mb-4" />
      <div className="rounded-2xl border border-border overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0">
            <div className="h-4 w-32 bg-card rounded animate-pulse" />
            <div className="h-4 w-48 bg-card rounded animate-pulse" />
            <div className="h-6 w-20 bg-card rounded-lg animate-pulse ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}