'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  Radar, LayoutDashboard, BriefcaseBusiness,
  Kanban, User, LogOut, Plus, Map, Compass,
  ChevronLeft, ChevronRight
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
  const [expanded, setExpanded] = useState(false)

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-card border-r border-border flex flex-col z-40 transition-[width] duration-200',
        expanded ? 'w-60' : 'w-[72px]'
      )}
    >
      {/* Logo + avatar */}
      <div className={cn(
        'p-4 border-b border-border flex items-center',
        expanded ? 'justify-between' : 'flex-col gap-3'
      )}>
        <div className={cn('flex items-center', expanded ? 'gap-2' : '')}>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
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
          {expanded && <span className="font-bold text-lg tracking-tight whitespace-nowrap">Qestly</span>}
        </div>
        {expanded && <AvatarMenu userEmail={userEmail} userAvatarUrl={userAvatarUrl} align="right" />}
        {!expanded && <AvatarMenu userEmail={userEmail} userAvatarUrl={userAvatarUrl} align="left" />}
      </div>

      {/* New application CTA */}
      <div className="p-3 border-b border-border">
        <Link
          href="/applications/new"
          title={!expanded ? 'New Application' : undefined}
          className={cn(
            'flex items-center justify-center gap-2 w-full py-2.5 bg-primary hover:bg-primary/90 text-on-primary text-sm font-medium rounded-xl transition-colors',
            !expanded && 'px-0'
          )}
        >
          <Plus size={16} className="shrink-0" />
          {expanded && <span className="whitespace-nowrap">New Application</span>}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              title={!expanded ? label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                !expanded && 'justify-center px-0',
                active
                  ? 'bg-primary/15 text-primary font-medium'
                  : 'text-muted hover:text-foreground hover:bg-white/5'
              )}
            >
              <Icon size={18} className="shrink-0" />
              {expanded && <span className="whitespace-nowrap">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Sign out + theme */}
      <div className="p-3 border-t border-border space-y-1">
        {expanded ? (
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-muted px-2">Appearance</span>
            <ThemeToggle />
          </div>
        ) : (
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
        )}
        <button
          onClick={signOut}
          title={!expanded ? 'Sign out' : undefined}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:text-foreground hover:bg-white/5 transition-colors w-full',
            !expanded && 'justify-center px-0'
          )}
        >
          <LogOut size={18} className="shrink-0" />
          {expanded && <span className="whitespace-nowrap">Sign out</span>}
        </button>

        {/* Expand/collapse toggle */}
        <button
          onClick={() => setExpanded(v => !v)}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:text-foreground hover:bg-white/5 transition-colors w-full',
            !expanded && 'justify-center px-0'
          )}
        >
          {expanded
            ? <ChevronLeft size={18} className="shrink-0" />
            : <ChevronRight size={18} className="shrink-0" />
          }
          {expanded && <span className="whitespace-nowrap">Collapse</span>}
        </button>
      </div>
    </aside>
  )
}