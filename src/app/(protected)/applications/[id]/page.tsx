import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ApplicationDetail } from '@/components/applications/application-detail'

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: application }, { data: { user } }] = await Promise.all([
    supabase.from('applications').select('*').eq('id', id).single(),
    supabase.auth.getUser(),
  ])

  if (!application || application.user_id !== user?.id) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('skills')
    .eq('id', user!.id)
    .single()

  return (
    <ApplicationDetail
      application={application}
      userSkills={profile?.skills ?? []}
    />
  )
}