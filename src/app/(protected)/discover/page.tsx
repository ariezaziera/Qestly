'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useDiscoveredJobs, useRunDiscovery, useUpdateDiscoveredJob } from '@/hooks/use-discovered-jobs'
import { useProfile } from '@/hooks/use-profile'
import {
  Sparkles, Loader2, ExternalLink, X, Plus,
  MapPin, DollarSign, AlertCircle, Compass,
  Globe, Briefcase
} from 'lucide-react'
import { FaLinkedinIn } from 'react-icons/fa'
import { cn } from '@/lib/utils'
import type { DiscoveredJob } from '@/types'

export default function DiscoverPage() {
  const { data: jobs = [], isLoading } = useDiscoveredJobs()
  const { data: profile } = useProfile()
  const runDiscovery = useRunDiscovery()
  const [message, setMessage] = useState<string | null>(null)
  const [remoteOnly, setRemoteOnly] = useState(false)

  async function handleDiscover() {
    setMessage(null)
    try {
      const result = await runDiscovery.mutateAsync({ remoteOnly })
      if (result.message) setMessage(result.message)
    } catch (err: any) {
      setMessage(err.message ?? 'Discovery failed.')
    }
  }

  // Build pre-filled URLs for JobStreet and LinkedIn
  const searchQuery = profile?.target_role ?? ''
  const skills = profile?.skills?.slice(0, 3).join(' ') ?? ''
  const combinedQuery = [searchQuery, skills].filter(Boolean).join(' ')

  const jobStreetUrl = remoteOnly
    ? `https://www.jobstreet.com.my/en/job-search/${encodeURIComponent(searchQuery)}-jobs/?workarrangement=3`
    : `https://www.jobstreet.com.my/en/job-search/${encodeURIComponent(searchQuery)}-jobs/in-Malaysia/`

  const linkedInUrl = remoteOnly
    ? `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(combinedQuery)}&f_WT=2`
    : `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(combinedQuery)}&location=Malaysia`

  const indeedUrl = remoteOnly
    ? `https://my.indeed.com/jobs?q=${encodeURIComponent(searchQuery)}&l=Remote`
    : `https://my.indeed.com/jobs?q=${encodeURIComponent(searchQuery)}&l=Malaysia`

  const filteredJobs = remoteOnly
    ? jobs.filter(j => j.source === 'jooble_remote' || j.location?.toLowerCase().includes('remote'))
    : jobs.filter(j => j.source === 'jooble' || !j.source?.includes('remote'))

  return (
    <div className="px-8 py-10 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <Compass size={22} className="text-accent" />
            Discover
          </h1>
          <p className="text-sm text-muted">
            Open positions matching your profile — not yet tracked.
          </p>
        </div>
      </div>

      {/* Remote toggle */}
      <div className="flex items-center gap-3 mb-5 p-1 bg-card border border-border rounded-xl w-fit">
        <button
          onClick={() => setRemoteOnly(false)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            !remoteOnly
              ? 'bg-primary text-white'
              : 'text-muted hover:text-foreground'
          )}
        >
          <MapPin size={14} />
          Local / Malaysia
        </button>
        <button
          onClick={() => setRemoteOnly(true)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            remoteOnly
              ? 'bg-primary text-white'
              : 'text-muted hover:text-foreground'
          )}
        >
          <Globe size={14} />
          Remote / Worldwide
        </button>
      </div>

      {/* Find Jobs launcher */}
      <div className="p-4 rounded-2xl bg-card border border-border mb-6">
        <p className="text-xs text-muted font-medium uppercase tracking-wide mb-3">
          Search directly on job platforms
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={jobStreetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f97316]/10 border border-[#f97316]/25 text-[#f97316] hover:bg-[#f97316]/20 text-sm font-medium transition-colors"
          >
            <Briefcase size={14} />
            Find on JobStreet
          </a>
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0077b5]/10 border border-[#0077b5]/25 text-[#0077b5] hover:bg-[#0077b5]/20 text-sm font-medium transition-colors"
          >
            <FaLinkedinIn size={14} />
            Find on LinkedIn
          </a>
          <a
            href={indeedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2164f3]/10 border border-[#2164f3]/25 text-[#2164f3] hover:bg-[#2164f3]/20 text-sm font-medium transition-colors"
          >
            <ExternalLink size={14} />
            Find on Indeed
          </a>
        </div>
        {!profile?.target_role && (
          <p className="text-xs text-muted mt-2">
            ⚠️ Set a target role in your{' '}
            <Link href="/profile" className="underline text-primary">profile</Link>{' '}
            to pre-fill these searches.
          </p>
        )}
      </div>

      {/* Scan button */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted">
          {remoteOnly ? 'Showing remote / worldwide results' : 'Showing Malaysia results'}
        </p>
        <button
          onClick={handleDiscover}
          disabled={runDiscovery.isPending}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent/90 hover:bg-accent disabled:opacity-50 text-background font-semibold rounded-xl transition-colors"
        >
          {runDiscovery.isPending
            ? <><Loader2 size={16} className="animate-spin" /> Scanning…</>
            : <><Sparkles size={16} /> Scan for openings</>
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

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <Empty onDiscover={handleDiscover} loading={runDiscovery.isPending} remoteOnly={remoteOnly} />
      ) : (
        <div className="space-y-3">
          {filteredJobs.map(job => (
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
    ? `${Math.round(job.salary_min).toLocaleString()} – ${Math.round(job.salary_max).toLocaleString()}`
    : job.salary_min
      ? `From ${Math.round(job.salary_min).toLocaleString()}`
      : null

  const isRemote = job.source === 'jooble_remote' || job.location?.toLowerCase().includes('remote')

  return (
    <div
      className={cn(
        'p-5 rounded-2xl bg-card border border-border transition-all',
        dismissing && 'opacity-0 scale-95'
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-base truncate">{job.title}</h3>
            {isRemote && (
              <span className="shrink-0 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-xs font-medium flex items-center gap-1">
                <Globe size={10} /> Remote
              </span>
            )}
          </div>
          <p className="text-sm text-muted">{job.company}</p>
        </div>

        {job.fit_score !== null && (
          <div
            className="flex flex-col items-center px-3 py-1.5 rounded-xl shrink-0"
            style={{ backgroundColor: `${fitColor}15`, border: `1px solid ${fitColor}30` }}
          >
            <span className="text-lg font-bold font-mono" style={{ color: fitColor }}>
              {job.fit_score}%
            </span>
            <span className="text-xs text-muted">fit</span>
          </div>
        )}
      </div>

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

      {job.fit_reasoning && (
        <p className="text-xs text-muted/80 leading-relaxed mb-3 italic">
          "{job.fit_reasoning}"
        </p>
      )}

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

function Empty({ onDiscover, loading, remoteOnly }: { onDiscover: () => void; loading: boolean; remoteOnly: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-5">
        {remoteOnly ? <Globe size={28} className="text-muted" /> : <Compass size={28} className="text-muted" />}
      </div>
      <h3 className="font-semibold text-lg mb-2">No suggestions yet</h3>
      <p className="text-sm text-muted max-w-xs mb-6">
        {remoteOnly
          ? 'Scan for remote positions worldwide matching your target role and skills.'
          : 'Scan for open positions in Malaysia matching your target role and skills.'
        }
      </p>
      <button
        onClick={onDiscover}
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 bg-accent/90 hover:bg-accent disabled:opacity-50 text-background font-semibold rounded-xl transition-colors"
      >
        {loading
          ? <><Loader2 size={16} className="animate-spin" /> Scanning…</>
          : <><Sparkles size={16} /> {remoteOnly ? 'Find remote openings' : 'Find openings'}</>
        }
      </button>
    </div>
  )
}