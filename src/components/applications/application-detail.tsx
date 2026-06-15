'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUpdateApplication, useDeleteApplication } from '@/hooks/use-applications'
import { StatusBadge, MatchScoreBadge } from '@/components/ui/badge'
import { STATUS_COLORS } from '@/lib/utils'
import {
  ArrowLeft, ExternalLink, Trash2, Edit3, Check,
  X, MapPin, Calendar, Building2, Briefcase,
  DollarSign, Layers, FileText, StickyNote,
  ChevronDown, Loader2, CheckCircle2, XCircle,
} from 'lucide-react'
import Link from 'next/link'
import type { Application, ApplicationStatus } from '@/types'

const STATUS_OPTIONS: ApplicationStatus[] = [
  'applied', 'response', 'interview', 'tech_test', 'offer', 'rejected', 'ghosted'
]

const STATUS_LABELS: Record<string, string> = {
  applied: 'Applied', response: 'Response', interview: 'Interview',
  tech_test: 'Tech Test', offer: 'Offer', rejected: 'Rejected', ghosted: 'Ghosted',
}

interface Props {
  application: Application
  userSkills: string[]
}

export function ApplicationDetail({ application: initial, userSkills }: Props) {
  const router = useRouter()
  const updateApp = useUpdateApplication()
  const deleteApp = useDeleteApplication()

  const [app, setApp] = useState(initial)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState(app.notes ?? '')
  const [editingInterview, setEditingInterview] = useState(false)
  const [interviewValue, setInterviewValue] = useState(app.interview_date ?? '')
  const [savingNotes, setSavingNotes] = useState(false)

  // ── Skills match ──
  const userSkillsLower = userSkills.map(s => s.toLowerCase())
  const requiredLower = (app.required_skills ?? []).map(s => s.toLowerCase())
  const matched = requiredLower.filter(s => userSkillsLower.includes(s))
  const missing = requiredLower.filter(s => !userSkillsLower.includes(s))
  const matchPct = requiredLower.length > 0
    ? Math.round((matched.length / requiredLower.length) * 100)
    : null

  // ── Status update ──
  async function updateStatus(status: ApplicationStatus) {
    const updated = await updateApp.mutateAsync({ id: app.id, status })
    setApp(updated)
  }

  // ── Notes save ──
  async function saveNotes() {
    setSavingNotes(true)
    const updated = await updateApp.mutateAsync({ id: app.id, notes: notesValue })
    setApp(updated)
    setSavingNotes(false)
    setEditingNotes(false)
  }

  // ── Interview date save ──
  async function saveInterviewDate() {
    const updated = await updateApp.mutateAsync({
      id: app.id,
      interview_date: interviewValue || null,
    })
    setApp(updated)
    setEditingInterview(false)
  }

  // ── Delete ──
  async function handleDelete() {
    if (!confirm('Delete this application? This cannot be undone.')) return
    await deleteApp.mutateAsync(app.id)
    router.push('/applications')
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      {/* Back */}
      <Link
        href="/applications"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Back to applications
      </Link>

      {/* Header card */}
      <div className="p-6 rounded-2xl bg-card border border-border mb-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold truncate">{app.position}</h1>
            </div>
            <div className="flex items-center gap-2 text-muted text-sm">
              <Building2 size={14} />
              <span className="font-medium text-foreground">{app.company}</span>
              {app.platform && <><span>·</span><span>{app.platform}</span></>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {app.url && (
              <a
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl border border-border hover:border-primary/40 text-muted hover:text-foreground transition-colors"
              >
                <ExternalLink size={16} />
              </a>
            )}
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl border border-border hover:border-red-500/40 text-muted hover:text-red-400 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-4 text-sm text-muted mb-5">
          {app.location && (
            <div className="flex items-center gap-1.5">
              <MapPin size={13} />
              <span>{app.location}</span>
            </div>
          )}
          {app.salary_range && (
            <div className="flex items-center gap-1.5">
              <DollarSign size={13} />
              <span>{app.salary_range}</span>
            </div>
          )}
          {app.experience_level && (
            <div className="flex items-center gap-1.5">
              <Layers size={13} />
              <span className="capitalize">{app.experience_level}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar size={13} />
            <span>
              Applied {new Date(app.applied_date).toLocaleDateString('en-MY', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Status selector */}
        <div>
          <p className="text-xs text-muted uppercase tracking-wider mb-3">Status</p>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(s => {
              const active = app.status === s
              const color = STATUS_COLORS[s]
              return (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={updateApp.isPending}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all"
                  style={
                    active
                      ? { color, backgroundColor: `${color}20`, border: `1px solid ${color}50` }
                      : { color: '#6B7280', backgroundColor: 'transparent', border: '1px solid #2A2A36' }
                  }
                >
                  {STATUS_LABELS[s]}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* ── Left column ── */}
        <div className="space-y-5">

          {/* Skills match */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Briefcase size={16} className="text-muted" />
                Skills Match
              </h2>
              <MatchScoreBadge score={matchPct} />
            </div>

            {requiredLower.length === 0 ? (
              <p className="text-sm text-muted">No required skills listed for this role.</p>
            ) : (
              <>
                {/* Score bar */}
                {matchPct !== null && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between text-xs text-muted mb-2">
                      <span>{matched.length} of {requiredLower.length} skills matched</span>
                      <span className="font-mono font-medium">{matchPct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${matchPct}%`,
                          backgroundColor:
                            matchPct >= 70 ? '#10B981' :
                            matchPct >= 40 ? '#F59E0B' : '#EF4444',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Matched */}
                {matched.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-muted uppercase tracking-wider mb-2">
                      You have ({matched.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {matched.map(skill => (
                        <span
                          key={skill}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono"
                        >
                          <CheckCircle2 size={11} />
                          {app.required_skills?.find(
                            s => s.toLowerCase() === skill
                          ) ?? skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing */}
                {missing.length > 0 && (
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider mb-2">
                      Gap skills ({missing.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {missing.map(skill => (
                        <span
                          key={skill}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono"
                        >
                          <XCircle size={11} />
                          {app.required_skills?.find(
                            s => s.toLowerCase() === skill
                          ) ?? skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {userSkills.length === 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-xs text-primary">
                      Add skills to your{' '}
                      <Link href="/profile" className="underline underline-offset-2">
                        profile
                      </Link>{' '}
                      to see your match score.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Interview date */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Calendar size={16} className="text-muted" />
                Interview Date
              </h2>
              {!editingInterview && (
                <button
                  onClick={() => setEditingInterview(true)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-foreground transition-colors"
                >
                  <Edit3 size={14} />
                </button>
              )}
            </div>

            {editingInterview ? (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={interviewValue}
                  onChange={e => setInterviewValue(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  onClick={saveInterviewDate}
                  className="p-2 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary transition-colors"
                >
                  <Check size={15} />
                </button>
                <button
                  onClick={() => setEditingInterview(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-muted transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            ) : app.interview_date ? (
              <p className="text-sm font-mono">
                {new Date(app.interview_date).toLocaleDateString('en-MY', {
                  weekday: 'long', day: 'numeric',
                  month: 'long', year: 'numeric'
                })}
              </p>
            ) : (
              <p className="text-sm text-muted">No interview scheduled.</p>
            )}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">

          {/* Summary */}
          {app.summary && (
            <div className="p-6 rounded-2xl bg-card border border-border">
              <h2 className="font-semibold flex items-center gap-2 mb-3">
                <FileText size={16} className="text-muted" />
                AI Summary
              </h2>
              <p className="text-sm text-muted leading-relaxed">{app.summary}</p>
            </div>
          )}

          {/* Notes */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center gap-2">
                <StickyNote size={16} className="text-muted" />
                Notes
              </h2>
              {!editingNotes && (
                <button
                  onClick={() => setEditingNotes(true)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-foreground transition-colors"
                >
                  <Edit3 size={14} />
                </button>
              )}
            </div>

            {editingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={notesValue}
                  onChange={e => setNotesValue(e.target.value)}
                  rows={5}
                  autoFocus
                  placeholder="Referral contact, prep notes, red flags…"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveNotes}
                    disabled={savingNotes}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    {savingNotes
                      ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                      : <><Check size={13} /> Save</>
                    }
                  </button>
                  <button
                    onClick={() => {
                      setNotesValue(app.notes ?? '')
                      setEditingNotes(false)
                    }}
                    className="px-4 py-2 border border-border hover:border-primary/40 text-muted text-xs rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : app.notes ? (
              <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">{app.notes}</p>
            ) : (
              <button
                onClick={() => setEditingNotes(true)}
                className="w-full py-6 border border-dashed border-border rounded-xl text-sm text-muted hover:text-foreground hover:border-primary/30 transition-colors"
              >
                Click to add notes
              </button>
            )}
          </div>

          {/* All required skills */}
          {(app.required_skills?.length ?? 0) > 0 && (
            <div className="p-6 rounded-2xl bg-card border border-border">
              <h2 className="font-semibold text-sm mb-3">All Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {app.required_skills?.map(skill => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-mono"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}