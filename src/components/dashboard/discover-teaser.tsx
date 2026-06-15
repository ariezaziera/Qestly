'use client'

import Link from 'next/link'
import { useDiscoveredJobs } from '@/hooks/use-discovered-jobs'
import { Compass, ArrowRight, Sparkles } from 'lucide-react'

export function DiscoverTeaser() {
  const { data: jobs = [], isLoading } = useDiscoveredJobs()

  const topJobs = jobs.slice(0, 3)

  return (
    <div className="p-6 rounded-2xl bg-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Compass size={16} className="text-accent" />
          Discover
        </h2>
        <Link
          href="/discover"
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          View all <ArrowRight size={13} />
        </Link>
      </div>

      {isLoading ? (
        <div className="h-24 flex items-center justify-center text-sm text-muted">
          Loading…
        </div>
      ) : topJobs.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-muted mb-4">
            Scan for open positions matching your target role.
          </p>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent/15 hover:bg-accent/25 text-accent text-sm rounded-xl transition-colors"
          >
            <Sparkles size={14} />
            Find openings
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {topJobs.map(job => {
            const fitColor = job.fit_score === null
              ? '#6B7280'
              : job.fit_score >= 70 ? '#10B981'
              : job.fit_score >= 40 ? '#F59E0B'
              : '#EF4444'

            return (
              <Link
                key={job.id}
                href="/discover"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{job.title}</p>
                  <p className="text-xs text-muted truncate">{job.company}</p>
                </div>
                {job.fit_score !== null && (
                  <span
                    className="text-xs font-mono font-medium px-2 py-0.5 rounded-md flex-shrink-0 ml-3"
                    style={{ color: fitColor, backgroundColor: `${fitColor}15` }}
                  >
                    {job.fit_score}%
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}