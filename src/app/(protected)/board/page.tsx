'use client'

import { useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useApplications, useUpdateApplication } from '@/hooks/use-applications'
import { SortableCard } from '@/components/board/sortable-card'
import { ApplicationCard } from '@/components/board/application-card'
import { Plus, Loader2, Kanban, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import type { Application, ApplicationStatus } from '@/types'
import { STATUS_COLORS } from '@/lib/utils'
import { cn } from '@/lib/utils'

const COLUMNS: { id: ApplicationStatus; label: string }[] = [
  { id: 'applied',   label: 'Applied'   },
  { id: 'response',  label: 'Response'  },
  { id: 'interview', label: 'Interview' },
  { id: 'tech_test', label: 'Tech Test' },
  { id: 'offer',     label: 'Offer'     },
  { id: 'rejected',  label: 'Rejected'  },
  { id: 'ghosted',   label: 'Ghosted'   },
]

export default function BoardPage() {
  const { data: applications = [], isLoading } = useApplications()
  const updateApp = useUpdateApplication()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [localApps, setLocalApps] = useState<Application[] | null>(null)
  const [openCols, setOpenCols] = useState<Set<string>>(
    new Set(['applied', 'response', 'interview'])
  )

  const apps = localApps ?? applications

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const activeApp = activeId ? apps.find(a => a.id === activeId) : null

  const columns = useMemo(() =>
    COLUMNS.map(col => ({
      ...col,
      items: apps.filter(a => a.status === col.id),
    })),
    [apps]
  )

  function toggleCol(id: string) {
    setOpenCols(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // Mobile move handler
  async function handleMoveTo(appId: string, status: ApplicationStatus) {
    await updateApp.mutateAsync({ id: appId, status })
  }

  function onDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
    setLocalApps([...applications])
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over || !localApps) return
    const activeApp = localApps.find(a => a.id === active.id)
    if (!activeApp) return
    const overIsColumn = COLUMNS.some(c => c.id === over.id)
    const newStatus = overIsColumn
      ? (over.id as ApplicationStatus)
      : localApps.find(a => a.id === over.id)?.status
    if (!newStatus || activeApp.status === newStatus) return
    setLocalApps(prev =>
      prev!.map(a => a.id === active.id ? { ...a, status: newStatus } : a)
    )
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over || !localApps) { setLocalApps(null); return }
    const app = localApps.find(a => a.id === active.id)
    const original = applications.find(a => a.id === active.id)
    if (!app || !original) { setLocalApps(null); return }
    if (app.status !== original.status) {
      try {
        await updateApp.mutateAsync({ id: app.id, status: app.status })
      } catch {
        setLocalApps(null)
        return
      }
    }
    setLocalApps(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-10 flex flex-col h-screen">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6 sm:mb-8 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold mb-1">Board</h1>
          <p className="text-sm text-muted hidden sm:block">
            Drag applications between stages to update their status.
          </p>
          <p className="text-sm text-muted sm:hidden">
            Tap "Move" on a card to change its stage.
          </p>
        </div>
        <Link
          href="/applications/new"
          className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-xl transition-colors whitespace-nowrap"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Application</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      {applications.length === 0 ? (
        <EmptyBoard />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          {/* Desktop — horizontal scroll */}
          <div className="hidden sm:flex gap-4 overflow-x-auto pb-4 flex-1 items-start">
            {columns.map(col => (
              <DesktopColumn key={col.id} column={col} isActive={activeId !== null} />
            ))}
          </div>

          {/* Mobile — vertical accordion */}
          <div className="sm:hidden flex-1 overflow-y-auto space-y-2 pb-4">
            {columns.map(col => {
              const color = STATUS_COLORS[col.id]
              const isOpen = openCols.has(col.id)
              return (
                <div
                  key={col.id}
                  className="rounded-2xl bg-card border border-border overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleCol(col.id)}
                    className="w-full flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-sm font-semibold">{col.label}</span>
                      <span
                        className="text-xs font-mono px-2 py-0.5 rounded-md"
                        style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
                      >
                        {col.items.length}
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={cn('text-muted transition-transform', isOpen && 'rotate-180')}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-border p-3 space-y-2.5">
                      {col.items.length === 0 ? (
                        <p className="text-xs text-muted text-center py-4">No applications here.</p>
                      ) : (
                        col.items.map(app => (
                          <ApplicationCard
                            key={app.id}
                            app={app}
                            onMoveTo={(status) => handleMoveTo(app.id, status)}
                          />
                        ))
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Fix: overlay is purely visual, pointer-events-none prevents blocking drops */}
          <DragOverlay dropAnimation={null}>
            {activeApp && (
              <div
                className="rotate-2 opacity-90"
                style={{ pointerEvents: 'none' }}
              >
                <ApplicationCard app={activeApp} isDragging />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}

// ── Desktop column ──
function DesktopColumn({
  column,
  isActive,
}: {
  column: { id: ApplicationStatus; label: string; items: Application[] }
  isActive: boolean
}) {
  const color = STATUS_COLORS[column.id]
  const ids = column.items.map(a => a.id)

  return (
    <div
      className="shrink-0 w-72 flex flex-col rounded-2xl bg-card border border-border overflow-hidden"
      style={{ minHeight: '200px' }}
    >
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="text-sm font-semibold">{column.label}</span>
        </div>
        <span
          className="text-xs font-mono px-2 py-0.5 rounded-md"
          style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
        >
          {column.items.length}
        </span>
      </div>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <DroppableColumn id={column.id} isEmpty={column.items.length === 0} isActive={isActive}>
          <div className="p-3 space-y-2.5 flex-1">
            {column.items.map(app => (
              <SortableCard key={app.id} app={app} />
            ))}
          </div>
        </DroppableColumn>
      </SortableContext>
    </div>
  )
}

// ── Droppable zone ──
function DroppableColumn({
  id, children, isEmpty, isActive,
}: {
  id: string
  children: React.ReactNode
  isEmpty: boolean
  isActive: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-1 transition-colors rounded-b-2xl',
        isOver && 'bg-primary/5',
        isEmpty && isActive && 'border-2 border-dashed border-primary/20'
      )}
      style={{ minHeight: '80px' }}
    >
      {isEmpty && isActive ? (
        <div className="flex items-center justify-center h-24 text-xs text-muted">Drop here</div>
      ) : children}
    </div>
  )
}

// ── Empty board ──
function EmptyBoard() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center px-4">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-5">
        <Kanban size={26} className="text-muted" />
      </div>
      <h3 className="font-semibold text-base sm:text-lg mb-2">No applications yet</h3>
      <p className="text-sm text-muted max-w-xs mb-6">
        Add your first application and it will appear here on the board.
      </p>
      <Link
        href="/applications/new"
        className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-xl transition-colors"
      >
        <Plus size={16} />
        Add first application
      </Link>
    </div>
  )
}