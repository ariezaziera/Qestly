import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { InstallBanner } from '@/components/ui/install-banner'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="flex-1 min-w-0 overflow-x-hidden md:ml-60 min-h-screen pb-20 md:pb-0">
        {children}
      </main>
      <MobileNav />
      <InstallBanner />
    </div>
  )
}