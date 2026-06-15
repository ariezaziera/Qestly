'use client'

import { useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useApplications, useUpdateApplication } from '@/hooks/use-applications'
import { StatusBadge } from '@/components/ui/badge'
import { SortableCard } from '@/components/board/sortable-card'
import { ApplicationCard } from '@/components/board/application-card'
import { Plus, Loader2, Kanban } from 'lucide-react'
import Link from 'next/link'
import type { Application, ApplicationStatus } from '@/types'
import { STATUS_COLORS } from '@/lib/utils'

// ── Column config ──
const COLUMNS: { id: ApplicationStatus; label: string }[] = [
  { id: 'applied',    label: 'Applied'    },
  { id: 'response',   label: 'Response'   },
  { id: 'interview',  label: 'Interview'  },
  { id: 'tech_test',  label: 'Tech Test'  },
  { id: 'offer',      label: 'Offer'      },
  { id: 'rejected',   label: 'Rejected'   },
  { id: 'ghosted',    label: 'Ghosted'    },
]

export default function BoardPage() {
  const { data: applications = [], isLoading } = useApplications()
  const updateApp = useUpdateApplication()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [localApps, setLocalApps] = useState<Application[] | null>(null)

  // Use local optimistic state while dragging, otherwise use server data
  const apps = localApps ?? applications

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  )

  const activeApp = activeId ? apps.find(a => a.id === activeId) : null

  const columns = useMemo(() =>
    COLUMNS.map(col => ({
      ...col,
      items: apps.filter(a => a.status === col.id),
    })),
    [apps]
  )

  // ── Drag handlers ──
  function onDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
    setLocalApps([...applications])
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over || !localApps) return

    const activeApp = localApps.find(a => a.id === active.id)
    if (!activeApp) return

    // Dragging over a column id directly
    const overIsColumn = COLUMNS.some(c => c.id === over.id)
    const newStatus = overIsColumn
      ? (over.id as ApplicationStatus)
      : localApps.find(a => a.id === over.id)?.status

    if (!newStatus || activeApp.status === newStatus) return

    setLocalApps(prev =>
      prev!.map(a =>
        a.id === active.id ? { ...a, status: newStatus } : a
      )
    )
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over || !localApps) {
      setLocalApps(null)
      return
    }

    const app = localApps.find(a => a.id === active.id)
    const original = applications.find(a => a.id === active.id)

    if (!app || !original) {
      setLocalApps(null)
      return
    }

    // Only save if status actually changed
    if (app.status !== original.status) {
      try {
        await updateApp.mutateAsync({ id: app.id, status: app.status })
      } catch {
        // Revert on error
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
    <div className="px-8 py-10 h-screen flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold mb-1">Board</h1>
          <p className="text-sm text-muted">
            Drag applications between stages to update their status.
          </p>
        </div>
        <Link
          href="/applications/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus size={16} />
          New Application
        </Link>
      </div>

      {/* Board */}
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
          <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start">
            {columns.map(col => (
              <Column key={col.id} column={col} isActive={activeId !== null} />
            ))}
          </div>

          {/* Drag overlay — floating card while dragging */}
          <DragOverlay>
            {activeApp && (
              <div className="rotate-2 opacity-95 pointer-events-none">
                <ApplicationCard app={activeApp} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}

// ── Column ──
function Column({
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
      className="flex-shrink-0 w-72 flex flex-col rounded-2xl bg-card border border-border overflow-hidden"
      style={{ minHeight: '200px' }}
    >
      {/* Column header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-semibold">{column.label}</span>
        </div>
        <span
          className="text-xs font-mono px-2 py-0.5 rounded-md"
          style={{
            color,
            backgroundColor: `${color}18`,
            border: `1px solid ${color}30`,
          }}
        >
          {column.items.length}
        </span>
      </div>

      {/* Droppable area */}
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
import { useDroppable } from '@dnd-kit/core'

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
        'flex-1 min-h-[120px] transition-colors rounded-b-2xl',
        isOver && 'bg-primary/5',
        isEmpty && isActive && 'border-2 border-dashed border-primary/20'
      )}
    >
      {isEmpty && isActive ? (
        <div className="flex items-center justify-center h-24 text-xs text-muted">
          Drop here
        </div>
      ) : children}
    </div>
  )
}

// ── Empty board ──
function EmptyBoard() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center">
      <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-5">
        <Kanban size={28} className="text-muted" />
      </div>
      <h3 className="font-semibold text-lg mb-2">No applications yet</h3>
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

import { cn } from '@/lib/utils'