'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type SidebarContextType = {
  expanded: boolean
  setExpanded: (value: boolean) => void
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)
const STORAGE_KEY = 'qestly-sidebar-expanded'

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Lazy init reads localStorage immediately on the client so there's
  // minimal flash. (A tiny mismatch flash can still occur during SSR
  // hydration — add a blocking <script> in the root layout later if it bugs you.)
  const [expanded, setExpanded] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  const toggle = () => setExpanded((v) => !v)

  // Persist whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(expanded))
    } catch {
      // private browsing / storage disabled — fail silently
    }
  }, [expanded])

  // Keyboard shortcut: Cmd/Ctrl + B
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}