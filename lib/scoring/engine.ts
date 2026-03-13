import type {
  ScoringItem,
  LevelInfo,
  LevelResult,
  CategoryBreakdown,
  Recommendation,
} from './types'

// ── Status base scores ───────────────────────────────────────────────────────
const STATUS_BASE: Record<string, number> = {
  NOT_STARTED: 0,
  WORKING_ON_IT: 0.5,
  COMPLETED: 1.0,
}

/**
 * Calculate the adjusted score for a single checklist item.
 * Formula: baseScore * (0.7 + confidenceScore/100 * 0.3)
 *
 * Examples:
 *  - NOT_STARTED (any confidence) → 0
 *  - COMPLETED, confidence 0      → 1.0 * 0.7 = 0.70 → normalized to 70
 *  - COMPLETED, confidence 100    → 1.0 * 1.0 = 1.00 → normalized to 100
 *  - WORKING_ON_IT, confidence 50 → 0.5 * 0.85 = 0.425 → normalized to 42.5
 */
export function calculateItemScore(
  status: string,
  confidenceScore: number
): number {
  const baseScore = STATUS_BASE[status] ?? 0
  if (baseScore === 0) return 0
  const adjusted = baseScore * (0.7 + (confidenceScore / 100) * 0.3)
  return adjusted * 100
}

/**
 * Calculate the weighted overall score (0–100) from a list of items.
 */
export function calculateOverallScore(items: ScoringItem[]): number {
  if (items.length === 0) return 0

  let weightedSum = 0
  let totalWeight = 0

  for (const item of items) {
    const score = calculateItemScore(item.status, item.confidenceScore) / 100
    weightedSum += score * item.weight
    totalWeight += item.weight
  }

  if (totalWeight === 0) return 0
  return (weightedSum / totalWeight) * 100
}

/**
 * Determine the player's current level given their score and which items
 * are completed.
 *
 * Algorithm:
 * 1. Find the highest level where overallScore >= level.minScore
 * 2. Check that ALL isCore items for that level are COMPLETED
 * 3. If any core items are missing → drop to the previous level
 */
export function determineCurrentLevel(
  items: ScoringItem[],
  levels: LevelInfo[]
): { level: LevelInfo; missingCoreItems: ScoringItem[] } {
  const overallScore = calculateOverallScore(items)
  const sortedLevels = [...levels].sort((a, b) => a.order - b.order)

  // Find highest level whose minScore is met
  let candidateLevel = sortedLevels[0]
  for (const level of sortedLevels) {
    if (overallScore >= level.minScore) {
      candidateLevel = level
    }
  }

  // Check core items for the candidate level
  const coreItemsForLevel = items.filter(
    (item) => item.levelOrder === candidateLevel.order && item.isCore
  )
  const missingCoreItems = coreItemsForLevel.filter(
    (item) => item.status !== 'COMPLETED'
  )

  // If core items are missing, drop to previous level
  if (missingCoreItems.length > 0 && candidateLevel.order > 1) {
    const previousLevel = sortedLevels.find(
      (l) => l.order === candidateLevel.order - 1
    )!
    return { level: previousLevel, missingCoreItems }
  }

  return { level: candidateLevel, missingCoreItems }
}

/**
 * Compute per-category breakdown scores.
 */
export function calculateCategoryBreakdown(
  items: ScoringItem[],
  categoryMeta: Array<{ slug: string; name: string; color?: string; icon?: string }>
): CategoryBreakdown[] {
  const result: CategoryBreakdown[] = []

  for (const cat of categoryMeta) {
    const catItems = items.filter((i) => i.categorySlug === cat.slug)
    const score = catItems.length > 0 ? calculateOverallScore(catItems) : 0
    const completedItems = catItems.filter((i) => i.status === 'COMPLETED').length

    result.push({
      slug: cat.slug,
      name: cat.name,
      score: Math.round(score * 10) / 10,
      completedItems,
      totalItems: catItems.length,
      color: cat.color,
      icon: cat.icon,
    })
  }

  return result
}

