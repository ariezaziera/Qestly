import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { MobileHeader } from '@/components/layout/mobile-header'
import { InstallBanner } from '@/components/ui/install-banner'
import { IdleTimeoutProvider } from '@/components/providers/idle-timeout-provider'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <IdleTimeoutProvider>
      <div className="flex min-h-screen bg-background">
        <div className="hidden md:block">
          <Sidebar userEmail={user.email} userAvatarUrl={user.user_metadata?.avatar_url} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <MobileHeader
            userEmail={user.email}
            userAvatarUrl={user.user_metadata?.avatar_url}
          />
          <main className="flex-1 min-w-0 overflow-x-hidden md:ml-60 min-h-screen pb-20 md:pb-0">
            {children}
          </main>
        </div>
        <MobileNav />
        <InstallBanner />
      </div>
    </IdleTimeoutProvider>
  )
}