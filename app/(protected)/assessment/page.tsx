'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { CategorySection } from '@/components/checklist/CategorySection'
import { Button } from '@/components/ui/Button'
import type { AssessmentData, ProgressStatus } from '@/types'

interface LocalProgress {
  status: ProgressStatus
  confidenceScore: number
}

interface Toast {
  message: string
  type: 'success' | 'error' | 'info'
}

export default function AssessmentPage() {
  const [data, setData] = useState<AssessmentData | null>(null)
  const [progressMap, setProgressMap] = useState<Record<string, LocalProgress>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [error, setError] = useState('')
  const pendingChangesRef = useRef<Record<string, LocalProgress>>({})
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(message: string, type: Toast['type'] = 'success') {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ message, type })
    toastTimerRef.current = setTimeout(() => setToast(null), 3000)
  }

  // Load assessment data
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/assessment')
        if (!res.ok) throw new Error('Failed to load')
        const json: AssessmentData = await res.json()
        setData(json)

        // Initialize local progress map from server data
        const initial: Record<string, LocalProgress> = {}
        for (const [id, record] of Object.entries(json.progressMap)) {
          initial[id] = { status: record.status, confidenceScore: record.confidenceScore }
        }
        setProgressMap(initial)
      } catch (err) {
        setError('Failed to load assessment data. Please refresh.')
      }
    }
    load()
  }, [])

  // Auto-save with debounce
  const saveProgress = useCallback(async (changes: Record<string, LocalProgress>, silent = false) => {
    const updates = Object.entries(changes).map(([checklistItemId, { status, confidenceScore }]) => ({
      checklistItemId,
      status,
      confidenceScore,
    }))

    if (updates.length === 0) {
      if (!silent) showToast('All changes already saved ✓', 'info')
      return
    }

    setIsSaving(true)

    try {
      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      if (!res.ok) throw new Error('Save failed')
      pendingChangesRef.current = {}
      showToast(`${updates.length} change${updates.length !== 1 ? 's' : ''} saved ✓`, 'success')
    } catch {
      showToast('Save failed — please try again', 'error')
    } finally {
      setIsSaving(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleChange(id: string, status: ProgressStatus, confidenceScore: number) {
    const updated = { status, confidenceScore }
    setProgressMap((prev) => ({ ...prev, [id]: updated }))
    pendingChangesRef.current = { ...pendingChangesRef.current, [id]: updated }

    // Debounce auto-save
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      saveProgress(pendingChangesRef.current, true) // silent auto-save
    }, 800)
  }

  async function handleManualSave() {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    await saveProgress(pendingChangesRef.current)
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 mt-3">Loading your assessment...</p>
      </div>
    )
  }

  // Group items by level, then by category
  const levels = [...data.levels].sort((a, b) => a.order - b.order)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Skill Assessment</h1>
          <p className="text-sm text-gray-500 mt-1">
            Rate each skill honestly — your score updates automatically.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            isLoading={isSaving}
            onClick={handleManualSave}
          >
            Save All
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          How to use
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-white border-2 border-gray-300 inline-block" />
            Click circle to cycle status
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-400 border-2 border-amber-400 inline-block" />
            Working On It
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-500 inline-block" />
            Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-gray-300 rounded-full inline-block" />
            Drag slider for confidence %
          </span>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium text-white transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-green-600'
              : toast.type === 'error'
              ? 'bg-red-600'
              : 'bg-gray-700'
          }`}
        >
          <span>
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
          </span>
          {toast.message}
        </div>
      )}

      {/* Levels */}
      {levels.map((level) => {
        const levelItems = data.checklistItems.filter(
          (item) => item.level.order === level.order
        )
        if (levelItems.length === 0) return null

        // Group by category
        const categoryIds = Array.from(new Set(levelItems.map((i) => i.categoryId)))
        const categoriesForLevel = data.categories.filter((c) => categoryIds.includes(c.id))

        return (
          <div key={level.id} className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white text-sm font-bold flex items-center justify-center">
                {level.order}
              </div>
              <div>
                <h2 className="font-bold text-gray-900">{level.name}</h2>
                <p className="text-xs text-gray-500">{level.description}</p>
              </div>
            </div>

            {categoriesForLevel.map((cat) => {
              const catItems = levelItems.filter((i) => i.categoryId === cat.id)
              const localProgressForCat = Object.fromEntries(
                catItems.map((item) => [
                  item.id,
                  progressMap[item.id] ?? { status: 'NOT_STARTED' as ProgressStatus, confidenceScore: 0 },
                ])
              )

              return (
                <CategorySection
                  key={cat.id}
                  category={cat}
                  items={catItems}
                  progressMap={localProgressForCat}
                  onChange={handleChange}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
