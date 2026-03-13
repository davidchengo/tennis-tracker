export type ProgressStatus = 'NOT_STARTED' | 'WORKING_ON_IT' | 'COMPLETED'

export interface ScoringItem {
  id: string
  weight: number
  isCore: boolean
  status: ProgressStatus
  confidenceScore: number
  levelOrder: number
  categorySlug: string
  title: string
}

export interface LevelInfo {
  id: string
  name: string
  order: number
  description: string
  minScore: number
  maxScore: number
}

export interface LevelResult {
  currentLevel: LevelInfo
  nextLevel: LevelInfo | null
  overallScore: number
  percentToNextLevel: number
  missingCoreItems: ScoringItem[]
  recommendations: Recommendation[]
  categoryBreakdown: CategoryBreakdown[]
}

export interface CategoryBreakdown {
  slug: string
  name: string
  score: number
  completedItems: number
  totalItems: number
  color?: string
  icon?: string
}

export interface Recommendation {
  type: 'core_missing' | 'low_category' | 'confidence_boost' | 'next_level_prep'
  priority: number
  title: string
  description: string
  itemId?: string
}
