import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Application } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  applied:    'Applied',
  response:   'Response',
  interview:  'Interview',
  tech_test:  'Tech Test',
  offer:      'Offer',
  rejected:   'Rejected',
  ghosted:    'Ghosted',
}

// ── Helpers ──
function formatDate(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-MY', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

function formatSkills(skills: string[]) {
  return skills?.join(', ') || '—'
}

// ─────────────────────────────────────────
// CSV Export
// ─────────────────────────────────────────
export function exportToCSV(applications: Application[], filename = 'qestly-applications') {
  const headers = [
    'Position',
    'Company',
    'Platform',
    'Location',
    'Status',
    'Match Score',
    'Salary Range',
    'Experience Level',
    'Required Skills',
    'Applied Date',
    'Interview Date',
    'Notes',
    'URL',
  ]

  const rows = applications.map(app => [
    app.position,
    app.company,
    app.platform ?? '',
    app.location ?? '',
    STATUS_LABELS[app.status] ?? app.status,
    app.match_score !== null ? `${app.match_score}%` : '',
    app.salary_range ?? '',
    app.experience_level ?? '',
    formatSkills(app.required_skills ?? []),
    formatDate(app.applied_date),
    formatDate(app.interview_date),
    (app.notes ?? '').replace(/,/g, ';').replace(/\n/g, ' '),
    app.url ?? '',
  ])

  const csvContent = [headers, ...rows]
    .map(row =>
      row.map(cell =>
        typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))
          ? `"${cell.replace(/"/g, '""')}"`
          : cell
      ).join(',')
    )
    .join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ─────────────────────────────────────────
