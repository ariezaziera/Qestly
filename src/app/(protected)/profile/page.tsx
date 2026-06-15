'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProfile, useUpdateProfile } from '@/hooks/use-profile'
import { Input } from '@/components/ui/input'
import { X, Plus, CheckCircle2, Loader2, User, Palette, Home } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { geocodeLocation } from '@/lib/geocode'

const schema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  target_role: z.string().optional(),
  target_salary: z.coerce.number().optional(),
  work_type: z.enum(['remote', 'hybrid', 'onsite']).optional(),
  home_address: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()

  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [saved, setSaved] = useState(false)
  const [geocodingHome, setGeocodingHome] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) as any })

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name ?? '',
        target_role: profile.target_role ?? '',
        target_salary: profile.target_salary ?? undefined,
        work_type: profile.work_type ?? undefined,
        home_address: profile.home_address ?? '',
      })
      setSkills(profile.skills ?? [])
    }
  }, [profile])

  function addSkill() {
    const s = skillInput.trim()
    if (!s || skills.includes(s)) return
    setSkills(prev => [...prev, s])
    setSkillInput('')
  }

  function removeSkill(skill: string) {
    setSkills(prev => prev.filter(s => s !== skill))
  }

  async function onSubmit(data: FormData) {
    let homeCoords: { home_latitude: number | null; home_longitude: number | null } = {
      home_latitude: profile?.home_latitude ?? null,
      home_longitude: profile?.home_longitude ?? null,
    }

    if (data.home_address && data.home_address !== profile?.home_address) {
      setGeocodingHome(true)
      const geo = await geocodeLocation(data.home_address)
      homeCoords = {
        home_latitude: geo && !geo.isRemote ? geo.latitude : null,
        home_longitude: geo && !geo.isRemote ? geo.longitude : null,
      }
      setGeocodingHome(false)
    } else if (!data.home_address) {
      homeCoords = { home_latitude: null, home_longitude: null }
    }

    await updateProfile.mutateAsync({ ...data, skills, ...homeCoords })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
            <User size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-sm text-muted">Your skills and preferences power match scores.</p>
          </div>
        </div>

        <div className="space-y-6">

          {/* Basic info */}
          <section className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <h2 className="font-semibold text-sm text-muted uppercase tracking-wider">Basic info</h2>
            <Input
              id="full_name"
              label="Full name"
              placeholder="Your name"
              {...register('full_name')}
              error={errors.full_name?.message}
            />
            <Input
              id="target_role"
              label="Target role"
              placeholder="e.g. Frontend Developer"
              {...register('target_role')}
            />
          </section>

          {/* Appearance */}
          <section className="p-6 rounded-2xl bg-card border border-border">
            <h2 className="font-semibold text-sm text-muted uppercase tracking-wider mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Palette size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Theme</p>
                  <p className="text-xs text-muted">Switch between dark and light mode</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </section>

          {/* Preferences */}
          <section className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <h2 className="font-semibold text-sm text-muted uppercase tracking-wider">Preferences</h2>
            <Input
              id="target_salary"
              type="number"
              label="Target salary (RM/year)"
              placeholder="e.g. 72000"
              {...register('target_salary')}
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Work type</label>
              <div className="flex gap-3">
                {(['remote', 'hybrid', 'onsite'] as const).map(type => (
                  <label
                    key={type}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border cursor-pointer text-sm capitalize has-checked:border-primary has-checked:bg-primary/10 has-checked:text-primary transition-colors"
                  >
                    <input
                      type="radio"
                      value={type}
                      {...register('work_type')}
                      className="sr-only"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Home location */}
          <section className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <div className="flex items-center gap-2">
              <Home size={15} className="text-muted" />
              <h2 className="font-semibold text-sm text-muted uppercase tracking-wider">Home location</h2>
            </div>
            <p className="text-xs text-muted -mt-2">
              Used to calculate commute distance for each application.
            </p>
            <Input
              id="home_address"
              label="Address or area"
              placeholder="e.g. Bangsar, Kuala Lumpur"
              {...register('home_address')}
            />
            {profile?.home_latitude && (
              <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={12} />
                Location set — distance filters are active
              </p>
            )}
          </section>

          {/* Skills */}
          <section className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <div>
              <h2 className="font-semibold text-sm text-muted uppercase tracking-wider">Skills</h2>
              <p className="text-xs text-muted mt-1">Used to calculate match scores against job requirements.</p>
            </div>

            <div className="flex gap-2">
              <input
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="e.g. React, TypeScript, Next.js"
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

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-mono"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-white transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {skills.length === 0 && (
              <p className="text-sm text-muted text-center py-4 border border-dashed border-border rounded-xl">
                No skills added yet. Add some above.
              </p>
            )}
          </section>

          {/* Save button */}
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={updateProfile.isPending || geocodingHome}
            className="w-full py-3.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-semibold rounded-xl transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2"
          >
            {updateProfile.isPending || geocodingHome ? (
              <><Loader2 size={18} className="animate-spin" /> Saving…</>
            ) : saved ? (
              <><CheckCircle2 size={18} /> Saved!</>
            ) : (
              'Save profile'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}