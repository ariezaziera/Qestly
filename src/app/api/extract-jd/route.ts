import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import { extractedJDSchema } from '@/lib/validations/application'
import { createClient } from '@/lib/supabase/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const PROMPT = `You are a job listing parser. Extract structured data from the job listing content below.

Return ONLY a valid JSON object with these exact fields:
{
  "platform": "string or null — the job platform (e.g. LinkedIn, JobStreet, Glassdoor, Indeed). Infer from URL or page content.",
  "company": "string — company name",
  "position": "string — exact job title",
  "location": "string or null — city, country or Remote",
  "salary_range": "string or null — e.g. RM 5,000 - RM 8,000/month or RM 72,000/year",
  "experience_level": "junior | mid | senior | lead | null — infer from requirements if not stated",
  "required_skills": ["array", "of", "skill", "strings"] — extract all technical and soft skills mentioned,
  "summary": "string or null — 2-3 sentence summary of the role and key responsibilities"
}

Rules:
- Return ONLY the JSON object, no markdown, no backticks, no explanation
- If a field cannot be determined, use null
- For required_skills, extract specific technologies, tools, frameworks, languages
- Keep skill names short and clean (e.g. "React" not "React.js framework")
- For salary, preserve the original currency and format

Job listing content:
`

export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { url } = await request.json()
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Fetch the job page
    let pageContent = ''
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const html = await res.text()

      // Strip HTML tags and clean up whitespace
      pageContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 12000) // Gemini context limit safety

    } catch {
      return NextResponse.json(
        { error: 'Could not fetch the job listing. The site may block scrapers. Try copying the job description manually.' },
        { status: 422 }
      )
    }

    // Call Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(PROMPT + pageContent)
    const text = result.response.text().trim()

    // Parse and validate
    let parsed: unknown
    try {
      // Strip markdown fences if Gemini adds them anyway
      const clean = text.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(clean)
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response. Try again.' },
        { status: 500 }
      )
    }

    const validated = extractedJDSchema.safeParse(parsed)
    if (!validated.success) {
      return NextResponse.json(
        { error: 'AI returned unexpected data format.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: validated.data })

  } catch (err) {
    console.error('extract-jd error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}