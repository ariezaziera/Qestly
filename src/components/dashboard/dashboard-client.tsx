'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { StatusBadge, MatchScoreBadge } from '@/components/ui/badge'
import { STATUS_COLORS } from '@/lib/utils'
import {
  BriefcaseBusiness, TrendingUp, CalendarCheck,
  Award, Plus, ArrowRight, Target
} from 'lucide-react'
import type { Application, Profile } from '@/types'
import { ExportButton } from '@/components/applications/export-button'
import { RadarWidget } from './radar-widget'
import { DiscoverTeaser } from './discover-teaser'

interface Props {
  applications: Application[]
  profile: Profile | null
}

function useChartColors() {
  const [colors, setColors] = useState({
    grid: '#2A2A36',
    text: '#6B7280',
    tooltipBg: '#1A1A24',
    tooltipBorder: '#2A2A36',
  })

  useEffect(() => {
    const root = document.documentElement
    const get = (v: string) => `rgb(${getComputedStyle(root).getPropertyValue(v).trim()})`

    const update = () => setColors({
      grid: get('--color-border'),
      text: get('--color-muted'),
      tooltipBg: get('--color-card'),
      tooltipBorder: get('--color-border'),
    })

    update()

    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return colors
}

export function DashboardClient({ applications, profile }: Props) {
  const stats = useMemo(() => computeStats(applications), [applications])
  const chartColors = useChartColors()

  return (
    <div className="px-8 py-10 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            {profile?.full_name
              ? `Hey, ${profile.full_name.split(' ')[0]} 👋`
              : 'Dashboard'}
          </h1>
          <p className="text-sm text-muted">Here's how your job search is going.</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton
            applications={applications}
            profileName={profile?.full_name}
          />
          <Link
            href="/applications/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Plus size={16} />
            New Application
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BriefcaseBusiness}
          label="Total Applied"
          value={stats.total}
          sub={`${stats.thisWeek} this week`}
          color="#6366F1"
        />
        <StatCard
          icon={CalendarCheck}
          label="Interviews"
          value={stats.interviews}
          sub={`${stats.responseRate}% response rate`}
          color="#22D3EE"
        />
        <StatCard
          icon={Award}
          label="Offers"
          value={stats.offers}
          sub={stats.offers > 0 ? '🎉 Congrats!' : 'Keep pushing'}
          color="#10B981"
        />
        <StatCard
          icon={Target}
          label="Avg Match"
          value={stats.avgMatch !== null ? `${stats.avgMatch}%` : '—'}
          sub="vs your skill profile"
          color="#F59E0B"
          mono
        />
      </div>

      {/* Charts row — area chart + radar */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold">Applications over time</h2>
              <p className="text-xs text-muted mt-0.5">Last 8 weeks</p>
            </div>
            <TrendingUp size={18} className="text-muted" />
          </div>
          {stats.timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.timeline} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fill: chartColors.text, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: chartColors.text, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fill="url(#areaGrad)"
                  dot={{ fill: '#6366F1', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: '#6366F1' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : <ChartEmpty />}
        </div>

        <RadarWidget applications={applications} />
      </div>

      {/* Status breakdown + Discover teaser */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold">Status breakdown</h2>
              <p className="text-xs text-muted mt-0.5">{stats.total} total</p>
            </div>
          </div>
          {stats.statusBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={stats.statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {stats.statusBreakdown.map(entry => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, _, p) => [v, p.payload.label]}
                    contentStyle={{
                      background: chartColors.tooltipBg,
                      border: `1px solid ${chartColors.tooltipBorder}`,
                      borderRadius: '10px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {stats.statusBreakdown.map(s => (
                  <div key={s.status} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[s.status] }}
                      />
                      <span className="text-muted">{s.label}</span>
                    </div>
                    <span className="font-mono font-medium">{s.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <ChartEmpty />}
        </div>

        <DiscoverTeaser />
      </div>

      {/* Match score bar chart */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold">Match score distribution</h2>
            <p className="text-xs text-muted mt-0.5">How well your skills match each role</p>
          </div>
        </div>
        {stats.matchDistribution.some(d => d.count > 0) ? (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stats.matchDistribution} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
              <XAxis
                dataKey="range"
                tick={{ fill: chartColors.text, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: chartColors.text, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip label="applications" />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {stats.matchDistribution.map((entry) => (
                  <Cell
                    key={entry.range}
                    fill={
                      entry.rangeStart >= 70 ? '#10B981' :
                      entry.rangeStart >= 40 ? '#F59E0B' : '#EF4444'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <ChartEmpty />}
      </div>

      {/* Recent applications */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold">Recent applications</h2>
          <Link
            href="/applications"
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted mb-4">No applications yet.</p>
            <Link
              href="/applications/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/15 hover:bg-primary/25 text-primary text-sm rounded-xl transition-colors"
            >
              <Plus size={14} />
              Add your first
            </Link>
          </div>
        ) : (
          <div className="space-y-px">
            {applications.slice(0, 5).map(app => (
              <Link
                key={app.id}
                href={`/applications/${app.id}`}
                className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-sm truncate">{app.company}</p>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-xs text-muted truncate mt-0.5">{app.position}</p>
                </div>
                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                  <MatchScoreBadge score={app.match_score} />
                  <span className="text-xs text-muted font-mono">
                    {new Date(app.applied_date).toLocaleDateString('en-MY', {
                      day: 'numeric', month: 'short'
                    })}
                  </span>
                  <ArrowRight
                    size={14}
                    className="text-muted opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Profile nudge if skills empty */}
      {(!profile?.skills || profile.skills.length === 0) && (
        <div className="flex items-center justify-between p-5 rounded-2xl bg-primary/10 border border-primary/20">
          <div>
            <p className="font-semibold text-sm">Complete your profile</p>
            <p className="text-xs text-muted mt-0.5">
              Add your skills to unlock match scores on every application.
            </p>
          </div>
          <Link
            href="/profile"
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-xl transition-colors whitespace-nowrap"
          >
            Add skills
          </Link>
        </div>
      )}

    </div>
  )
}

function StatCard({
  icon: Icon, label, value, sub, color, mono = false,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub: string
  color: string
  mono?: boolean
}) {
  return (
    <div className="p-5 rounded-2xl bg-card border border-border">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <p className={`text-2xl font-bold mb-1 ${mono ? 'font-mono' : ''}`}>{value}</p>
      <p className="text-xs font-medium text-foreground mb-0.5">{label}</p>
      <p className="text-xs text-muted">{sub}</p>
    </div>
  )
}

function CustomTooltip({ active, payload, label: axisLabel, label: propLabel }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-xl bg-card border border-border text-xs shadow-xl">
      <p className="text-muted mb-1">{axisLabel}</p>
      <p className="font-mono font-semibold text-foreground">
        {payload[0].value} {propLabel ?? 'applications'}
      </p>
    </div>
  )
}

function ChartEmpty() {
  return (
    <div className="flex items-center justify-center h-40 text-sm text-muted">
      Not enough data yet — keep adding applications.
    </div>
  )
}

const STATUS_LABEL_MAP: Record<string, string> = {
  applied: 'Applied', response: 'Response', interview: 'Interview',
  tech_test: 'Tech Test', offer: 'Offer', rejected: 'Rejected', ghosted: 'Ghosted',
}

function computeStats(applications: Application[]) {
  const total = applications.length

  const interviews = applications.filter(
    a => ['interview', 'tech_test'].includes(a.status)
  ).length

  const offers = applications.filter(a => a.status === 'offer').length

  const responseRate = total > 0
    ? Math.round(
        (applications.filter(a => a.status !== 'applied' && a.status !== 'ghosted').length / total) * 100
      )
    : 0

  const withScore = applications.filter(a => a.match_score !== null)
  const avgMatch = withScore.length > 0
    ? Math.round(withScore.reduce((s, a) => s + (a.match_score ?? 0), 0) / withScore.length)
    : null

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const thisWeek = applications.filter(
    a => new Date(a.applied_date) >= weekAgo
  ).length

  const timeline = Array.from({ length: 8 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (7 - i) * 7)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    const count = applications.filter(a => {
      const date = new Date(a.applied_date)
      return date >= weekStart && date <= weekEnd
    }).length

    return {
      week: d.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' }),
      count,
    }
  })

  const statusBreakdown = Object.entries(
    applications.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)
  )
    .map(([status, count]) => ({
      status,
      count,
      label: STATUS_LABEL_MAP[status] ?? status,
    }))
    .sort((a, b) => b.count - a.count)

  const matchDistribution = [
    { range: '0–20%', rangeStart: 0, rangeEnd: 20 },
    { range: '21–40%', rangeStart: 21, rangeEnd: 40 },
    { range: '41–60%', rangeStart: 41, rangeEnd: 60 },
    { range: '61–80%', rangeStart: 61, rangeEnd: 80 },
    { range: '81–100%', rangeStart: 81, rangeEnd: 100 },
  ].map(bucket => ({
    ...bucket,
    count: withScore.filter(
      a => (a.match_score ?? 0) >= bucket.rangeStart &&
           (a.match_score ?? 0) <= bucket.rangeEnd
    ).length,
  }))

  return {
    total, interviews, offers, responseRate,
    avgMatch, thisWeek, timeline,
    statusBreakdown, matchDistribution,
  }
}