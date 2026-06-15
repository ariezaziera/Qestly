import Link from 'next/link'
import { MatchScoreBadge } from '@/components/ui/badge'
import { MapPin, Calendar, ExternalLink } from 'lucide-react'
import type { Application } from '@/types'

interface Props {
  app: Application
  isDragging?: boolean
}

export function ApplicationCard({ app, isDragging }: Props) {
  return (
    <div
      className={`
        p-4 rounded-xl bg-background border border-border
        hover:border-primary/30 transition-colors cursor-grab active:cursor-grabbing
        ${isDragging ? 'shadow-2xl shadow-primary/20 border-primary/40' : ''}
      `}
    >
      {/* Company + match score */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{app.company}</p>
          {app.platform && (
            <p className="text-xs text-muted truncate">{app.platform}</p>
          )}
        </div>
        <MatchScoreBadge score={app.match_score} className="flex-shrink-0" />
      </div>

      {/* Position */}
      <p className="text-sm text-muted truncate mb-3">{app.position}</p>

      {/* Meta */}
      <div className="space-y-1.5 mb-3">
        {app.location && (
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <MapPin size={11} className="flex-shrink-0" />
            <span className="truncate">{app.location}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Calendar size={11} className="flex-shrink-0" />
          <span>
            {new Date(app.applied_date).toLocaleDateString('en-MY', {
              day: 'numeric', month: 'short'
            })}
          </span>
        </div>
      </div>

      {/* Skills preview */}
      {app.required_skills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {app.required_skills.slice(0, 3).map(skill => (
            <span
              key={skill}
              className="px-1.5 py-0.5 rounded text-xs font-mono bg-primary/10 text-primary/80"
            >
              {skill}
            </span>
          ))}
          {app.required_skills.length > 3 && (
            <span className="px-1.5 py-0.5 rounded text-xs text-muted">
              +{app.required_skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <Link
          href={`/applications/${app.id}`}
          onClick={e => e.stopPropagation()}
          className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
        >
          View details
        </Link>
        {app.url && (
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-muted hover:text-foreground transition-colors"
          >
            <ExternalLink size={13} />
          </a>
        )}
      </div>
    </div>
  )
}