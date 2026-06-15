interface AdzunaJob {
  id: string
  title: string
  company: { display_name: string }
  location: { display_name: string }
  salary_min?: number
  salary_max?: number
  description: string
  redirect_url: string
  created: string
}

export async function searchAdzuna({
  query,
  location,
  page = 1,
}: {
  query: string
  location?: string | null
  page?: number
}): Promise<AdzunaJob[]> {
  const appId = process.env.ADZUNA_APP_ID!
  const appKey = process.env.ADZUNA_APP_KEY!

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: '20',
    what: query,
    'content-type': 'application/json',
  })

  if (location) params.set('where', location)

  const url = `https://api.adzuna.com/v1/api/jobs/my/search/${page}?${params}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Adzuna error: ${res.status}`)

  const data = await res.json()
  return data.results ?? []
}