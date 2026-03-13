'use client'

import { ChecklistItemCard } from './ChecklistItemCard'
import { ProgressBar } from '@/components/progress/ProgressBar'
import type { ChecklistItemWithMeta, ProgressStatus } from '@/types'

interface CategorySectionProps {
  category: { id: string; name: string; slug: string; icon: string | null; color: string | null }
  items: ChecklistItemWithMeta[]
  progressMap: Record<string, { status: ProgressStatus; confidenceScore: number }>
  onChange: (id: string, status: ProgressStatus, confidenceScore: number) => void
}

export function CategorySection({
  category,
  items,
  progressMap,
  onChange,
}: CategorySectionProps) {
  const completedCount = items.filter(
    (item) => progressMap[item.id]?.status === 'COMPLETED'
  ).length

  const completionPercent = items.length > 0 ? (completedCount / items.length) * 100 : 0

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {category.icon && <span className="text-xl">{category.icon}</span>}
          <h3 className="text-base font-bold text-gray-800">{category.name}</h3>
          <span className="text-sm text-gray-400">
            {completedCount}/{items.length}
          </span>
        </div>
      </div>

      <ProgressBar
        value={completionPercent}
        color={category.color ?? '#16a34a'}
        size="sm"
        className="mb-4"
      />

      <div className="space-y-3">
        {items.map((item) => {
          const progress = progressMap[item.id]
          return (
            <ChecklistItemCard
              key={item.id}
              item={item}
              status={progress?.status ?? 'NOT_STARTED'}
              confidenceScore={progress?.confidenceScore ?? 0}
              onChange={onChange}
            />
          )
        })}
      </div>
    </div>
  )
}
