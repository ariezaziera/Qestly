'use client'

import { useState } from 'react'
import { useExtractJD } from '@/hooks/use-extract-jd'
import { Loader2, Sparkles, AlertCircle } from 'lucide-react'

export default function TestExtractPage() {
  const [url, setUrl] = useState('')
  const { state, extract } = useExtractJD()

  return (
    <div className="min-h-screen bg-background p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">JD Extractor — Dev Test</h1>
      <p className="text-muted text-sm mb-8">Paste a job listing URL to test Gemini extraction.</p>

      <div className="flex gap-3 mb-6">
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://www.jobstreet.com.my/..."
          className="flex-1 px-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
        />
        <button
          onClick={() => extract(url)}
          disabled={!url || state.status === 'loading'}
          className="px-5 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          {state.status === 'loading'
            ? <><Loader2 size={16} className="animate-spin" /> Extracting…</>
            : <><Sparkles size={16} /> Extract</>
          }
        </button>
      </div>

      {state.status === 'error' && (
        <div className="flex gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          {state.message}
        </div>
      )}

      {state.status === 'success' && (
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex items-center gap-2 text-accent text-sm font-medium mb-2">
            <Sparkles size={15} />
            Extraction successful
          </div>

          {[
            ['Platform', state.data.platform],
            ['Company', state.data.company],
            ['Position', state.data.position],
            ['Location', state.data.location],
            ['Salary', state.data.salary_range],
            ['Level', state.data.experience_level],
            ['Summary', state.data.summary],
          ].map(([label, value]) => value && (
            <div key={label as string}>
              <p className="text-xs text-muted uppercase tracking-wider mb-1">{label}</p>
              <p className="text-sm text-foreground">{value}</p>
            </div>
          ))}

          {state.data.required_skills.length > 0 && (
            <div>
              <p className="text-xs text-muted uppercase tracking-wider mb-2">Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {state.data.required_skills.map(skill => (
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
      )}
    </div>
  )
}