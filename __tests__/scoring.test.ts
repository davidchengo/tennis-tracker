import {
  calculateItemScore,
  calculateOverallScore,
  determineCurrentLevel,
  generateRecommendations,
} from '../lib/scoring/engine'
import type { ScoringItem, LevelInfo } from '../lib/scoring/types'

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeItem(overrides: Partial<ScoringItem> = {}): ScoringItem {
  return {
    id: 'item-1',
    weight: 1.0,
    isCore: false,
    status: 'NOT_STARTED',
    confidenceScore: 0,
    levelOrder: 1,
    categorySlug: 'footwork',
    title: 'Test Item',
    ...overrides,
  }
}

const mockLevels: LevelInfo[] = [
  { id: 'l1', name: 'Beginner Foundation', order: 1, description: '', minScore: 0, maxScore: 20 },
  { id: 'l2', name: 'Rally Consistency', order: 2, description: '', minScore: 20, maxScore: 40 },
  { id: 'l3', name: 'Controlled Shot Making', order: 3, description: '', minScore: 40, maxScore: 60 },
  { id: 'l4', name: 'Match Readiness', order: 4, description: '', minScore: 60, maxScore: 80 },
  { id: 'l5', name: 'Competitive Confidence', order: 5, description: '', minScore: 80, maxScore: 100 },
]

// ── calculateItemScore ────────────────────────────────────────────────────────

describe('calculateItemScore', () => {
  it('NOT_STARTED returns 0 regardless of confidence', () => {
    expect(calculateItemScore('NOT_STARTED', 0)).toBe(0)
    expect(calculateItemScore('NOT_STARTED', 50)).toBe(0)
    expect(calculateItemScore('NOT_STARTED', 100)).toBe(0)
  })

  it('COMPLETED at confidence 0 returns 70', () => {
    // 1.0 * (0.7 + 0/100 * 0.3) * 100 = 70
    expect(calculateItemScore('COMPLETED', 0)).toBeCloseTo(70, 5)
  })

  it('COMPLETED at confidence 100 returns 100', () => {
    // 1.0 * (0.7 + 100/100 * 0.3) * 100 = 100
    expect(calculateItemScore('COMPLETED', 100)).toBeCloseTo(100, 5)
  })

  it('WORKING_ON_IT at confidence 50 returns 42.5', () => {
    // 0.5 * (0.7 + 50/100 * 0.3) * 100 = 0.5 * 0.85 * 100 = 42.5
    expect(calculateItemScore('WORKING_ON_IT', 50)).toBeCloseTo(42.5, 5)
  })

  it('WORKING_ON_IT at confidence 0 returns 35', () => {
    // 0.5 * (0.7 + 0 * 0.3) * 100 = 35
    expect(calculateItemScore('WORKING_ON_IT', 0)).toBeCloseTo(35, 5)
  })

  it('COMPLETED at confidence 50 returns 85', () => {
    // 1.0 * (0.7 + 0.5 * 0.3) * 100 = 85
    expect(calculateItemScore('COMPLETED', 50)).toBeCloseTo(85, 5)
  })
})

// ── calculateOverallScore ─────────────────────────────────────────────────────

describe('calculateOverallScore', () => {
  it('empty items array returns 0', () => {
    expect(calculateOverallScore([])).toBe(0)
  })

  it('all NOT_STARTED returns 0', () => {
    const items = [makeItem(), makeItem({ id: 'item-2' })]
    expect(calculateOverallScore(items)).toBe(0)
  })

  it('all completed at confidence 100 returns 100', () => {
    const items = [
      makeItem({ status: 'COMPLETED', confidenceScore: 100 }),
      makeItem({ id: 'item-2', status: 'COMPLETED', confidenceScore: 100 }),
    ]
    expect(calculateOverallScore(items)).toBeCloseTo(100, 5)
  })

  it('single completed item confidence 0 returns 70', () => {
    const items = [makeItem({ status: 'COMPLETED', confidenceScore: 0 })]
    expect(calculateOverallScore(items)).toBeCloseTo(70, 5)
  })

  it('weighted items calculate correctly', () => {
    // Item 1: weight=2, COMPLETED confidence 100 → score=100
    // Item 2: weight=1, NOT_STARTED → score=0
    // weighted = (100 * 2 + 0 * 1) / (2 + 1) = 200/3 ≈ 66.67
    const items = [
      makeItem({ id: 'item-1', weight: 2, status: 'COMPLETED', confidenceScore: 100 }),
      makeItem({ id: 'item-2', weight: 1, status: 'NOT_STARTED', confidenceScore: 0 }),
    ]
    expect(calculateOverallScore(items)).toBeCloseTo(66.67, 1)
  })

  it('mixed statuses compute correct weighted average', () => {
    const items = [
      makeItem({ id: 'item-1', weight: 1, status: 'COMPLETED', confidenceScore: 0 }),   // 70
      makeItem({ id: 'item-2', weight: 1, status: 'WORKING_ON_IT', confidenceScore: 50 }), // 42.5
      makeItem({ id: 'item-3', weight: 1, status: 'NOT_STARTED', confidenceScore: 0 }),  // 0
    ]
    // Average of 70, 42.5, 0 = 112.5/3 = 37.5
    expect(calculateOverallScore(items)).toBeCloseTo(37.5, 5)
  })
})

// ── determineCurrentLevel ─────────────────────────────────────────────────────

