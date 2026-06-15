'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  Radar, LayoutDashboard, BriefcaseBusiness,
  Kanban, User, LogOut, Plus, Map, Compass
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const NAV = [
  { href: '/dashboard',    icon: LayoutDashboard,   label: 'Dashboard'    },
  { href: '/applications', icon: BriefcaseBusiness, label: 'Applications' },
  { href: '/board',        icon: Kanban,            label: 'Board'        },
  { href: '/map',          icon: Map,               label: 'Map'          },
  { href: '/discover',     icon: Compass,           label: 'Discover'     },
  { href: '/profile',      icon: User,              label: 'Profile'      },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-card border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Radar size={16} color="white" />
          </div>
          <span className="font-bold text-lg tracking-tight">JobRadar</span>
        </div>
      </div>

      {/* New application CTA */}
      <div className="p-4 border-b border-border">
        <Link
          href="/applications/new"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus size={16} />
          New Application
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                active
                  ? 'bg-primary/15 text-primary font-medium'
                  : 'text-muted hover:text-foreground hover:bg-white/5'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out + theme */}
        <div className="p-4 border-t border-border space-y-1">
            <div className="flex items-center justify-between px-1">
                <span className="text-xs text-muted px-2">Appearance</span>
                <ThemeToggle />
            </div>
            <button
                onClick={signOut}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:text-foreground hover:bg-white/5 transition-colors w-full"
            >
                <LogOut size={18} />
                Sign out
            </button>
        </div>
    </aside>
  )
}