import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { DiscoveredJob } from '@/types'

export function useDiscoveredJobs() {
  return useQuery({
    queryKey: ['discovered-jobs'],
    queryFn: async () => {
      const res = await fetch('/api/discover-jobs')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.jobs as DiscoveredJob[]
    },
  })
}

export function useRunDiscovery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/discover-jobs', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discovered-jobs'] })
    },
  })
}

export function useUpdateDiscoveredJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/discover-jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.job
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discovered-jobs'] })
    },
  })
}