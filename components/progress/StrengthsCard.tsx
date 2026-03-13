'use client'

interface StrengthItem {
  id: string
  title: string
  score: number
  categorySlug: string
}

interface StrengthsCardProps {
  strengths: StrengthItem[]
  improvements: StrengthItem[]
}

function ScoreChip({ score, positive }: { score: number; positive: boolean }) {
  return (
    <span
      className={[
        'text-xs font-semibold px-2 py-0.5 rounded-full',
        positive
          ? 'bg-green-100 text-green-700'
          : 'bg-amber-100 text-amber-700',
      ].join(' ')}
    >
      {Math.round(score)}%
    </span>
  )
}

export function StrengthsCard({ strengths, improvements }: StrengthsCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Strengths */}
      <div className="bg-green-50 border border-green-100 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-1.5">
          <span>💪</span> Top Strengths
        </h3>
        {strengths.length === 0 ? (
          <p className="text-xs text-green-600">Keep working — your strengths will show here!</p>
        ) : (
          <ul className="space-y-2">
            {strengths.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-700 truncate">{s.title}</span>
                <ScoreChip score={s.score} positive={true} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Areas to improve */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-1.5">
          <span>🎯</span> Focus Areas
        </h3>
        {improvements.length === 0 ? (
          <p className="text-xs text-amber-600">Great work — no major gaps found!</p>
        ) : (
          <ul className="space-y-2">
            {improvements.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-700 truncate">{s.title}</span>
                <ScoreChip score={s.score} positive={false} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
