'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BriefcaseBusiness,
  Kanban,
  User,
  LogOut,
  Plus,
  Map,
  Compass,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import { ThemeToggle } from '@/components/ui/theme-toggle'
import { AvatarMenu } from '@/components/layout/avatar-menu'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/applications', icon: BriefcaseBusiness, label: 'Applications' },
  { href: '/board', icon: Kanban, label: 'Board' },
  { href: '/map', icon: Map, label: 'Map' },
  { href: '/discover', icon: Compass, label: 'Discover' },
  { href: '/profile', icon: User, label: 'Profile' },
]

type SidebarProps = {
  userEmail?: string | null
  userAvatarUrl?: string | null
}

export function Sidebar({
  userEmail,
  userAvatarUrl,
}: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const [expanded, setExpanded] = useState(true)

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className={cn(
        'h-screen bg-card border-r border-border flex flex-col flex-shrink-0 transition-all duration-200',
        expanded ? 'w-60' : 'w-[72px]'
      )}
    >

      {/* HEADER */}
      <div
        className={cn(
          'p-4 border-b border-border flex items-center',
          expanded ? 'justify-between' : 'flex-col gap-3'
        )}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="w-4 h-4 bg-primary rounded-full" />
          </div>

          {expanded && (
            <span className="font-bold text-lg">
              Qestly
            </span>
          )}
        </div>

        <AvatarMenu
          userEmail={userEmail}
          userAvatarUrl={userAvatarUrl}
          align={expanded ? 'right' : 'left'}
        />
      </div>

      {/* NEW BUTTON */}
      <div className="p-3 border-b border-border">
        <Link
          href="/applications/new"
          className={cn(
            'flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-white rounded-xl',
            !expanded && 'px-0'
          )}
        >
          <Plus size={16} />
          {expanded && <span>New Application</span>}
        </Link>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active =
            pathname === href ||
            pathname.startsWith(href + '/')

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                !expanded && 'justify-center px-0',
                active
                  ? 'bg-primary/15 text-primary font-medium'
                  : 'text-muted hover:text-foreground hover:bg-white/5'
              )}
            >
              <Icon size={18} />
              {expanded && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* COLLAPSE BUTTON (FIXED POSITION) */}
      <div className="px-3 pb-3">
        <button
          onClick={() => setExpanded(v => !v)}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-sm text-muted hover:text-foreground hover:bg-white/5',
            !expanded && 'justify-center px-0'
          )}
        >
          {expanded ? (
            <ChevronLeft size={18} />
          ) : (
            <ChevronRight size={18} />
          )}

          {expanded && <span>Collapse</span>}
        </button>
      </div>

      {/* FOOTER */}
      <div className="p-3 border-t border-border space-y-2">

        {/* THEME */}
        <div
          className={cn(
            'flex items-center',
            expanded ? 'justify-between' : 'justify-center'
          )}
        >
          {expanded && (
            <span className="text-xs text-muted">
              Appearance
            </span>
          )}
          <ThemeToggle />
        </div>

        {/* SIGN OUT */}
        <button
          onClick={signOut}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-sm text-muted hover:text-foreground hover:bg-white/5',
            !expanded && 'justify-center px-0'
          )}
        >
          <LogOut size={18} />
          {expanded && <span>Sign Out</span>}
        </button>

      </div>
    </aside>
  )
}