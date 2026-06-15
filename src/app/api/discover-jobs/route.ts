import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchJooble } from '@/lib/jooble'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const remoteOnly: boolean = body.remoteOnly ?? false

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile?.target_role) {
      return NextResponse.json(
        { error: 'Set a target role in your profile first.' },
        { status: 400 }
      )
    }

    const { data: recentApps } = await supabase
      .from('applications')
      .select('position, company')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    // ── Search Jooble ──
    const results = await searchJooble({
      query: profile.target_role,
      location: profile.home_address ?? null,
      remoteOnly,
    })

    if (results.length === 0) {
      return NextResponse.json({ jobs: [], message: 'No new openings found right now.' })
    }

    // ── Filter already-seen jobs ──
    const { data: existing } = await supabase
      .from('discovered_jobs')
      .select('external_id')
      .eq('user_id', user.id)

    const seenIds = new Set(existing?.map(e => e.external_id) ?? [])
    const newResults = results.filter(r => !seenIds.has(r.id)).slice(0, 10)

    if (newResults.length === 0) {
      return NextResponse.json({ jobs: [], message: 'No new openings since last check.' })
    }

    // ── Groq fit scoring ──
    const prompt = `You are a job-matching assistant. The candidate has these skills: ${profile.skills?.join(', ') || 'none listed'}.
Target role: ${profile.target_role}.
Recent applications: ${recentApps?.map((a: { position: string; company: string }) => `${a.position} at ${a.company}`).join('; ') || 'none'}.

For each job listing below, return a JSON array with one object per listing in the SAME ORDER:
{
  "fit_score": number 0-100,
  "fit_reasoning": "1 sentence explaining the score",
  "matched_skills": ["skills from the candidate's list that appear relevant"]
}

Job listings:
${newResults.map((r, i) => `${i + 1}. ${r.title} at ${r.company} — ${r.snippet?.slice(0, 300)}`).join('\n\n')}

Return ONLY a valid JSON array, no markdown, no commentary. Array must have exactly ${newResults.length} items.`

    let scores: { fit_score: number; fit_reasoning: string; matched_skills: string[] }[] = []
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      })
      const text = completion.choices[0]?.message?.content?.trim() ?? ''
      const clean = text.replace(/```json|```/g, '').trim()
      scores = JSON.parse(clean)
    } catch {
      scores = newResults.map(() => ({ fit_score: 0, fit_reasoning: '', matched_skills: [] }))
    }

    // ── Parse salary from Jooble's string (e.g. "$80,000") ──
    function parseSalary(salaryStr: string): { min: number | null; max: number | null } {
      if (!salaryStr) return { min: null, max: null }
      const nums = salaryStr.replace(/[^0-9\-–]/g, ' ').trim().split(/[\s\-–]+/).map(Number).filter(Boolean)
      if (nums.length >= 2) return { min: nums[0], max: nums[1] }
      if (nums.length === 1) return { min: nums[0], max: null }
      return { min: null, max: null }
    }

    // ── Insert into Supabase ──
    const rows = newResults.map((r, i) => {
      const { min, max } = parseSalary(r.salary)
      return {
        user_id: user.id,
        external_id: r.id,
        source: remoteOnly ? 'jooble_remote' : 'jooble',
        title: r.title,
        company: r.company ?? null,
        location: remoteOnly ? 'Remote' : (r.location ?? null),
        salary_min: min,
        salary_max: max,
        description: r.snippet?.slice(0, 1000) ?? null,
        apply_url: r.link,
        fit_score: scores[i]?.fit_score ?? null,
        fit_reasoning: scores[i]?.fit_reasoning ?? null,
        matched_skills: scores[i]?.matched_skills ?? [],
        status: 'new',
        posted_at: r.updated ?? null,
      }
    })

    const { data: inserted, error } = await supabase
      .from('discovered_jobs')
      .insert(rows)
      .select()

    if (error) throw error

    return NextResponse.json({ jobs: inserted })

  } catch (err) {
    console.error('discover-jobs error:', err)
    return NextResponse.json({ error: 'Discovery failed. Try again.' }, { status: 500 })
  }
}

// GET — fetch cached discoveries
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('discovered_jobs')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'dismissed')
      .order('fit_score', { ascending: false })

    if (error) throw error
    return NextResponse.json({ jobs: data })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch.' }, { status: 500 })
  }
}