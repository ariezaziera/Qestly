'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { STATUS_COLORS } from '@/lib/utils'
import 'leaflet/dist/leaflet.css'
import type { Application } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  applied: 'Applied', response: 'Response', interview: 'Interview',
  tech_test: 'Tech Test', offer: 'Offer', rejected: 'Rejected', ghosted: 'Ghosted',
}

interface Props {
  applications: Application[]
}

export default function LeafletMap({ applications }: Props) {
  const center: [number, number] = applications.length > 0
    ? [applications[0].latitude!, applications[0].longitude!]
    : [3.139, 101.6869]

  return (
    <MapContainer
      center={center}
      zoom={6}
      style={{ height: '100%', width: '100%', background: '#0F0F13' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      <FitBounds applications={applications} />

      {applications.map(app => {
        const color = STATUS_COLORS[app.status] ?? '#6B7280'
        return (
          <CircleMarker
            key={app.id}
            center={[app.latitude!, app.longitude!]}
            radius={9}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.6,
              weight: 2,
            }}
          >
            <Popup>
              <div style={{ minWidth: 200, fontFamily: 'Syne, sans-serif' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <strong style={{ fontSize: 13 }}>{app.company}</strong>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: 'JetBrains Mono, monospace',
                      color,
                      background: `${color}18`,
                      border: `1px solid ${color}30`,
                      borderRadius: 6,
                      padding: '2px 6px',
                    }}
                  >
                    {STATUS_LABELS[app.status]}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 6px 0' }}>
                  {app.position}
                </p>
                <p style={{ fontSize: 11, color: '#6B7280', margin: '0 0 8px 0' }}>
                  📍 {app.location}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {app.match_score !== null && (
                    <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#6366F1' }}>
                      {app.match_score}% match
                    </span>
                  )}
                  <a
                    href={`/applications/${app.id}`}
                    style={{ fontSize: 11, color: '#6366F1', textDecoration: 'none', fontWeight: 600 }}
                  >
                    View →
                  </a>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}

function FitBounds({ applications }: { applications: Application[] }) {
  const map = useMap()

  useEffect(() => {
    if (applications.length === 0) return
    if (applications.length === 1) {
      map.setView([applications[0].latitude!, applications[0].longitude!], 12)
      return
    }
    const bounds = applications.map(a => [a.latitude!, a.longitude!] as [number, number])
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 })
  }, [applications, map])

  return null
}