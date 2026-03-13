import type { Session } from 'next-auth'

// Extend NextAuth session to include user.id
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
    }
  }
}

export type ProgressStatus = 'NOT_STARTED' | 'WORKING_ON_IT' | 'COMPLETED'

export interface ChecklistItemWithMeta {
  id: string
  levelId: string
  categoryId: string
  title: string
  description: string
  weight: number
  sortOrder: number
  isCore: boolean
  level: { order: number; name: string }
  category: { slug: string; name: string; color: string | null; icon: string | null }
}

export interface UserProgressRecord {
  id: string
  userId: string
  checklistItemId: string
  status: ProgressStatus
  confidenceScore: number
  updatedAt: string
}

export interface AssessmentData {
  levels: Array<{
    id: string
    name: string
    order: number
    description: string
    minScore: number
    maxScore: number
  }>
  categories: Array<{
    id: string
    name: string
    slug: string
    icon: string | null
    color: string | null
  }>
  checklistItems: ChecklistItemWithMeta[]
  progressMap: Record<string, UserProgressRecord>
}

export { Session }
