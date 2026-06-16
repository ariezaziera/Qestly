'use client'

import { Radar, WifiOff } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-6">
          <WifiOff size={28} className="text-muted" />
        </div>
        <h1 className="text-2xl font-bold mb-3">You're offline</h1>
        <p className="text-muted text-sm leading-relaxed mb-8">
          Qestly needs a connection to sync your applications.
          Pages you've visited recently are still available.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-colors"
          >
            Try cached dashboard
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 border border-border hover:border-primary/40 text-muted hover:text-foreground rounded-xl transition-colors text-sm"
          >
            Retry connection
          </button>
        </div>
        <div className="flex items-center justify-center gap-2 mt-10 text-muted">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <Radar size={12} color="white" />
          </div>
          <span className="text-sm font-medium">Qestly</span>
        </div>
      </div>
    </div>
  )
}