'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BriefcaseBusiness, Kanban, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard',    icon: LayoutDashboard,  label: 'Dashboard'   },
  { href: '/applications', icon: BriefcaseBusiness, label: 'Applications' },
  { href: '/board',        icon: Kanban,      label: 'Board'       },
  { href: '/profile',      icon: User,              label: 'Profile'     },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-card/90 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors min-w-0',
                active ? 'text-primary' : 'text-muted hover:text-foreground'
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span className={cn(
                'text-[10px] font-medium truncate',
                active ? 'text-primary' : 'text-muted'
              )}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}