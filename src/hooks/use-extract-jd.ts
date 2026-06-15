import { useState } from 'react'
import type { ExtractedJD } from '@/lib/validations/application'

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: ExtractedJD }
  | { status: 'error'; message: string }

export function useExtractJD() {
  const [state, setState] = useState<State>({ status: 'idle' })

  async function extract(input: string, mode: 'url' | 'paste' = 'url') {
    setState({ status: 'loading' })

    try {
        const res = await fetch('/api/extract-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
            mode === 'url' ? { url: input } : { text: input }
        ),
        })

        const json = await res.json()

        if (!res.ok) {
        setState({ status: 'error', message: json.error ?? 'Extraction failed.' })
        return null
        }

        setState({ status: 'success', data: json.data })
        return json.data as ExtractedJD

    } catch {
        setState({ status: 'error', message: 'Network error. Check your connection.' })
        return null
    }
    }

  function reset() {
    setState({ status: 'idle' })
  }

  return { state, extract, reset }
}