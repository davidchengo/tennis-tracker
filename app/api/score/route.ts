import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { computeLevelResult } from '@/lib/scoring/engine'
import type { ScoringItem } from '@/lib/scoring/types'

// GET /api/score — compute player's current level, score, and recommendations
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
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
      prisma.userChecklistProgress.findMany({
        where: { userId },
      }),
    ])

    const progressMap = Object.fromEntries(
      userProgress.map((p) => [p.checklistItemId, p])
    )

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

    // Save a snapshot
    await prisma.userAssessmentSnapshot.create({
      data: {
        userId,
        overallScore: result.overallScore,
        levelId: result.currentLevel.id,
        snapshot: JSON.parse(JSON.stringify(result)),
      },
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('[score GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
