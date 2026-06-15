'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useApplications, useDeleteApplication } from '@/hooks/use-applications'
import { StatusBadge, MatchScoreBadge } from '@/components/ui/badge'
import {
  Plus, Search, SlidersHorizontal, Trash2,
  ExternalLink, Loader2, BriefcaseBusiness,
  ChevronUp, ChevronDown, ChevronsUpDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Application } from '@/types'

// ── Types ──
type SortField = 'company' | 'position' | 'status' | 'match_score' | 'applied_date'
type SortDir = 'asc' | 'desc'

const STATUS_OPTIONS = [
  'all', 'applied', 'response', 'interview',
  'tech_test', 'offer', 'rejected', 'ghosted'
]

const STATUS_LABELS: Record<string, string> = {
  all: 'All',
  applied: 'Applied',
  response: 'Response',
  interview: 'Interview',
  tech_test: 'Tech Test',
  offer: 'Offer',
  rejected: 'Rejected',
  ghosted: 'Ghosted',
}

// ── Page ──
export default function ApplicationsPage() {
  const { data: applications = [], isLoading } = useApplications()
  const deleteApp = useDeleteApplication()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [sortField, setSortField] = useState<SortField>('applied_date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ── Filter + sort ──
  const filtered = useMemo(() => {
    let list = [...applications]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(a =>
        a.company.toLowerCase().includes(q) ||
        a.position.toLowerCase().includes(q) ||
        a.location?.toLowerCase().includes(q) ||
        a.platform?.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'all') {
      list = list.filter(a => a.status === statusFilter)
    }

    if (levelFilter !== 'all') {
      list = list.filter(a => a.experience_level === levelFilter)
    }

    list.sort((a, b) => {
      let aVal: string | number | null = a[sortField] ?? null
      let bVal: string | number | null = b[sortField] ?? null

      if (aVal === null) return 1
      if (bVal === null) return -1

      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [applications, search, statusFilter, levelFilter, sortField, sortDir])

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this application? This cannot be undone.')) return
    setDeletingId(id)
    await deleteApp.mutateAsync(id)
    setDeletingId(null)
  }

  // ── Stats strip ──
  const stats = useMemo(() => ({
    total: applications.length,
    interview: applications.filter(a => a.status === 'interview').length,
    offer: applications.filter(a => a.status === 'offer').length,
    avgScore: applications.filter(a => a.match_score !== null).length
      ? Math.round(
          applications
            .filter(a => a.match_score !== null)
            .reduce((sum, a) => sum + (a.match_score ?? 0), 0) /
          applications.filter(a => a.match_score !== null).length
        )
      : null,
  }), [applications])

  return (
    <div className="px-8 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Applications</h1>
          <p className="text-sm text-muted">{applications.length} total tracked</p>
        </div>
        <Link
          href="/applications/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus size={16} />
          New Application
        </Link>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, mono: false },
          { label: 'Interviews', value: stats.interview, mono: false },
          { label: 'Offers', value: stats.offer, mono: false },
          { label: 'Avg Match', value: stats.avgScore !== null ? `${stats.avgScore}%` : '—', mono: true },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl bg-card border border-border">
            <p className="text-xs text-muted mb-1">{s.label}</p>
            <p className={cn('text-2xl font-bold', s.mono && 'font-mono')}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-5">

        {/* Search */}
        <div className="flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl bg-card border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 transition-colors">
          <Search size={15} className="text-muted flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search company, role, location…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-muted hover:text-foreground transition-colors">
              <ChevronDown size={14} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
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

        {/* Level filter */}
        <select
          value={levelFilter}
          onChange={e => setLevelFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-card border border-border text-sm text-muted focus:outline-none focus:border-primary transition-colors"
        >
          <option value="all">All levels</option>
          <option value="junior">Junior</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
          <option value="lead">Lead</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Empty hasApps={applications.length > 0} />
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-card/50">
                {[
                  { label: 'Company', field: 'company' as SortField },
                  { label: 'Position', field: 'position' as SortField },
                  { label: 'Status', field: 'status' as SortField },
                  { label: 'Match', field: 'match_score' as SortField },
                  { label: 'Applied', field: 'applied_date' as SortField },
                ].map(col => (
                  <th
                    key={col.field}
                    onClick={() => toggleSort(col.field)}
                    className="text-left px-5 py-3.5 text-xs font-medium text-muted uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      <SortIcon field={col.field} current={sortField} dir={sortDir} />
                    </div>
                  </th>
                ))}
                <th className="px-5 py-3.5 text-xs font-medium text-muted uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(app => (
                <Row
                  key={app.id}
                  app={app}
                  onDelete={() => handleDelete(app.id)}
                  isDeleting={deletingId === app.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Result count */}
      {filtered.length > 0 && (
        <p className="text-xs text-muted text-center mt-4">
          Showing {filtered.length} of {applications.length} applications
        </p>
      )}
    </div>
  )
}

// ── Row ──
function Row({
  app,
  onDelete,
  isDeleting,
}: {
  app: Application
  onDelete: () => void
  isDeleting: boolean
}) {
  return (
    <tr className="group hover:bg-card/40 transition-colors">
      <td className="px-5 py-4">
        <div className="font-medium text-sm">{app.company}</div>
        {app.location && (
          <div className="text-xs text-muted mt-0.5">{app.location}</div>
        )}
      </td>
      <td className="px-5 py-4">
        <div className="text-sm">{app.position}</div>
        {app.platform && (
          <div className="text-xs text-muted mt-0.5">{app.platform}</div>
        )}
      </td>
      <td className="px-5 py-4">
        <StatusBadge status={app.status} />
      </td>
      <td className="px-5 py-4">
        <MatchScoreBadge score={app.match_score} />
      </td>
      <td className="px-5 py-4">
        <span className="text-sm font-mono text-muted">
          {new Date(app.applied_date).toLocaleDateString('en-MY', {
            day: 'numeric', month: 'short', year: 'numeric'
          })}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {app.url && (
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-foreground transition-colors"
            >
              <ExternalLink size={15} />
            </a>
          )}
          <Link
            href={`/applications/${app.id}`}
            className="px-3 py-1.5 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary text-xs font-medium transition-colors"
          >
            View
          </Link>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-1.5 rounded-lg hover:bg-red-500/15 text-muted hover:text-red-400 transition-colors disabled:opacity-50"
          >
            {isDeleting
              ? <Loader2 size={15} className="animate-spin" />
              : <Trash2 size={15} />
            }
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Sort icon ──
function SortIcon({
  field, current, dir
}: {
  field: SortField
  current: SortField
  dir: SortDir
}) {
  if (field !== current) return <ChevronsUpDown size={12} className="opacity-30" />
  return dir === 'asc'
    ? <ChevronUp size={12} className="text-primary" />
    : <ChevronDown size={12} className="text-primary" />
}

// ── Empty state ──
function Empty({ hasApps }: { hasApps: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-5">
        <BriefcaseBusiness size={28} className="text-muted" />
      </div>
      <h3 className="font-semibold text-lg mb-2">
        {hasApps ? 'No results found' : 'No applications yet'}
      </h3>
      <p className="text-sm text-muted max-w-xs mb-6">
        {hasApps
          ? 'Try adjusting your search or filters.'
          : 'Add your first job application to start tracking your search.'
        }
      </p>
      {!hasApps && (
        <Link
          href="/applications/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus size={16} />
          Add your first application
        </Link>
      )}
    </div>
  )
}