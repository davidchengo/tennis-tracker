import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { batchProgressUpdateSchema } from '@/lib/validations/schemas'

// GET /api/assessment — return all checklist items + user's current progress
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [levels, categories, checklistItems, userProgress] = await Promise.all([
      prisma.level.findMany({ orderBy: { order: 'asc' } }),
      prisma.skillCategory.findMany(),
      prisma.checklistItem.findMany({
        orderBy: [{ levelId: 'asc' }, { sortOrder: 'asc' }],
        include: {
          level: { select: { order: true, name: true } },
          category: { select: { slug: true, name: true, color: true, icon: true } },
        },
      }),
      prisma.userChecklistProgress.findMany({
        where: { userId: session.user.id },
      }),
    ])

    const progressMap = Object.fromEntries(
      userProgress.map((p) => [p.checklistItemId, p])
    )

    return NextResponse.json({ levels, categories, checklistItems, progressMap })
  } catch (err) {
    console.error('[assessment GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/assessment — batch upsert progress
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = batchProgressUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const { updates } = parsed.data
    const userId = session.user.id

    // Upsert each progress record
    await prisma.$transaction(
      updates.map((update) =>
        prisma.userChecklistProgress.upsert({
          where: {
            userId_checklistItemId: {
              userId,
              checklistItemId: update.checklistItemId,
            },
          },
          update: {
            status: update.status,
            confidenceScore: update.confidenceScore,
          },
          create: {
            userId,
            checklistItemId: update.checklistItemId,
            status: update.status,
            confidenceScore: update.confidenceScore,
          },
        })
      )
    )

    return NextResponse.json({ message: 'Progress saved', count: updates.length })
  } catch (err) {
    console.error('[assessment POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
