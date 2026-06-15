'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { STATUS_COLORS } from '@/lib/utils'
import { Radar as RadarIcon, MapPin } from 'lucide-react'
import type { Application } from '@/types'

interface Props {
  applications: Application[]
  centerCity?: string | null
}

// Haversine distance in km
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function RadarWidget({ applications }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const located = applications.filter(a => a.latitude !== null && a.longitude !== null)

  // Center = centroid of all located applications (or KL fallback)
  const center = useMemo(() => {
    if (located.length === 0) return { lat: 3.139, lng: 101.6869 }
    const lat = located.reduce((s, a) => s + a.latitude!, 0) / located.length
    const lng = located.reduce((s, a) => s + a.longitude!, 0) / located.length
    return { lat, lng }
  }, [located])

  // Max distance for scaling
  const maxDist = useMemo(() => {
    if (located.length === 0) return 1
    return Math.max(
      ...located.map(a => distanceKm(center.lat, center.lng, a.latitude!, a.longitude!)),
      1
    )
  }, [located, center])

  // Plot blips — distance maps to radius (0-100%), angle is deterministic from app id
  const blips = useMemo(() => {
    return located.map(app => {
      const dist = distanceKm(center.lat, center.lng, app.latitude!, app.longitude!)
      const radiusPct = Math.min((dist / maxDist) * 42, 42) // max 42% of container

      // Deterministic angle from id hash so it doesn't jump around on re-render
      const hash = app.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
      const angle = (hash % 360) * (Math.PI / 180)

      const x = 50 + radiusPct * Math.cos(angle)
      const y = 50 + radiusPct * Math.sin(angle)

      return { app, x, y, dist }
    })
  }, [located, center, maxDist])

  return (
    <div className="p-6 rounded-2xl bg-card border border-border">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <RadarIcon size={16} className="text-accent" />
          <h2 className="font-semibold">Application Radar</h2>
        </div>
        <span className="text-xs text-muted font-mono">{located.length} tracked</span>
      </div>

      {located.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-sm text-muted text-center px-8">
          Add applications with a location to see them appear on the radar.
        </div>
      ) : (
        <div className="relative w-full aspect-square max-w-sm mx-auto">

          {/* Radar rings */}
          {[1, 2, 3, 4].map(ring => (
            <div
              key={ring}
              className="absolute rounded-full border border-accent/15"
              style={{
                width: `${ring * 25}%`,
                height: `${ring * 25}%`,
                top: `${50 - (ring * 25) / 2}%`,
                left: `${50 - (ring * 25) / 2}%`,
              }}
            />
          ))}

          {/* Crosshair lines */}
          <div className="absolute top-0 left-1/2 w-px h-full bg-accent/10" />
          <div className="absolute top-1/2 left-0 w-full h-px bg-accent/10" />

          {/* Sweep */}
          <div
            className="absolute top-1/2 left-1/2 w-1/2 h-px origin-left animate-radar-sweep"
            style={{
              background: 'linear-gradient(90deg, #22D3EE, transparent)',
            }}
          />
          {/* Sweep glow cone */}
          <div
            className="absolute top-1/2 left-1/2 w-1/2 h-1/2 origin-bottom-left animate-radar-sweep opacity-20"
            style={{
              background: 'conic-gradient(from 0deg, #22D3EE 0deg, transparent 40deg)',
              borderRadius: '0 100% 0 0',
            }}
          />

          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_8px_#22D3EE]" />

          {/* Blips */}
          {blips.map(({ app, x, y, dist }) => {
            const color = STATUS_COLORS[app.status] ?? '#6B7280'
            const isHovered = hoveredId === app.id
            return (
              <div
                key={app.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ left: `${x}%`, top: `${y}%` }}
                onMouseEnter={() => setHoveredId(app.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Link href={`/applications/${app.id}`}>
                  <div
                    className="rounded-full transition-all cursor-pointer"
                    style={{
                      width: isHovered ? 12 : 8,
                      height: isHovered ? 12 : 8,
                      backgroundColor: color,
                      boxShadow: `0 0 ${isHovered ? 12 : 6}px ${color}`,
                    }}
                  />
                </Link>

                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-xl bg-background border border-border shadow-xl whitespace-nowrap z-20">
                    <p className="text-xs font-semibold">{app.company}</p>
                    <p className="text-xs text-muted">{app.position}</p>
                    <p className="text-xs text-muted font-mono mt-0.5">{Math.round(dist)} km away</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-5 flex-wrap">
        {Object.entries(STATUS_COLORS).slice(0, 4).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-muted capitalize">{status.replace('_', ' ')}</span>
          </div>
        ))}
      </div>

      <Link
        href="/map"
        className="flex items-center justify-center gap-1.5 mt-4 text-xs text-primary hover:text-primary/80 transition-colors"
      >
        <MapPin size={12} />
        View full map
      </Link>
    </div>
  )
}