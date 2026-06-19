'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type AvatarMenuProps = {
  userEmail?: string | null
  userAvatarUrl?: string | null
  align?: 'left' | 'right'
}

export function AvatarMenu({ userEmail, userAvatarUrl, align = 'right' }: AvatarMenuProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initial = userEmail?.charAt(0).toUpperCase() ?? '?'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-white/5 transition-colors"
        aria-label="Account menu"
        aria-expanded={open}
      >
        {userAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={userAvatarUrl}
            alt=""
            className="w-7 h-7 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-semibold flex items-center justify-center">
            {initial}
          </div>
        )}
        <ChevronDown
          size={14}
          className={cn('text-muted transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          className={cn(
            'absolute top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 z-50',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {userEmail && (
            <div className="px-3 py-2.5 border-b border-border">
              <p className="text-xs text-muted truncate">{userEmail}</p>
            </div>
          )}
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-white/5 transition-colors"
          >
            <User size={16} />
            Profile
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-2.5 px-3 py-2.5 w-full text-sm text-error hover:bg-error/10 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}