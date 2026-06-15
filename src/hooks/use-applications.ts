import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Application } from '@/types'
import type { ApplicationFormData } from '@/lib/validations/application'

export function useApplications() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Application[]
    },
  })
}

export function useApplication(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['applications', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Application
    },
    enabled: !!id,
  })
}

export function useCreateApplication() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ApplicationFormData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Calculate match score against profile skills
      const { data: profile } = await supabase
        .from('profiles')
        .select('skills')
        .eq('id', user.id)
        .single()

      let match_score: number | null = null
      if (profile?.skills?.length && payload.required_skills?.length) {
        const userSkills = profile.skills.map((s: string) => s.toLowerCase())
        const required = payload.required_skills.map(s => s.toLowerCase())
        const matches = required.filter(s => userSkills.includes(s))
        match_score = Math.round((matches.length / required.length) * 100)
      }

      const { data, error } = await supabase
        .from('applications')
        .insert({
            ...payload,
            user_id: user.id,
            match_score,
            applied_date: payload.applied_date || new Date().toISOString().split('T')[0],
            interview_date: payload.interview_date || null,  // ← add this
        })
        .select()
        .single()

      if (error) throw error
      return data as Application
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}

export function useUpdateApplication() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Application> & { id: string }) => {
      const { data, error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Application
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['applications', data.id] })
    },
  })
}

export function useDeleteApplication() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}