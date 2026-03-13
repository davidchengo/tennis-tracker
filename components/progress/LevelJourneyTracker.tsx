'use client'

interface LevelInfo {
  id: string
  name: string
  order: number
  description: string
  minScore: number
  maxScore: number
}

interface LevelJourneyTrackerProps {
  levels: LevelInfo[]
  currentLevel: LevelInfo
  overallScore: number
}

export function LevelJourneyTracker({
  levels,
  currentLevel,
  overallScore,
}: LevelJourneyTrackerProps) {
  const sorted = [...levels].sort((a, b) => a.order - b.order)

  return (
    <div className="w-full">
      {/* Progress bar underneath */}
      <div className="relative mb-6">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 rounded-full" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(100, (overallScore / 100) * 100)}%`,
          }}
        />

        <div className="relative flex justify-between">
          {sorted.map((level) => {
            const isPast = level.order < currentLevel.order
            const isCurrent = level.order === currentLevel.order
            const isFuture = level.order > currentLevel.order

            return (
              <div
                key={level.id}
                className="flex flex-col items-center gap-2"
                style={{ flex: '1 0 0' }}
              >
                {/* Circle node */}
                <div
                  className={[
                    'w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold z-10',
                    isCurrent
                      ? 'bg-green-600 border-green-600 text-white ring-4 ring-green-100'
                      : isPast
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white border-gray-300 text-gray-400',
                  ].join(' ')}
                >
                  {isPast ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    level.order
                  )}
                </div>

                {/* Label */}
                <span
                  className={[
                    'text-xs font-medium text-center leading-tight max-w-[80px]',
                    isCurrent ? 'text-green-700' : isFuture ? 'text-gray-400' : 'text-gray-600',
                  ].join(' ')}
                >
                  {level.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