// PDF Export — Full Report
// ─────────────────────────────────────────
export function exportToPDF(
  applications: Application[],
  profileName: string | null,
  filename = 'qestly-report'
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  // ── Color palette ──
  const BG       = [15,  15,  19]   as [number, number, number]
  const CARD     = [26,  26,  36]   as [number, number, number]
  const PRIMARY  = [99,  102, 241]  as [number, number, number]
  const ACCENT   = [34,  211, 238]  as [number, number, number]
  const MUTED    = [107, 114, 128]  as [number, number, number]
  const TEXT     = [241, 241, 245]  as [number, number, number]
  const BORDER   = [42,  42,  54]   as [number, number, number]

  const STATUS_COLORS_PDF: Record<string, [number, number, number]> = {
    applied:   [99,  102, 241],
    response:  [34,  211, 238],
    interview: [245, 158, 11],
    tech_test: [139, 92,  246],
    offer:     [16,  185, 129],
    rejected:  [239, 68,  68],
    ghosted:   [107, 114, 128],
  }

  // ─── Page 1: Cover ───
  doc.setFillColor(...BG)
  doc.rect(0, 0, pageW, pageH, 'F')

  // Accent bar top
  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, pageW, 2, 'F')

  // Logo circle
  doc.setFillColor(...PRIMARY)
  doc.circle(24, 30, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.text('◎', 21.5, 33)

  // Qestly wordmark
  doc.setTextColor(...TEXT)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Qestly', 36, 33)

  // Tagline
  doc.setTextColor(...MUTED)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Track Every Application, Land Every Opportunity', 36, 39)

  // Report title
  doc.setTextColor(...TEXT)
  doc.setFontSize(32)
  doc.setFont('helvetica', 'bold')
  doc.text('Application Report', pageW / 2, 90, { align: 'center' })

  // Candidate name
  if (profileName) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...MUTED)
    doc.text(profileName, pageW / 2, 102, { align: 'center' })
  }

  // Generated date
  doc.setFontSize(10)
  doc.setTextColor(...MUTED)
  doc.text(
    `Generated ${new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    pageW / 2, 113, { align: 'center' }
  )

  // ── Stats cards ──
  const stats = computeStats(applications)
  const cards = [
    { label: 'Total Applied',  value: String(stats.total)                              },
    { label: 'Interviews',     value: String(stats.interviews)                         },
    { label: 'Offers',         value: String(stats.offers)                             },
    { label: 'Response Rate',  value: `${stats.responseRate}%`                        },
    { label: 'Avg Match',      value: stats.avgMatch !== null ? `${stats.avgMatch}%` : '—' },
  ]

  const cardW = 42
  const cardH = 24
  const cardGap = 6
  const totalCardsW = cards.length * cardW + (cards.length - 1) * cardGap
  const startX = (pageW - totalCardsW) / 2
  const cardY = 130

  cards.forEach((card, i) => {
    const x = startX + i * (cardW + cardGap)

    // Card background
    doc.setFillColor(...CARD)
    doc.roundedRect(x, cardY, cardW, cardH, 3, 3, 'F')

    // Card border
    doc.setDrawColor(...BORDER)
    doc.setLineWidth(0.3)
    doc.roundedRect(x, cardY, cardW, cardH, 3, 3, 'S')

    // Value
    doc.setTextColor(...TEXT)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(card.value, x + cardW / 2, cardY + 11, { align: 'center' })

    // Label
    doc.setTextColor(...MUTED)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(card.label, x + cardW / 2, cardY + 18, { align: 'center' })
  })

  // Status breakdown bar
  if (applications.length > 0) {
    const barY = cardY + cardH + 16
    const barW = totalCardsW
    const barH = 6
    const barX = startX

    doc.setTextColor(...MUTED)
    doc.setFontSize(7)
    doc.text('STATUS BREAKDOWN', barX, barY - 3)

    let offsetX = barX
    const statusCounts = Object.entries(
      applications.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] ?? 0) + 1
        return acc
      }, {} as Record<string, number>)
    )

    statusCounts.forEach(([status, count]) => {
      const segW = (count / applications.length) * barW
      const color = STATUS_COLORS_PDF[status] ?? MUTED
      doc.setFillColor(...color)
      doc.rect(offsetX, barY, segW - 0.5, barH, 'F')
      offsetX += segW
    })

    // Legend
    let legendX = barX
    const legendY = barY + barH + 8
    statusCounts.forEach(([status, count]) => {
      const color = STATUS_COLORS_PDF[status] ?? MUTED
      doc.setFillColor(...color)
      doc.circle(legendX + 2, legendY - 1, 1.5, 'F')
      doc.setTextColor(...MUTED)
      doc.setFontSize(7)
      doc.text(`${STATUS_LABELS[status]} (${count})`, legendX + 6, legendY)
      legendX += 36
      if (legendX > barX + barW - 36) {
        legendX = barX
      }
    })
  }

  // Footer
  doc.setTextColor(...MUTED)
  doc.setFontSize(8)
  doc.text('Qestly — qestly.vercel.app', pageW / 2, pageH - 8, { align: 'center' })

  // ─── Page 2: Applications Table ───
  doc.addPage()
  doc.setFillColor(...BG)
  doc.rect(0, 0, pageW, pageH, 'F')

  // Page header
  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, pageW, 2, 'F')

  doc.setTextColor(...TEXT)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('All Applications', 14, 18)

  doc.setTextColor(...MUTED)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`${applications.length} total`, 14, 25)

  // Table
  autoTable(doc, {
    startY: 32,
    head: [['Company', 'Position', 'Status', 'Match', 'Level', 'Location', 'Applied', 'Skills']],
    body: applications.map(app => [
      app.company,
      app.position,
      STATUS_LABELS[app.status] ?? app.status,
      app.match_score !== null ? `${app.match_score}%` : '—',
      app.experience_level ?? '—',
      app.location ?? '—',
      formatDate(app.applied_date),
      app.required_skills?.slice(0, 4).join(', ') || '—',
    ]),
    styles: {
      font: 'helvetica',
      fontSize: 8,
      textColor: [241, 241, 245],
      fillColor: [26, 26, 36],
      lineColor: [42, 42, 54],
      lineWidth: 0.2,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [15, 15, 19],
      textColor: [107, 114, 128],
      fontStyle: 'normal',
      fontSize: 7,
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [20, 20, 30],
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 50 },
      2: { cellWidth: 22 },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 18 },
      5: { cellWidth: 35 },
      6: { cellWidth: 24 },
      7: { cellWidth: 'auto' },
    },
    didDrawCell: (data) => {
      // Color status cells
      if (data.section === 'body' && data.column.index === 2) {
        const status = applications[data.row.index]?.status
        const color = STATUS_COLORS_PDF[status]
        if (color) {
          doc.setTextColor(...color)
          doc.setFontSize(7)
          doc.text(
            STATUS_LABELS[status] ?? status,
            data.cell.x + data.cell.width / 2,
            data.cell.y + data.cell.height / 2 + 1,
            { align: 'center' }
          )
        }
      }
    },
    margin: { left: 14, right: 14 },
  })

  // ─── Page 3: Per-application detail (top 10) ───
  const detailed = applications
    .filter(a => a.notes || a.summary || (a.required_skills?.length ?? 0) > 0)
    .slice(0, 10)

  if (detailed.length > 0) {
    doc.addPage()
    doc.setFillColor(...BG)
    doc.rect(0, 0, pageW, pageH, 'F')
    doc.setFillColor(...PRIMARY)
    doc.rect(0, 0, pageW, 2, 'F')

    doc.setTextColor(...TEXT)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Application Notes', 14, 18)

    doc.setTextColor(...MUTED)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Top applications with notes and summaries', 14, 25)

    let yPos = 34
    const colW = (pageW - 28 - 8) / 2

    detailed.forEach((app, i) => {
      // Two column layout
      const isLeft = i % 2 === 0
      const xPos = isLeft ? 14 : 14 + colW + 8

      // New row — check if we need a new page
      if (isLeft && i > 0) yPos += 52
      if (yPos + 50 > pageH - 15) {
        doc.addPage()
        doc.setFillColor(...BG)
        doc.rect(0, 0, pageW, pageH, 'F')
        doc.setFillColor(...PRIMARY)
        doc.rect(0, 0, pageW, 2, 'F')
        yPos = 14
      }

      const statusColor = STATUS_COLORS_PDF[app.status] ?? MUTED

      // Card bg
      doc.setFillColor(...CARD)
      doc.roundedRect(xPos, yPos, colW, 48, 3, 3, 'F')
      doc.setDrawColor(...BORDER)
      doc.setLineWidth(0.3)
      doc.roundedRect(xPos, yPos, colW, 48, 3, 3, 'S')

      // Status accent bar left
      doc.setFillColor(...statusColor)
      doc.roundedRect(xPos, yPos, 2.5, 48, 1, 1, 'F')

      // Company + position
      doc.setTextColor(...TEXT)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(app.company, xPos + 8, yPos + 9)

      doc.setTextColor(...MUTED)
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      doc.text(app.position, xPos + 8, yPos + 15)

      // Status pill
      doc.setTextColor(...statusColor)
      doc.setFontSize(7)
      doc.text(STATUS_LABELS[app.status], xPos + colW - 8, yPos + 9, { align: 'right' })

      // Match score
      if (app.match_score !== null) {
        const matchColor = app.match_score >= 70
          ? ([16, 185, 129] as [number, number, number])
          : app.match_score >= 40
            ? ([245, 158, 11] as [number, number, number])
            : ([239, 68, 68] as [number, number, number])
        doc.setTextColor(...matchColor)
        doc.setFontSize(7)
        doc.text(`${app.match_score}% match`, xPos + colW - 8, yPos + 15, { align: 'right' })
      }

      // Divider
      doc.setDrawColor(...BORDER)
      doc.setLineWidth(0.2)
      doc.line(xPos + 8, yPos + 19, xPos + colW - 8, yPos + 19)

      // Summary or notes
      const content = app.summary || app.notes || ''
      if (content) {
        const truncated = content.length > 180 ? content.slice(0, 180) + '…' : content
        doc.setTextColor(...MUTED)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        const lines = doc.splitTextToSize(truncated, colW - 20)
        doc.text(lines.slice(0, 3), xPos + 8, yPos + 26)
      }

      // Skills chips (text only)
      if (app.required_skills?.length > 0) {
        const skills = app.required_skills.slice(0, 6).join(' · ')
        doc.setTextColor(99, 102, 241)
        doc.setFontSize(6.5)
        doc.text(skills, xPos + 8, yPos + 43)
      }
    })
  }

  // Save
  doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`)
}

// ── Stats helper ──
function computeStats(applications: Application[]) {
  const total = applications.length
  const interviews = applications.filter(
    a => ['interview', 'tech_test'].includes(a.status)
  ).length
  const offers = applications.filter(a => a.status === 'offer').length
  const responseRate = total > 0
    ? Math.round(
        applications.filter(
          a => !['applied', 'ghosted'].includes(a.status)
        ).length / total * 100
      )
    : 0
  const withScore = applications.filter(a => a.match_score !== null)
  const avgMatch = withScore.length > 0
    ? Math.round(withScore.reduce((s, a) => s + (a.match_score ?? 0), 0) / withScore.length)
    : null

  return { total, interviews, offers, responseRate, avgMatch }
}