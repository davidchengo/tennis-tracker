import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { computeLevelResult } from '@/lib/scoring/engine'
import type { ScoringItem } from '@/lib/scoring/types'
import { ProgressBar } from '@/components/progress/ProgressBar'
import { CircularProgress } from '@/components/progress/CircularProgress'
import { LevelJourneyTracker } from '@/components/progress/LevelJourneyTracker'
import Link from 'next/link'

export default async function ProgressPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id

  const [levels, categories, checklistItems, userProgress] = await Promise.all([
    prisma.level.findMany({ orderBy: { order: 'asc' } }),
    prisma.skillCategory.findMany(),
    prisma.checklistItem.findMany({
      include: {
        level: { select: { order: true } },
        category: { select: { slug: true } },
      },
    }),
    prisma.userChecklistProgress.findMany({ where: { userId } }),
  ])

  const progressMap = Object.fromEntries(userProgress.map((p) => [p.checklistItemId, p]))

  const scoringItems: ScoringItem[] = checklistItems.map((item) => {
    const progress = progressMap[item.id]
    return {
      id: item.id,
      weight: item.weight,
      isCore: item.isCore,
      status: progress?.status ?? 'NOT_STARTED',
      confidenceScore: progress?.confidenceScore ?? 0,
      levelOrder: item.level.order,
      categorySlug: item.category.slug,
      title: item.title,
    }
  })

  const categoryMeta = categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    color: c.color ?? undefined,
    icon: c.icon ?? undefined,
  }))

  const levelInfos = levels.map((l) => ({
    id: l.id,
    name: l.name,
    order: l.order,
    description: l.description,
    minScore: l.minScore,
    maxScore: l.maxScore,
  }))

  const result = computeLevelResult(scoringItems, levelInfos, categoryMeta)

  const nextLevelCoreItems = result.nextLevel
    ? scoringItems.filter(
        (i) => i.levelOrder === result.nextLevel!.order && i.isCore && i.status !== 'COMPLETED'
      )
    : []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>
        <p className="text-sm text-gray-500 mt-1">A detailed view of your tennis journey.</p>
      </div>

      {/* Level Journey */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-6">
          Level Journey
        </h2>
        <LevelJourneyTracker
          levels={levelInfos}
          currentLevel={result.currentLevel}
          overallScore={result.overallScore}
        />
      </div>

      {/* Overall + Category Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Circular overall */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col items-center justify-center gap-4">
          <CircularProgress
            value={result.percentToNextLevel}
            size={140}
            label={result.currentLevel.name}
            sublabel="Progress"
          />
          <div className="text-center">
            <p className="text-sm font-bold text-gray-700">
              Overall Score: {result.overallScore}
            </p>
            {result.nextLevel ? (
              <p className="text-xs text-gray-500 mt-1">
                {result.percentToNextLevel}% toward{' '}
                <span className="font-medium">{result.nextLevel.name}</span>
              </p>
            ) : (
              <p className="text-xs text-green-600 font-medium mt-1">Maximum level reached! 🏆</p>
            )}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
            By Category
          </h3>
          <div className="space-y-4">
            {result.categoryBreakdown.map((cat) => (
              <div key={cat.slug}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-1.5 font-medium text-gray-700">
                    <span>{cat.icon}</span> {cat.name}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {cat.completedItems}/{cat.totalItems}
                  </span>
                </div>
                <ProgressBar
                  value={cat.score}
                  color={cat.color ?? '#16a34a'}
                  showPercentage
                  size="md"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Level Readiness */}
      {result.nextLevel && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
            Next Level Readiness — {result.nextLevel.name}
          </h2>

          {nextLevelCoreItems.length > 0 ? (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Complete these <strong>core skills</strong> to unlock{' '}
                <em>{result.nextLevel.name}</em>:
              </p>
              <ul className="space-y-2">
                {nextLevelCoreItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 text-sm bg-amber-50 border border-amber-100 rounded-lg px-3 py-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                    <span className="text-gray-700">{item.title}</span>
                    <span className="ml-auto text-xs text-amber-600 font-medium">Core</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-green-700 font-medium">
              ✅ All core skills for this level are on track! Keep building your score.
            </p>
          )}
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
            Personalized Recommendations
          </h2>
          <div className="space-y-3">
            {result.recommendations.map((rec, i) => {
              const icons: Record<string, string> = {
                core_missing: '🔑',
                low_category: '📈',
                confidence_boost: '💪',
                next_level_prep: '🚀',
              }
              return (
                <div
                  key={i}
                  className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <span className="text-xl flex-shrink-0">{icons[rec.type] ?? '💡'}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{rec.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{rec.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="text-center">
        <Link
          href="/assessment"
          className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700"
        >
          Update your assessment →
        </Link>
      </div>
    </div>
  )
}