/**
 * Generate personalized recommendations for the player.
 */
export function generateRecommendations(
  items: ScoringItem[],
  currentLevel: LevelInfo,
  nextLevel: LevelInfo | null,
  missingCoreItems: ScoringItem[],
  categoryBreakdown: CategoryBreakdown[]
): Recommendation[] {
  const recommendations: Recommendation[] = []

  // 1. Flag missing core items (highest priority)
  for (const item of missingCoreItems) {
    recommendations.push({
      type: 'core_missing',
      priority: 1,
      title: `Complete core skill: ${item.title}`,
      description: `This is a required skill to advance to the next level. Focus on "${item.title}" to unlock ${nextLevel?.name ?? 'the next level'}.`,
      itemId: item.id,
    })
  }

  // 2. Low-scoring categories
  const sortedByScore = [...categoryBreakdown].sort((a, b) => a.score - b.score)
  const weakCategories = sortedByScore.slice(0, 2).filter((c) => c.score < 50)
  for (const cat of weakCategories) {
    recommendations.push({
      type: 'low_category',
      priority: 2,
      title: `Improve your ${cat.name}`,
      description: `Your ${cat.name} score is ${Math.round(cat.score)}%. Dedicate extra practice time to these skills to improve your overall rating.`,
    })
  }

  // 3. Items in progress with low confidence
  const lowConfidence = items
    .filter((i) => i.status === 'WORKING_ON_IT' && i.confidenceScore < 40)
    .slice(0, 2)
  for (const item of lowConfidence) {
    recommendations.push({
      type: 'confidence_boost',
      priority: 3,
      title: `Build confidence in: ${item.title}`,
      description: `You're working on "${item.title}" but your confidence is still low. Try drilling this skill in isolation before applying it in rallies.`,
      itemId: item.id,
    })
  }

  // 4. Next level preparation
  if (nextLevel) {
    const nextLevelItems = items.filter(
      (i) => i.levelOrder === nextLevel.order && i.status === 'NOT_STARTED'
    )
    if (nextLevelItems.length > 0) {
      recommendations.push({
        type: 'next_level_prep',
        priority: 4,
        title: `Preview ${nextLevel.name} skills`,
        description: `Start working on ${nextLevelItems.length} new skill${nextLevelItems.length > 1 ? 's' : ''} from the "${nextLevel.name}" level to accelerate your growth.`,
      })
    }
  }

  // Sort by priority and return top 5
  return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 5)
}

/**
 * Main entry point: compute the full level result for a player.
 */
export function computeLevelResult(
  items: ScoringItem[],
  levels: LevelInfo[],
  categoryMeta: Array<{ slug: string; name: string; color?: string; icon?: string }>
): LevelResult {
  const overallScore = calculateOverallScore(items)
  const sortedLevels = [...levels].sort((a, b) => a.order - b.order)

  const { level: currentLevel, missingCoreItems } = determineCurrentLevel(items, levels)
  const nextLevel =
    sortedLevels.find((l) => l.order === currentLevel.order + 1) ?? null

  const percentToNextLevel = nextLevel
    ? Math.min(
        100,
        Math.max(
          0,
          ((overallScore - currentLevel.minScore) /
            (nextLevel.minScore - currentLevel.minScore)) *
            100
        )
      )
    : 100

  const categoryBreakdown = calculateCategoryBreakdown(items, categoryMeta)

  const recommendations = generateRecommendations(
    items,
    currentLevel,
    nextLevel,
    missingCoreItems,
    categoryBreakdown
  )

  return {
    currentLevel,
    nextLevel,
    overallScore: Math.round(overallScore * 10) / 10,
    percentToNextLevel: Math.round(percentToNextLevel),
    missingCoreItems,
    recommendations,
    categoryBreakdown,
  }
}
