'use client'

import Link from 'next/link'
import { AvatarMenu } from '@/components/layout/avatar-menu'

type MobileHeaderProps = {
  userEmail?: string | null
  userAvatarUrl?: string | null
}

export function MobileHeader({ userEmail, userAvatarUrl }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 md:hidden bg-card/90 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 512 512" fill="none">
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
          <span className="font-bold text-base tracking-tight">Qestly</span>
        </Link>

        <AvatarMenu userEmail={userEmail} userAvatarUrl={userAvatarUrl} align="right" />
      </div>
    </header>
  )
}