describe('determineCurrentLevel', () => {
  it('score 0 returns level 1', () => {
    const items = [makeItem()]
    const { level } = determineCurrentLevel(items, mockLevels)
    expect(level.order).toBe(1)
  })

  it('score above 20 without required core items drops to level 1', () => {
    // 4 level-2 items: 2 completed (score=70 each), 2 not-started (score=0)
    // Overall = (70+70+0+0)/4 = 35 → candidate = level 2
    // One NOT_STARTED item is isCore=true → missing core → drops to level 1
    const items = [
      makeItem({ id: 'i1', weight: 1, status: 'COMPLETED', confidenceScore: 0, levelOrder: 2, isCore: false }),
      makeItem({ id: 'i2', weight: 1, status: 'COMPLETED', confidenceScore: 0, levelOrder: 2, isCore: false }),
      makeItem({ id: 'i3', weight: 1, status: 'NOT_STARTED', confidenceScore: 0, levelOrder: 2, isCore: true }),
      makeItem({ id: 'i4', weight: 1, status: 'NOT_STARTED', confidenceScore: 0, levelOrder: 2, isCore: false }),
    ]
    // Overall ≈ 35 → candidate = level 2, but core item i3 not completed → drop to level 1
    const { level, missingCoreItems } = determineCurrentLevel(items, mockLevels)
    expect(missingCoreItems.length).toBeGreaterThan(0)
    expect(level.order).toBeLessThan(2)
  })

  it('score 25 with all core items completed = level 2', () => {
    // 4 level-2 items: 2 COMPLETED core conf=0 (score=70), 2 NOT_STARTED (score=0)
    // Overall = (70+70+0+0)/4 = 35 → candidate = level 2
    // Both core items are COMPLETED → no missing core → stays at level 2
    const items = [
      makeItem({ id: 'i1', weight: 1, status: 'COMPLETED', confidenceScore: 0, levelOrder: 2, isCore: true }),
      makeItem({ id: 'i2', weight: 1, status: 'COMPLETED', confidenceScore: 0, levelOrder: 2, isCore: true }),
      makeItem({ id: 'i3', weight: 1, status: 'NOT_STARTED', confidenceScore: 0, levelOrder: 2, isCore: false }),
      makeItem({ id: 'i4', weight: 1, status: 'NOT_STARTED', confidenceScore: 0, levelOrder: 2, isCore: false }),
    ]
    const { level, missingCoreItems } = determineCurrentLevel(items, mockLevels)
    expect(missingCoreItems).toHaveLength(0)
    expect(level.order).toBe(2)
  })

  it('score below level minScore stays at correct level', () => {
    // All NOT_STARTED → score 0 → level 1
    const items = Array.from({ length: 5 }, (_, i) => makeItem({ id: `item-${i}` }))
    const { level } = determineCurrentLevel(items, mockLevels)
    expect(level.order).toBe(1)
  })
})

// ── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const mockCurrentLevel = mockLevels[0]
  const mockNextLevel = mockLevels[1]
  const mockCategoryMeta = [
    { slug: 'footwork', name: 'Footwork', score: 10, completedItems: 1, totalItems: 5 },
    { slug: 'groundstrokes', name: 'Groundstrokes', score: 80, completedItems: 4, totalItems: 5 },
  ]

  it('surfaces missing core items first', () => {
    const missingCore = [
      makeItem({ id: 'core-1', isCore: true, title: 'Split Step', status: 'NOT_STARTED' }),
    ]
    const recs = generateRecommendations(
      [],
      mockCurrentLevel,
      mockNextLevel,
      missingCore,
      mockCategoryMeta
    )
    expect(recs[0].type).toBe('core_missing')
    expect(recs[0].title).toContain('Split Step')
  })

  it('surfaces lowest-scoring categories', () => {
    const recs = generateRecommendations(
      [],
      mockCurrentLevel,
      mockNextLevel,
      [],
      mockCategoryMeta
    )
    const lowCatRec = recs.find((r) => r.type === 'low_category')
    expect(lowCatRec).toBeDefined()
    expect(lowCatRec?.description).toContain('Footwork')
  })

  it('includes missing core items for next level when no core missing', () => {
    const nextLevelItems = [
      makeItem({ id: 'nl-1', levelOrder: 2, status: 'NOT_STARTED', categorySlug: 'footwork' }),
      makeItem({ id: 'nl-2', levelOrder: 2, status: 'NOT_STARTED', categorySlug: 'groundstrokes' }),
    ]
    const recs = generateRecommendations(
      nextLevelItems,
      mockCurrentLevel,
      mockNextLevel,
      [],
      mockCategoryMeta
    )
    const nextLevelRec = recs.find((r) => r.type === 'next_level_prep')
    expect(nextLevelRec).toBeDefined()
    expect(nextLevelRec?.description).toContain(mockNextLevel.name)
  })

  it('returns at most 5 recommendations', () => {
    const manyMissingCore = Array.from({ length: 10 }, (_, i) =>
      makeItem({ id: `core-${i}`, isCore: true, title: `Core ${i}`, status: 'NOT_STARTED' })
    )
    const recs = generateRecommendations(
      [],
      mockCurrentLevel,
      mockNextLevel,
      manyMissingCore,
      mockCategoryMeta
    )
    expect(recs.length).toBeLessThanOrEqual(5)
  })
})
