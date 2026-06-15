'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useDiscoveredJobs, useRunDiscovery, useUpdateDiscoveredJob } from '@/hooks/use-discovered-jobs'
import {
  Sparkles, Loader2, ExternalLink, X, Plus,
  MapPin, DollarSign, AlertCircle, RadarIcon,
  CheckCircle2, Compass
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DiscoveredJob } from '@/types'

export default function DiscoverPage() {
  const { data: jobs = [], isLoading } = useDiscoveredJobs()
  const runDiscovery = useRunDiscovery()
  const [message, setMessage] = useState<string | null>(null)

  async function handleDiscover() {
    setMessage(null)
    try {
      const result = await runDiscovery.mutateAsync()
      if (result.message) setMessage(result.message)
    } catch (err: any) {
      setMessage(err.message ?? 'Discovery failed.')
    }
  }

  return (
    <div className="px-8 py-10 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <Compass size={22} className="text-accent" />
            Discover
          </h1>
          <p className="text-sm text-muted">
            Open positions matching your profile — not yet tracked.
          </p>
        </div>
        <button
          onClick={handleDiscover}
          disabled={runDiscovery.isPending}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent/90 hover:bg-accent disabled:opacity-50 text-background font-semibold rounded-xl transition-colors"
        >
          {runDiscovery.isPending
            ? <><Loader2 size={16} className="animate-spin" /> Scanning…</>
            : <><Sparkles size={16} /> Find new openings</>
          }
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
          <AlertCircle size={15} />
          {message}
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : jobs.length === 0 ? (
        <Empty onDiscover={handleDiscover} loading={runDiscovery.isPending} />
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}

function JobCard({ job }: { job: DiscoveredJob }) {
  const updateJob = useUpdateDiscoveredJob()
  const [dismissing, setDismissing] = useState(false)

  const fitColor = job.fit_score === null
    ? '#6B7280'
    : job.fit_score >= 70 ? '#10B981'
    : job.fit_score >= 40 ? '#F59E0B'
    : '#EF4444'

  async function handleDismiss() {
    setDismissing(true)
    await updateJob.mutateAsync({ id: job.id, status: 'dismissed' })
  }

  const salaryText = job.salary_min && job.salary_max
    ? `RM ${Math.round(job.salary_min).toLocaleString()} – RM ${Math.round(job.salary_max).toLocaleString()}`
    : job.salary_min
      ? `From RM ${Math.round(job.salary_min).toLocaleString()}`
      : null

  return (
    <div
      className={cn(
        'p-5 rounded-2xl bg-card border border-border transition-all',
        dismissing && 'opacity-0 scale-95'
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-base mb-1 truncate">{job.title}</h3>
          <p className="text-sm text-muted">{job.company}</p>
        </div>

        {/* Fit score */}
        {job.fit_score !== null && (
          <div
            className="flex flex-col items-center px-3 py-1.5 rounded-xl flex-shrink-0"
            style={{ backgroundColor: `${fitColor}15`, border: `1px solid ${fitColor}30` }}
          >
            <span className="text-lg font-bold font-mono" style={{ color: fitColor }}>
              {job.fit_score}%
            </span>
            <span className="text-xs text-muted">fit</span>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-xs text-muted mb-3">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {job.location}
          </span>
        )}
        {salaryText && (
          <span className="flex items-center gap-1">
            <DollarSign size={12} /> {salaryText}
          </span>
        )}
      </div>

      {/* Fit reasoning */}
      {job.fit_reasoning && (
        <p className="text-xs text-muted/80 leading-relaxed mb-3 italic">
          "{job.fit_reasoning}"
        </p>
      )}

      {/* Matched skills */}
      {job.matched_skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.matched_skills.map(skill => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-mono"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-border/50">
        <a
          href={job.apply_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <ExternalLink size={14} />
          View & Apply
        </a>
        <Link
          href={{
            pathname: '/applications/new',
            query: {
              prefill_position: job.title,
              prefill_company: job.company ?? '',
              prefill_location: job.location ?? '',
              prefill_url: job.apply_url,
            },
          }}
          className="flex items-center gap-1.5 px-4 py-2 border border-border hover:border-primary/40 text-muted hover:text-foreground text-sm rounded-xl transition-colors"
        >
          <Plus size={14} />
          Track this
        </Link>
        <button
          onClick={handleDismiss}
          disabled={updateJob.isPending}
          className="ml-auto p-2 rounded-xl hover:bg-red-500/15 text-muted hover:text-red-400 transition-colors"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}

function Empty({ onDiscover, loading }: { onDiscover: () => void; loading: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-5">
        <Compass size={28} className="text-muted" />
      </div>
      <h3 className="font-semibold text-lg mb-2">No suggestions yet</h3>
      <p className="text-sm text-muted max-w-xs mb-6">
        Scan for open positions matching your target role and skills from your profile.
      </p>
      <button
        onClick={onDiscover}
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 bg-accent/90 hover:bg-accent disabled:opacity-50 text-background font-semibold rounded-xl transition-colors"
      >
        {loading
          ? <><Loader2 size={16} className="animate-spin" /> Scanning…</>
          : <><Sparkles size={16} /> Find openings</>
        }
      </button>
    </div>
  )
}