import Link from 'next/link'
import { Sparkles, LayoutGrid as Kanban, Target, BarChart2, Bell, User } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <StatusShowcase />
      <CTA />
      <Footer />
    </div>
  )
}

/* ── Nav ── */
function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Logo />
        {/* Hide nav links on mobile, show on md+ */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted">
          <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-primary transition-colors">How it works</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* Hide Sign in text on mobile */}
          <Link
            href="/login"
            className="hidden sm:block text-sm text-muted hover:text-primary transition-colors px-3 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-xs sm:text-sm bg-primary hover:bg-primary/90 text-secondary px-3 py-2 rounded-lg transition-colors font-medium"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}

/* ── Logo ── */
function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="2.5" fill="currentColor" className="text-secondary" />
          <circle cx="8" cy="8" r="5" stroke="currentColor" className="text-secondary" strokeWidth="1.2" strokeDasharray="2 1.5" fill="none" />
          <circle cx="8" cy="8" r="7.2" stroke="currentColor" className="text-secondary" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
        </svg>
      </div>
      <span className="font-bold text-lg tracking-tight text-primary">JobRadar</span>
    </div>
  )
}

/* ── Hero ── */
function Hero() {
  return (
    <section className="pt-28 pb-20 px-8 relative">
      <div className="glow-blob absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="glow-blob absolute top-32 left-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="glow-blob absolute top-40 right-1/4 w-[250px] h-[250px] bg-accent/8 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="hidden sm:inline">AI-powered • Built for serious job seekers</span>
          <span className="sm:hidden">AI-powered</span>
        </div>

        {/* H1 — scaled down on mobile */}
        <h1 className="text-[2.75rem] sm:text-5xl md:text-7xl font-bold tracking-[-0.02em] leading-[1.1] mb-5 text-primary">
          Track Every Application,
          <br />
          Land Every Opportunity
        </h1>

        <p className="text-base sm:text-lg text-muted max-w-xl mx-auto mb-8 leading-relaxed">
          Paste a job URL. JobRadar extracts everything —{' '}
          <span className="text-secondary font-medium">company</span>,{' '}
          <span className="text-secondary font-medium">role</span>,{' '}
          <span className="text-secondary font-medium">skills</span>,{' '}
          <span className="text-secondary font-medium">salary</span>{' '}
          — and tracks your pipeline from first click to signed offer.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="w-full sm:w-auto px-7 py-3 bg-primary hover:bg-primary/90 text-secondary font-semibold rounded-xl transition-all hover:shadow-[0_0_30px_rgba(244,197,66,0.35)] text-center text-sm"
          >
            Start tracking free
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-7 py-3 border border-primary/30 hover:border-primary/60 hover:bg-primary/5 text-foreground rounded-xl transition-colors text-center text-sm"
          >
            Sign in to your account
          </Link>
        </div>

        {/* Stat bar */}
        <div className="mt-12 flex items-center justify-center gap-6 md:gap-16 text-center">
          {[
            { value: '10x',  label: 'faster tracking', color: 'text-primary' },
            { value: 'AI',   label: 'JD extraction',   color: 'text-secondary' },
            { value: '100%', label: 'free to start',   color: 'text-accent' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className={`text-xl sm:text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Features ── */
const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI JD Extraction',
    desc: 'Paste any job URL. AI reads the listing and auto-fills company, role, skills, salary range, and experience level.',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'hover:border-primary/40',
  },
  {
    icon: Kanban,
    title: 'Kanban Pipeline',
    desc: 'Drag applications across stages — Applied, Interview, Offer — and see your full pipeline at a glance.',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    border: 'hover:border-secondary/40',
  },
  {
    icon: Target,
    title: 'Skills Match Score',
    desc: 'JobRadar compares your profile skills to job requirements and gives every application a match score.',
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'hover:border-accent/40',
  },
  {
    icon: BarChart2,
    title: 'Dashboard Analytics',
    desc: 'Charts for application volume, status breakdown, response rate, and more — all in one place.',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'hover:border-primary/40',
  },
  {
    icon: Bell,
    title: 'Status Tracking',
    desc: 'Seven distinct stages from Applied to Ghosted. Never lose track of where each application stands.',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    border: 'hover:border-secondary/40',
  },
  {
    icon: User,
    title: 'Skills Profile',
    desc: 'Set your target role, skills, and salary. JobRadar uses this to surface the best-matching applications.',
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'hover:border-accent/40',
  },
]

function Features() {
  return (
    <section id="features" className="py-24 px-8 border-t border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
            Everything your job search needs
          </h2>
          <p className="text-muted max-w-lg mx-auto">
            Stop juggling spreadsheets and sticky notes. JobRadar keeps your entire search organized and intelligent.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`p-6 rounded-2xl bg-card border border-border ${f.border} transition-colors group`}
            >
              <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                <f.icon size={20} className={f.color} />
              </div>
              <h3 className={`font-semibold mb-2 ${f.color} transition-colors`}>
                {f.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── How it works ── */
const STEPS = [
  {
    step: '01',
    title: 'Set up your profile',
    desc: 'Add your skills, target role, and salary expectations. This powers your match scores.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    step: '02',
    title: 'Paste a job URL',
    desc: 'Drop any job listing URL into the form. AI extracts all the key details automatically.',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
  },
  {
    step: '03',
    title: 'Track your pipeline',
    desc: 'Move applications through stages on the Kanban board as your search progresses.',
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  {
    step: '04',
    title: 'Analyze and improve',
    desc: 'Use dashboard analytics to understand your response rates and refine your strategy.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-8 border-t border-border/50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">How it works</h2>
          <p className="text-muted">From first application to signed offer in four steps.</p>
        </div>

        <div className="space-y-3">
          {STEPS.map((s) => (
            <div
              key={s.step}
              className="flex gap-6 p-8 rounded-2xl border border-border/50 hover:border-border hover:bg-card/60 transition-colors group"
            >
              {/* Step number badge */}
              <div className={`shrink-0 w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                <span className={`font-mono text-sm font-bold ${s.color}`}>{s.step}</span>
              </div>
              <div className="pt-2">
                <h3 className={`font-semibold text-lg mb-2 ${s.color}`}>{s.title}</h3>
                <p className="text-muted leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Status pills showcase ── */
const STATUSES = [
  { label: 'Applied',   color: '#F4C542', bg: '#F4C54218' },
  { label: 'Response',  color: '#60A5FA', bg: '#60A5FA18' },
  { label: 'Interview', color: '#F6D365', bg: '#F6D36518' },
  { label: 'Tech Test', color: '#86EFAC', bg: '#86EFAC18' },
  { label: 'Offer',     color: '#6BA368', bg: '#6BA36818' },
  { label: 'Rejected',  color: '#F87171', bg: '#F8717118' },
  { label: 'Ghosted',   color: '#94A3B8', bg: '#94A3B818' },
]

function StatusShowcase() {
  return (
    <section className="py-24 px-8 border-t border-border/50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4 text-primary">Seven stages, zero confusion</h2>
        <p className="text-muted mb-12 max-w-lg mx-auto">
          Every application has a status that tells you exactly where it stands — from first click to final answer.
        </p>

        {/* Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {STATUSES.map((s) => (
            <span
              key={s.label}
              className="px-4 py-2 rounded-full text-sm font-medium font-mono transition-transform hover:scale-105"
              style={{ color: s.color, backgroundColor: s.bg, border: `1px solid ${s.color}40` }}
            >
              {s.label}
            </span>
          ))}
        </div>

        {/* Visual pipeline strip */}
        <div className="flex items-center justify-center gap-1 flex-wrap">
          {STATUSES.map((s, i) => (
            <div key={s.label} className="flex items-center gap-1">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              {i < STATUSES.length - 1 && (
                <div className="w-6 h-px bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── CTA ── */
function CTA() {
  return (
    <section className="py-24 px-8 border-t border-border/50">
      <div className="max-w-2xl mx-auto text-center">
        <div className="p-12 rounded-3xl bg-card border border-primary/20 relative overflow-hidden">
          {/* Layered glows */}
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          <div className="glow-blob absolute -top-24 -right-24 w-64 h-64 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
          <div className="glow-blob absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <Logo />
            <h2 className="text-3xl font-bold mt-6 mb-4 text-primary">
              Your job search, organized.
            </h2>
            <p className="text-muted mb-8 leading-relaxed">
              Start tracking applications in minutes. Free, AI-powered, and built for the modern job hunt.
            </p>

            {/* Feature ticks */}
            <div className="flex items-center justify-center gap-6 mb-8 text-sm flex-wrap">
              {['Free forever', 'AI-powered', 'No spreadsheets'].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-muted">
                  <span className="text-accent font-bold">✓</span> {item}
                </span>
              ))}
            </div>

            <Link
              href="/register"
              className="inline-block px-10 py-4 bg-primary hover:bg-primary/90 text-secondary font-semibold rounded-xl transition-all hover:shadow-[0_0_40px_rgba(244,197,66,0.4)] dark:hover:shadow-[0_0_40px_rgba(246,211,101,0.4)]"
            >
              Create your free account
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="border-t border-border/50 py-8 px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
        <Logo />
        <p className="text-muted/70">Track Every Application, Land Every Opportunity</p>
        <p className="font-mono text-xs text-muted/50">© {new Date().getFullYear()} JobRadar</p>
      </div>
    </footer>
  )
}