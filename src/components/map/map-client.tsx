'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { StatusBadge } from '@/components/ui/badge'
import { STATUS_COLORS } from '@/lib/utils'
import {
  MapPin, Loader2, RefreshCw, Globe,
  Building2, SlidersHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Application } from '@/types'

// Leaflet needs to be loaded client-side only (no SSR)
const LeafletMap = dynamic(() => import('./leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 size={24} className="animate-spin text-primary" />
    </div>
  ),
})

const STATUS_OPTIONS = [
  'all', 'applied', 'response', 'interview',
  'tech_test', 'offer', 'rejected', 'ghosted'
]

const STATUS_LABELS: Record<string, string> = {
  all: 'All', applied: 'Applied', response: 'Response', interview: 'Interview',
  tech_test: 'Tech Test', offer: 'Offer', rejected: 'Rejected', ghosted: 'Ghosted',
}

interface Props {
  applications: Application[]
}

export function MapClient({ applications }: Props) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [backfilling, setBackfilling] = useState(false)
  const [backfillResult, setBackfillResult] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return applications
    return applications.filter(a => a.status === statusFilter)
  }, [applications, statusFilter])

  const located = filtered.filter(a => a.latitude !== null && a.longitude !== null)
  const remote = filtered.filter(a => a.is_remote)
  const unmapped = filtered.filter(a => a.latitude === null && !a.is_remote && a.location)

  // Group by city for stats
  const cityStats = useMemo(() => {
    const map = new Map<string, { count: number; statuses: Record<string, number> }>()
    located.forEach(app => {
      const city = app.location?.split(',')[0].trim() ?? 'Unknown'
      if (!map.has(city)) map.set(city, { count: 0, statuses: {} })
      const entry = map.get(city)!
      entry.count++
      entry.statuses[app.status] = (entry.statuses[app.status] ?? 0) + 1
    })
    return Array.from(map.entries())
      .map(([city, data]) => ({ city, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [located])

  async function runBackfill() {
    setBackfilling(true)
    setBackfillResult(null)
    try {
      const res = await fetch('/api/geocode-backfill', { method: 'POST' })
      const json = await res.json()
      if (json.updated !== undefined) {
        setBackfillResult(`Geocoded ${json.updated} of ${json.total} applications. Refresh to see them.`)
      }
    } catch {
      setBackfillResult('Backfill failed. Try again.')
    } finally {
      setBackfilling(false)
    }
  }

  return (
    <div className="h-screen flex flex-col">

      {/* Header */}
      <div className="px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Application Map</h1>
            <p className="text-sm text-muted">
              {located.length} mapped · {remote.length} remote
              {unmapped.length > 0 && ` · ${unmapped.length} not yet geocoded`}
            </p>
          </div>

          {unmapped.length > 0 && (
            <button
              onClick={runBackfill}
              disabled={backfilling}
              className="flex items-center gap-2 px-4 py-2.5 border border-border hover:border-primary/40 text-sm text-muted hover:text-foreground rounded-xl transition-colors disabled:opacity-50"
            >
              {backfilling
                ? <><Loader2 size={15} className="animate-spin" /> Geocoding…</>
                : <><RefreshCw size={15} /> Geocode {unmapped.length} location{unmapped.length !== 1 ? 's' : ''}</>
              }
            </button>
          )}
        </div>

        {backfillResult && (
          <div className="px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm mb-4">
            {backfillResult}
          </div>
        )}

        {/* Status filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <SlidersHorizontal size={15} className="text-muted flex-shrink-0" />
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                statusFilter === s
                  ? 'bg-primary text-white'
                  : 'bg-card border border-border text-muted hover:text-foreground'
              )}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex gap-4 px-8 pb-8 min-h-0">

        {/* Map */}
        <div className="flex-1 rounded-2xl border border-border overflow-hidden bg-card">
          {located.length === 0 ? (
            <EmptyMap hasApps={applications.length > 0} unmapped={unmapped.length} />
          ) : (
            <LeafletMap applications={located} />
          )}
        </div>

        {/* Sidebar stats */}
        <div className="w-72 flex-shrink-0 space-y-4 overflow-y-auto hidden lg:block">

          {/* Remote card */}
          <div className="p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Globe size={15} className="text-accent" />
              <p className="text-sm font-semibold">Remote</p>
            </div>
            <p className="text-2xl font-bold font-mono">{remote.length}</p>
            <p className="text-xs text-muted mt-0.5">
              {filtered.length > 0 ? Math.round((remote.length / filtered.length) * 100) : 0}% of filtered applications
            </p>
          </div>

          {/* Top cities */}
          <div className="p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={15} className="text-primary" />
              <p className="text-sm font-semibold">Top locations</p>
            </div>

            {cityStats.length === 0 ? (
              <p className="text-xs text-muted">No mapped locations yet.</p>
            ) : (
              <div className="space-y-3">
                {cityStats.map(c => (
                  <div key={c.city}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="truncate font-medium">{c.city}</span>
                      <span className="font-mono text-muted text-xs">{c.count}</span>
                    </div>
                    {/* Status mini bar */}
                    <div className="h-1.5 rounded-full bg-border overflow-hidden flex">
                      {Object.entries(c.statuses).map(([status, count]) => (
                        <div
                          key={status}
                          style={{
                            width: `${(count / c.count) * 100}%`,
                            backgroundColor: STATUS_COLORS[status],
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="p-4 rounded-2xl bg-card border border-border">
            <p className="text-sm font-semibold mb-3">Status legend</p>
            <div className="space-y-2">
              {Object.entries(STATUS_COLORS).map(([status, color]) => (
                <div key={status} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-muted capitalize">{status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyMap({ hasApps, unmapped }: { hasApps: boolean; unmapped: number }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center mb-5">
        <MapPin size={28} className="text-muted" />
      </div>
      <h3 className="font-semibold text-lg mb-2">
        {hasApps ? 'Nothing mapped yet' : 'No applications yet'}
      </h3>
      <p className="text-sm text-muted max-w-xs">
        {unmapped > 0
          ? `${unmapped} application${unmapped !== 1 ? 's have' : ' has'} a location but ${unmapped !== 1 ? "haven't" : "hasn't"} been geocoded yet. Click "Geocode" above.`
          : hasApps
            ? 'Applications with a location will appear here as pins.'
            : 'Add applications with a location to see them on the map.'
        }
      </p>
    </div>
  )
}