import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MapClient } from '@/components/map/map-client'

export default async function MapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <MapClient applications={applications ?? []} />
}