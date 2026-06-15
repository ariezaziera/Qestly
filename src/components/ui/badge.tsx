import { cn } from '@/lib/utils'
import { STATUS_COLORS } from '@/lib/utils'

interface BadgeProps {
  status: string
  className?: string
}

const STATUS_LABELS: Record<string, string> = {
  applied: 'Applied',
  response: 'Response',
  interview: 'Interview',
  tech_test: 'Tech Test',
  offer: 'Offer',
  rejected: 'Rejected',
  ghosted: 'Ghosted',
}

export function StatusBadge({ status, className }: BadgeProps) {
  const color = STATUS_COLORS[status] ?? '#6B7280'
  const label = STATUS_LABELS[status] ?? status

  return (
    <span
      className={cn('px-2.5 py-1 rounded-lg text-xs font-medium font-mono', className)}
      style={{
        color,
        backgroundColor: `${color}18`,
        border: `1px solid ${color}30`,
      }}
    >
      {label}
    </span>
  )
}

interface MatchScoreBadgeProps {
  score: number | null
  className?: string
}

export function MatchScoreBadge({ score, className }: MatchScoreBadgeProps) {
  if (score === null) return (
    <span className={cn('text-xs text-muted font-mono', className)}>—</span>
  )

  const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444'

  return (
    <span
      className={cn('px-2.5 py-1 rounded-lg text-xs font-mono font-medium', className)}
      style={{
        color,
        backgroundColor: `${color}18`,
        border: `1px solid ${color}30`,
      }}
    >
      {score}%
    </span>
  )
}