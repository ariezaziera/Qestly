import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchAdzuna } from '@/lib/adzuna'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

    // ── Build search query from profile + application history ──
    const { data: recentApps } = await supabase
      .from('applications')
      .select('position, company')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    const searchQuery = profile.target_role
    const searchLocation = profile.home_address ?? null

    // ── Search Adzuna ──
    const results = await searchAdzuna({
      query: searchQuery,
      location: searchLocation,
    })

    if (results.length === 0) {
      return NextResponse.json({ jobs: [], message: 'No new openings found right now.' })
    }

    // ── Filter out already-seen jobs ──
    const { data: existing } = await supabase
      .from('discovered_jobs')
      .select('external_id')
      .eq('user_id', user.id)

    const seenIds = new Set(existing?.map(e => e.external_id) ?? [])
    const newResults = results.filter(r => !seenIds.has(r.id)).slice(0, 10)

    if (newResults.length === 0) {
      return NextResponse.json({ jobs: [], message: 'No new openings since last check.' })
    }

    // ── Groq fit scoring (batch) ──
    const prompt = `You are a job-matching assistant. The candidate has these skills: ${profile.skills?.join(', ') || 'none listed'}.
Target role: ${profile.target_role}.
Recent applications: ${recentApps?.map((a: { position: string; company: string }) => `${a.position} at ${a.company}`).join('; ') || 'none'}.

For each job listing below, return a JSON array with one object per listing in the SAME ORDER:
{
  "fit_score": number 0-100 (how well this matches the candidate's skills and target role),
  "fit_reasoning": "1 sentence explaining the score",
  "matched_skills": ["skills from the candidate's list that appear relevant to this job"]
}

Job listings:
${newResults.map((r, i) => `${i + 1}. ${r.title} at ${r.company.display_name} — ${r.description.slice(0, 300)}`).join('\n\n')}

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

    // ── Insert into Supabase ──
    const rows = newResults.map((r, i) => ({
      user_id: user.id,
      external_id: r.id,
      source: 'adzuna',
      title: r.title,
      company: r.company?.display_name ?? null,
      location: r.location?.display_name ?? null,
      salary_min: r.salary_min ?? null,
      salary_max: r.salary_max ?? null,
      description: r.description?.slice(0, 1000) ?? null,
      apply_url: r.redirect_url,
      fit_score: scores[i]?.fit_score ?? null,
      fit_reasoning: scores[i]?.fit_reasoning ?? null,
      matched_skills: scores[i]?.matched_skills ?? [],
      status: 'new',
      posted_at: r.created ?? null,
    }))

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