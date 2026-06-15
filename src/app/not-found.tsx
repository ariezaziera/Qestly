import Link from 'next/link'
import { Radar } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-6">
          <Radar size={28} className="text-muted" />
        </div>
        <h1 className="text-6xl font-bold font-mono text-border mb-4">404</h1>
        <h2 className="text-xl font-semibold mb-3">Page not found</h2>
        <p className="text-muted text-sm mb-8 leading-relaxed">
          This page doesn't exist or you don't have access to it.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}