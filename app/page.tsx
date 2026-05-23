'use client'

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import {
  getDailyPrompt,
  getDailyStartOrder,
  getPuzzleNumber,
  type Prompt,
} from '@/data/prompts'

function getScore(items: string[], correctOrder: readonly string[]): number {
  return items.reduce(
    (acc, item, index) => acc + (item === correctOrder[index] ? 1 : 0),
    0,
  )
}

function getResultMessage(score: number): string {
  if (score === 5) return '🧠 PERFECTLY CALIBRATED'
  if (score >= 4) return '🔥 YOU READ THE ROOM'
  if (score >= 3) return '⚡ MOSTLY TUNED IN'
  if (score >= 2) return '🌪 SLIGHTLY OUT OF SYNC'
  return '💀 AGGRESSIVELY OFFLINE'
}

function buildShareGrid(
  items: string[],
  correctOrder: readonly string[],
): string {
  return items
    .map((item, index) => (item === correctOrder[index] ? '🟩' : '⬛'))
    .join('\n')
}

function buildShareText(
  score: number,
  resultMessage: string,
  items: string[],
  correctOrder: readonly string[],
): string {
  const puzzle = getPuzzleNumber()
  const grid = buildShareGrid(items, correctOrder)
  const url = typeof window !== 'undefined' ? window.location.origin : ''

  return `Ranked ${puzzle} ${score}/5\n\n${grid}\n\n${resultMessage}\n\n${url}`
}

function SortableItem({ id, label }: { id: string; label: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-zinc-900 rounded-2xl p-4 flex items-center justify-between touch-none select-none ${
        isDragging ? 'opacity-40' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <span className="font-medium">{label}</span>
      <span
        className="text-zinc-500 text-xl leading-none cursor-grab active:cursor-grabbing"
        aria-hidden
      >
        ⠿
      </span>
    </div>
  )
}

function ItemPreview({ label }: { label: string }) {
  return (
    <div className="bg-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-2xl ring-2 ring-white/10 scale-[1.02]">
      <span className="font-medium">{label}</span>
      <span className="text-zinc-500 text-xl leading-none" aria-hidden>
        ⠿
      </span>
    </div>
  )
}

export default function Home() {
  const [prompt] = useState<Prompt>(() => getDailyPrompt())
  const [items, setItems] = useState(() => getDailyStartOrder(prompt))

  const [activeId, setActiveId] = useState<string | null>(null)
  const [result, setResult] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    setItems((current) => {
      const oldIndex = current.indexOf(String(active.id))
      const newIndex = current.indexOf(String(over.id))
      return arrayMove(current, oldIndex, newIndex)
    })
  }

  const calculateScore = () => {
    const nextScore = getScore(items, prompt.correctOrder)
    setScore(nextScore)
    setResult(getResultMessage(nextScore))
    setCopied(false)
  }

  const handleShare = async () => {
    if (score === null || !result) return

    const text = buildShareText(score, result, items, prompt.correctOrder)

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-5xl font-bold mb-2">Ranked</h1>

        <p className="text-gray-400 mb-2">
          {prompt.description} Drag to reorder.
        </p>
        <p className="text-zinc-600 text-sm mb-8">#{getPuzzleNumber()}</p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {items.map((item) => (
                <SortableItem key={item} id={item} label={item} />
              ))}
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
            {activeId ? <ItemPreview label={activeId} /> : null}
          </DragOverlay>
        </DndContext>

        <button
          onClick={calculateScore}
          className="w-full mt-6 bg-white text-black font-bold py-4 rounded-2xl"
        >
          Submit Ranking
        </button>

        {result && score !== null && (
          <div className="mt-6 bg-zinc-900 rounded-2xl p-6 text-center space-y-4">
            <p className="text-2xl font-bold">{result}</p>
            <p className="text-sm text-zinc-400 font-mono whitespace-pre leading-relaxed">
              {`Ranked ${getPuzzleNumber()} ${score}/5\n\n${buildShareGrid(items, prompt.correctOrder)}`}
            </p>
            <button
              type="button"
              onClick={handleShare}
              className="w-full bg-zinc-700 hover:bg-zinc-600 font-bold py-3 rounded-xl transition-colors"
            >
              {copied ? 'Copied!' : 'Share'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
