'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { applicationSchema, type ApplicationFormData } from '@/lib/validations/application'
import { useExtractJD } from '@/hooks/use-extract-jd'
import { useCreateApplication } from '@/hooks/use-applications'
import { Input } from '@/components/ui/input'
import {
  Sparkles, Loader2, X, Plus,
  AlertCircle, CheckCircle2, Link2,
  ChevronDown, ClipboardPaste,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied' },
  { value: 'response', label: 'Response' },
  { value: 'interview', label: 'Interview' },
  { value: 'tech_test', label: 'Tech Test' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'ghosted', label: 'Ghosted' },
]

const LEVEL_OPTIONS = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
]

export default function NewApplicationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state: extractState, extract } = useExtractJD()
  const createApplication = useCreateApplication()

  const [mode, setMode] = useState<'url' | 'paste'>('url')
  const [urlInput, setUrlInput] = useState(searchParams.get('prefill_url') ?? '')
  const [pasteInput, setPasteInput] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [extracted, setExtracted] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      status: 'applied',
      applied_date: new Date().toISOString().split('T')[0],
      required_skills: [],
      position: searchParams.get('prefill_position') ?? '',
      company: searchParams.get('prefill_company') ?? '',
      location: searchParams.get('prefill_location') ?? '',
      url: searchParams.get('prefill_url') ?? '',
    },
  })

  // ── Extract ──
  async function handleExtract() {
    const input = mode === 'url' ? urlInput.trim() : pasteInput.trim()
    if (!input) return

    const data = await extract(input, mode)
    if (!data) return

    if (mode === 'url') setValue('url', urlInput.trim())
    if (data.platform) setValue('platform', data.platform)
    if (data.company) setValue('company', data.company)
    if (data.position) setValue('position', data.position)
    if (data.location) setValue('location', data.location)
    if (data.salary_range) setValue('salary_range', data.salary_range)
    if (data.experience_level) setValue('experience_level', data.experience_level)
    if (data.summary) setValue('summary', data.summary)
    if (data.required_skills?.length) {
      setSkills(data.required_skills)
      setValue('required_skills', data.required_skills)
    }
    setExtracted(true)
  }

  // ── Skills ──
  function addSkill() {
    const s = skillInput.trim()
    if (!s || skills.includes(s)) return
    const updated = [...skills, s]
    setSkills(updated)
    setValue('required_skills', updated)
    setSkillInput('')
  }

  function removeSkill(skill: string) {
    const updated = skills.filter(s => s !== skill)
    setSkills(updated)
    setValue('required_skills', updated)
  }

  // ── Submit ──
  async function onSubmit(data: ApplicationFormData) {
    const app = await createApplication.mutateAsync({
      ...data,
      required_skills: skills,
    })
    router.push(`/applications/${app.id}`)
  }

  const canExtract = mode === 'url' ? !!urlInput.trim() : !!pasteInput.trim()

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">New Application</h1>
        <p className="text-sm text-muted">
          Paste a job URL or description to auto-fill, or fill in manually.
        </p>
      </div>

      {/* ── AI Auto-fill ── */}
      <div className="p-5 rounded-2xl bg-card border border-border mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-accent" />
          <span className="text-sm font-medium">AI Auto-fill</span>
          <span className="text-xs text-muted ml-auto">Powered by AI</span>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 p-1 rounded-xl bg-background border border-border mb-4 w-fit">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              mode === 'url'
                ? 'bg-primary text-white'
                : 'text-muted hover:text-foreground'
            )}
          >
            <Link2 size={12} />
            URL
          </button>
          <button
            type="button"
            onClick={() => setMode('paste')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              mode === 'paste'
                ? 'bg-primary text-white'
                : 'text-muted hover:text-foreground'
            )}
          >
            <ClipboardPaste size={12} />
            Paste JD
          </button>
        </div>

        {/* URL input */}
        {mode === 'url' && (
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-background border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 transition-colors">
              <Link2 size={15} className="text-muted shrink-0" />
              <input
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleExtract()}
                placeholder="https://jobstreet.com.my/job/..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleExtract}
              disabled={!canExtract || extractState.status === 'loading'}
              className="px-4 py-2.5 bg-accent/15 hover:bg-accent/25 disabled:opacity-50 text-accent rounded-xl text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              {extractState.status === 'loading'
                ? <><Loader2 size={15} className="animate-spin" /> Extracting…</>
                : <><Sparkles size={15} /> Extract</>
              }
            </button>
          </div>
        )}

        {/* Paste input */}
        {mode === 'paste' && (
          <div className="space-y-2">
            <textarea
              value={pasteInput}
              onChange={e => setPasteInput(e.target.value)}
              rows={6}
              placeholder="Paste the full job description here — copy everything from the job listing page including title, requirements, responsibilities, and salary..."
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors resize-none"
            />
            <button
              type="button"
              onClick={handleExtract}
              disabled={!canExtract || extractState.status === 'loading'}
              className="w-full py-2.5 bg-accent/15 hover:bg-accent/25 disabled:opacity-50 text-accent rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {extractState.status === 'loading'
                ? <><Loader2 size={15} className="animate-spin" /> Extracting…</>
                : <><Sparkles size={15} /> Extract from text</>
              }
            </button>
          </div>
        )}

        {extractState.status === 'error' && (
          <div className="flex gap-2 mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            {extractState.message}
            {mode === 'url' && (
              <button
                type="button"
                onClick={() => setMode('paste')}
                className="ml-auto underline underline-offset-2 whitespace-nowrap hover:text-red-300 transition-colors"
              >
                Try paste mode →
              </button>
            )}
          </div>
        )}

        {extracted && extractState.status === 'success' && (
          <div className="flex items-center gap-2 mt-3 text-xs text-accent">
            <CheckCircle2 size={13} />
            Form auto-filled — review and adjust below.
          </div>
        )}
      </div>

      {/* ── Form ── */}
      <div className="space-y-5">

        {/* Job details */}
        <section className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Job details</h2>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="position"
              label="Position *"
              placeholder="Frontend Developer"
              {...register('position')}
              error={errors.position?.message}
            />
            <Input
              id="company"
              label="Company *"
              placeholder="Acme Corp"
              {...register('company')}
              error={errors.company?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="platform"
              label="Platform"
              placeholder="LinkedIn"
              {...register('platform')}
            />
            <Input
              id="location"
              label="Location"
              placeholder="Kuala Lumpur / Remote"
              {...register('location')}
            />
          </div>

          <Input
            id="url"
            label="Job URL"
            placeholder="https://..."
            {...register('url')}
            error={errors.url?.message}
          />
        </section>

        {/* Compensation + level */}
        <section className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Compensation</h2>

          <Input
            id="salary_range"
            label="Salary range"
            placeholder="RM 5,000 – RM 8,000/month"
            {...register('salary_range')}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Experience level</label>
            <div className="grid grid-cols-4 gap-2">
              {LEVEL_OPTIONS.map(opt => (
                <label
                  key={opt.value}
                  className="flex items-center justify-center py-2.5 rounded-xl border border-border cursor-pointer text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:text-primary transition-colors"
                >
                  <input
                    type="radio"
                    value={opt.value}
                    {...register('experience_level')}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Required skills */}
        <section className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Required skills</h2>

          <div className="flex gap-2">
            <input
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="e.g. React, TypeScript…"
              className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2.5 bg-primary/15 hover:bg-primary/25 text-primary rounded-xl transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>

          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span
                  key={skill}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-mono"
                >
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="hover:text-white transition-colors">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted text-center py-3 border border-dashed border-border rounded-xl">
              No skills added. AI will auto-fill from the job description.
            </p>
          )}
        </section>

        {/* Status + dates */}
        <section className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Status & dates</h2>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Status</label>
            <div className="relative">
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
              />
              <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="applied_date"
              type="date"
              label="Applied date *"
              {...register('applied_date')}
              error={errors.applied_date?.message}
            />
            <Input
              id="interview_date"
              type="date"
              label="Interview date"
              {...register('interview_date')}
            />
          </div>
        </section>

        {/* Notes */}
        <section className="p-6 rounded-2xl bg-card border border-border space-y-3">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Summary & notes</h2>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">AI Summary</label>
            <textarea
              {...register('summary')}
              rows={3}
              placeholder="Role summary extracted by AI…"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Personal notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Referral contact, interview prep notes, red flags…"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors resize-none"
            />
          </div>
        </section>

        {/* Submit */}
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={createApplication.isPending}
          className="w-full py-4 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-semibold rounded-xl transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2"
        >
          {createApplication.isPending
            ? <><Loader2 size={18} className="animate-spin" /> Saving…</>
            : 'Save Application'
          }
        </button>

      </div>
    </div>
  )
}