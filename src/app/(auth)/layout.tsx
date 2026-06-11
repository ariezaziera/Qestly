import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-card border-r border-border flex-col justify-between p-12 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-2 relative">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="2.5" fill="white" />
              <circle cx="8" cy="8" r="5" stroke="white" strokeWidth="1.2" strokeDasharray="2 1.5" fill="none" />
              <circle cx="8" cy="8" r="7.2" stroke="white" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight">JobRadar</span>
        </div>

        {/* Center content */}
        <div className="relative">
          <h2 className="text-4xl font-extrabold leading-tight mb-6">
            Your entire job<br />
            search in one place.
          </h2>
          <p className="text-muted leading-relaxed mb-10">
            AI extracts job details, match scores rank your fit,
            and a Kanban board shows your full pipeline at a glance.
          </p>

          {/* Mini feature list */}
          <div className="space-y-3">
            {[
              'Paste a URL — AI fills the rest',
              'Match score vs your skills',
              'Drag-and-drop Kanban board',
              'Analytics dashboard',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-muted">
                <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <p className="text-xs text-muted/60 font-mono relative">
          Track Every Application, Land Every Opportunity
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="2.5" fill="white" />
                <circle cx="8" cy="8" r="5" stroke="white" strokeWidth="1.2" strokeDasharray="2 1.5" fill="none" />
                <circle cx="8" cy="8" r="7.2" stroke="white" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
              </svg>
            </div>
            <span className="font-bold text-lg">JobRadar</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}