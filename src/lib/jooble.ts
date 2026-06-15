interface JoobleJob {
  id: string
  title: string
  company: string
  location: string
  salary: string
  snippet: string
  link: string
  updated: string
  type: string
}

interface JoobleResponse {
  totalCount: number
  jobs: JoobleJob[]
}

export async function searchJooble({
  query,
  location,
  page = 1,
  remoteOnly = false,
}: {
  query: string
  location?: string | null
  page?: number
  remoteOnly?: boolean
}): Promise<JoobleJob[]> {
  const apiKey = process.env.JOOBLE_API_KEY!

  const body: Record<string, string | number | boolean> = {
    keywords: remoteOnly ? `${query} remote` : query,
    page,
    resultonpage: 20,
  }

  // For remote jobs, don't restrict by location — search worldwide
  if (!remoteOnly && location) {
    body.location = location
  }

  const res = await fetch(`https://jooble.org/api/${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(`Jooble error: ${res.status}`)

  const data: JoobleResponse = await res.json()
  return data.jobs ?? []
}