import type { Metadata } from 'next'
import '@fontsource/syne/400.css'
import '@fontsource/syne/600.css'
import '@fontsource/syne/700.css'
import '@fontsource/syne/800.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import './globals.css'
import { QueryProvider } from '@/providers/query-provider'

export const metadata: Metadata = {
  title: 'JobRadar — Track Every Application, Land Every Opportunity',
  description: 'AI-powered job application tracker for serious job seekers.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}