import Link from 'next/link'
import { Sparkles, LayoutGrid as LayoutKanban, Target, BarChart2, Bell, User } from 'lucide-react'

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
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted">
          <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it works</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm text-muted hover:text-foreground transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="text-sm bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors font-medium"
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
          <circle cx="8" cy="8" r="2.5" fill="white" />
          <circle cx="8" cy="8" r="5" stroke="white" strokeWidth="1.2" strokeDasharray="2 1.5" fill="none" />
          <circle cx="8" cy="8" r="7.2" stroke="white" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
        </svg>
      </div>
      <span className="font-bold text-lg tracking-tight">JobRadar</span>
    </div>
  )
}

/* ── Hero ── */
function Hero() {
  return (
    <section className="pt-32 pb-24 px-6 relative">
      {/* Glow blobs */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-40 left-1/3 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          AI-powered • Built for serious job seekers
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none mb-6">
          Track Every{' '}
          <span className="relative inline-block">
            <span className="text-primary">Application</span>
          </span>
          <br />
          <span className="text-muted">Land Every</span>{' '}
          <span className="text-accent">Opportunity</span>
        </h1>

        <p className="text-lg text-muted max-w-xl mx-auto mb-10 leading-relaxed">
          Paste a job URL. JobRadar extracts everything — company, role, skills,
          salary — and tracks your pipeline from first click to signed offer.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] text-center"
          >
            Start tracking free
          </Link>
          <Link
            href="/auth/login"
            className="w-full sm:w-auto px-8 py-3.5 border border-border hover:border-primary/50 text-foreground rounded-xl transition-colors text-center text-sm"
          >
            Sign in to your account
          </Link>
        </div>

        {/* Fake stat bar */}
        <div className="mt-16 flex items-center justify-center gap-8 md:gap-16 text-center">
          {[
            { value: '10x', label: 'faster tracking' },
            { value: 'AI', label: 'JD extraction' },
            { value: '100%', label: 'free to start' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-foreground font-mono">{stat.value}</div>
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
    desc: 'Paste any job URL. Gemini reads the listing and auto-fills company, role, skills, salary range, and experience level.',
  },
  {
    icon: LayoutKanban,
    title: 'Kanban Pipeline',
    desc: 'Drag applications across stages — Applied, Interview, Offer — and see your full pipeline at a glance.',
  },
  {
    icon: Target,
    title: 'Skills Match Score',
    desc: 'JobRadar compares your profile skills to job requirements and gives every application a match score.',
  },
  {
    icon: BarChart2,
    title: 'Dashboard Analytics',
    desc: 'Charts for application volume, status breakdown, response rate, and more — all in one place.',
  },
  {
    icon: Bell,
    title: 'Status Tracking',
    desc: 'Seven distinct stages from Applied to Ghosted. Never lose track of where each application stands.',
  },
  {
    icon: User,
    title: 'Skills Profile',
    desc: 'Set your target role, skills, and salary. JobRadar uses this to surface the best-matching applications.',
  },
]

function Features() {
  return (
    <section id="features" className="py-24 px-6 border-t border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
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
              className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors group"
            >
              <div className="text-2xl mb-4">
                <f.icon />
              </div>
              <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
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
  },
  {
    step: '02',
    title: 'Paste a job URL',
    desc: 'Drop any job listing URL into the form. Gemini extracts all the key details automatically.',
  },
  {
    step: '03',
    title: 'Track your pipeline',
    desc: 'Move applications through stages on the Kanban board as your search progresses.',
  },
  {
    step: '04',
    title: 'Analyze and improve',
    desc: 'Use dashboard analytics to understand your response rates and refine your strategy.',
  },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 border-t border-border/50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
          <p className="text-muted">From first application to signed offer in four steps.</p>
        </div>

        <div className="space-y-px">
          {STEPS.map((s, i) => (
            <div
              key={s.step}
              className="flex gap-8 p-8 rounded-2xl hover:bg-card/50 transition-colors group"
            >
              <div className="font-mono text-4xl font-bold text-border group-hover:text-primary/30 transition-colors flex-shrink-0 w-16 pt-1">
                {s.step}
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
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
  { label: 'Applied', color: '#6366F1', bg: '#6366F114' },
  { label: 'Response', color: '#22D3EE', bg: '#22D3EE14' },
  { label: 'Interview', color: '#F59E0B', bg: '#F59E0B14' },
  { label: 'Tech Test', color: '#8B5CF6', bg: '#8B5CF614' },
  { label: 'Offer', color: '#10B981', bg: '#10B98114' },
  { label: 'Rejected', color: '#EF4444', bg: '#EF444414' },
  { label: 'Ghosted', color: '#6B7280', bg: '#6B728014' },
]

function StatusShowcase() {
  return (
    <section className="py-24 px-6 border-t border-border/50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Seven stages, zero confusion</h2>
        <p className="text-muted mb-12 max-w-lg mx-auto">
          Every application has a status that tells you exactly where it stands — from first click to final answer.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {STATUSES.map((s) => (
            <span
              key={s.label}
              className="px-4 py-2 rounded-full text-sm font-medium font-mono"
              style={{ color: s.color, backgroundColor: s.bg, border: `1px solid ${s.color}30` }}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── CTA ── */
function CTA() {
  return (
    <section className="py-24 px-6 border-t border-border/50">
      <div className="max-w-2xl mx-auto text-center">
        <div className="p-12 rounded-3xl bg-card border border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <Logo />
          <h2 className="text-3xl font-bold mt-6 mb-4">
            Your job search, organized.
          </h2>
          <p className="text-muted mb-8 leading-relaxed">
            Start tracking applications in minutes. Free, AI-powered, and built for the modern job hunt.
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-10 py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all hover:shadow-[0_0_40px_rgba(99,102,241,0.35)]"
          >
            Create your free account
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="border-t border-border/50 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
        <Logo />
        <p>Track Every Application, Land Every Opportunity</p>
        <p className="font-mono text-xs">© {new Date().getFullYear()} JobRadar</p>
      </div>
    </footer>
  )
}