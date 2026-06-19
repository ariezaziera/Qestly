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
import { AvatarMenu } from '@/components/layout/avatar-menu'

const NAV = [
  { href: '/dashboard',    icon: LayoutDashboard,   label: 'Dashboard'    },
  { href: '/applications', icon: BriefcaseBusiness, label: 'Applications' },
  { href: '/board',        icon: Kanban,            label: 'Board'        },
  { href: '/map',          icon: Map,               label: 'Map'          },
  { href: '/discover',     icon: Compass,           label: 'Discover'     },
  { href: '/profile',      icon: User,              label: 'Profile'      },
]

type SidebarProps = {
  userEmail?: string | null
  userAvatarUrl?: string | null
}

export function Sidebar({ userEmail, userAvatarUrl }: SidebarProps) {
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
      {/* Logo + avatar */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 512 512" fill="none">
              <g transform="translate(0, 20)">
                <path d="M 56,256 A200,200 0 0,1 456,256" fill="none" stroke="#f6d365" strokeWidth="20" strokeLinecap="round" opacity="0.5"/>
                <path d="M 106,256 A150,150 0 0,1 406,256" fill="none" stroke="#f6d365" strokeWidth="20" strokeLinecap="round" opacity="0.8"/>
                <path d="M 156,256 A100,100 0 0,1 356,256" fill="none" stroke="#f6d365" strokeWidth="20" strokeLinecap="round"/>
                <line x1="256" y1="256" x2="256" y2="355" stroke="#f6d365" strokeWidth="20" strokeLinecap="round"/>
                <circle cx="256" cy="256" r="26" fill="#86efac"/>
                <line x1="272" y1="272" x2="320" y2="320" stroke="#86efac" strokeWidth="15" strokeLinecap="round"/>
              </g>
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight">Qestly</span>
        </div>
        <AvatarMenu userEmail={userEmail} userAvatarUrl={userAvatarUrl} align="right" />
      </div>

      {/* New application CTA */}
      <div className="p-4 border-b border-border">
        <Link
          href="/applications/new"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary hover:bg-primary/90 text-on-primary text-sm font-medium rounded-xl transition-colors"
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

      {/* Sign out + theme — unchanged, stays as is */}
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