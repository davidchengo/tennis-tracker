'use client'

import type { ChecklistItemWithMeta, ProgressStatus } from '@/types'

interface ChecklistItemCardProps {
  item: ChecklistItemWithMeta
  status: ProgressStatus
  confidenceScore: number
  onChange: (id: string, status: ProgressStatus, confidenceScore: number) => void
}

const STATUS_OPTIONS: { value: ProgressStatus; label: string; color: string; bg: string }[] = [
  { value: 'NOT_STARTED', label: 'Not Started', color: 'text-gray-500', bg: 'bg-gray-100' },
  { value: 'WORKING_ON_IT', label: 'Working On It', color: 'text-amber-700', bg: 'bg-amber-100' },
  { value: 'COMPLETED', label: 'Completed', color: 'text-green-700', bg: 'bg-green-100' },
]

export function ChecklistItemCard({
  item,
  status,
  confidenceScore,
  onChange,
}: ChecklistItemCardProps) {
  const currentStatus = STATUS_OPTIONS.find((s) => s.value === status)!

  function cycleStatus() {
    const currentIndex = STATUS_OPTIONS.findIndex((s) => s.value === status)
    const nextStatus = STATUS_OPTIONS[(currentIndex + 1) % STATUS_OPTIONS.length]
    onChange(item.id, nextStatus.value, confidenceScore)
  }

  return (
    <div
      className={[
        'rounded-xl border p-4 transition-all duration-200',
        status === 'COMPLETED'
          ? 'border-green-200 bg-green-50/50'
          : status === 'WORKING_ON_IT'
          ? 'border-amber-200 bg-amber-50/50'
          : 'border-gray-200 bg-white',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        {/* Status toggle button */}
        <button
          onClick={cycleStatus}
          className={[
            'mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center',
            'transition-colors duration-200 hover:scale-110',
            status === 'COMPLETED'
              ? 'bg-green-500 border-green-500 text-white'
              : status === 'WORKING_ON_IT'
              ? 'bg-amber-400 border-amber-400 text-white'
              : 'bg-white border-gray-300 hover:border-gray-400',
          ].join(' ')}
          aria-label={`Toggle status: currently ${status}`}
          title="Click to cycle status"
        >
          {status === 'COMPLETED' && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {status === 'WORKING_ON_IT' && (
            <div className="w-2 h-2 rounded-full bg-white" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
            {item.isCore && (
              <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">
                Core
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.description}</p>

          {/* Status badge */}
          <div className="mt-2 flex items-center gap-3">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${currentStatus.bg} ${currentStatus.color}`}
            >
              {currentStatus.label}
            </span>

            {/* Confidence slider — only show when not NOT_STARTED */}
            {status !== 'NOT_STARTED' && (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs text-gray-400 whitespace-nowrap">Confidence:</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={confidenceScore}
                  onChange={(e) =>
                    onChange(item.id, status, Number(e.target.value))
                  }
                  className="flex-1 h-1.5 accent-green-600 cursor-pointer"
                  aria-label="Confidence score"
                />
                <span className="text-xs font-semibold text-gray-600 w-8 text-right">
                  {confidenceScore}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
