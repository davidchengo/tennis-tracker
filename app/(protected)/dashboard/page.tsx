import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { computeLevelResult, calculateItemScore } from '@/lib/scoring/engine'
import type { ScoringItem } from '@/lib/scoring/types'
import { ProgressBar } from '@/components/progress/ProgressBar'
import { StrengthsCard } from '@/components/progress/StrengthsCard'
import { PlayerScorecard } from '@/components/progress/PlayerScorecard'
import { Button } from '@/components/ui/Button'

export default async function DashboardPage() {
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

  // Top 3 strengths and improvements by item score
  const itemScores = scoringItems.map((item) => {
    return {
      id: item.id,
      title: item.title,
      categorySlug: item.categorySlug,
      score: calculateItemScore(item.status, item.confidenceScore),
    }
  })

  const strengths = itemScores.filter((i) => i.score > 0).sort((a, b) => b.score - a.score).slice(0, 3)
  const improvements = itemScores
    .filter((i) => i.score < 70)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)

  const greeting = session.user.name ? `Hey, ${session.user.name.split(' ')[0]}!` : 'Hey there!'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{greeting} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s your tennis progress overview.</p>
      </div>

      <PlayerScorecard
        overallScore={result.overallScore}
        currentLevel={result.currentLevel}
        nextLevel={result.nextLevel}
        percentToNextLevel={result.percentToNextLevel}
        missingCoreCount={result.missingCoreItems.length}
      />

      {/* Category Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
          Skills by Category
        </h2>
        <div className="space-y-3">
          {result.categoryBreakdown.map((cat) => (
            <div key={cat.slug}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-700 flex items-center gap-1.5">
                  <span>{cat.icon}</span> {cat.name}
                </span>
                <span className="text-xs text-gray-500">
                  {cat.completedItems}/{cat.totalItems} completed
                </span>
              </div>
              <ProgressBar
                value={cat.score}
                color={cat.color ?? '#16a34a'}
                size="sm"
                showPercentage
              />
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Improvements */}
      <StrengthsCard strengths={strengths} improvements={improvements} />

      {/* Missing Core Skills Warning */}
      {result.missingCoreItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="text-sm font-bold text-amber-800 mb-2">
            ⚠️ Core Skills Required for Advancement
          </h3>
          <p className="text-xs text-amber-700 mb-3">
            Complete these essential skills to unlock the next level:
          </p>
          <ul className="space-y-1">
            {result.missingCoreItems.map((item) => (
              <li key={item.id} className="text-xs text-amber-800 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                {item.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      <div className="flex gap-3">
        <Link href="/assessment" className="flex-1">
          <Button className="w-full" size="lg">
            Update Assessment →
          </Button>
        </Link>
        <Link href="/progress">
          <Button variant="secondary" size="lg">
            View Progress
          </Button>
        </Link>
      </div>
    </div>
  )
}
