import { PrismaClient, ProgressStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Levels ──────────────────────────────────────────────────────────────────
  const levels = await Promise.all([
    prisma.level.upsert({
      where: { order: 1 },
      update: {},
      create: {
        name: 'Beginner Foundation',
        order: 1,
        description: 'Learn the basics — grips, stances, and first contact with the ball.',
        minScore: 0,
        maxScore: 20,
      },
    }),
    prisma.level.upsert({
      where: { order: 2 },
      update: {},
      create: {
        name: 'Rally Consistency',
        order: 2,
        description: 'Keep the ball in play reliably and develop court awareness.',
        minScore: 20,
        maxScore: 40,
      },
    }),
    prisma.level.upsert({
      where: { order: 3 },
      update: {},
      create: {
        name: 'Controlled Shot Making',
        order: 3,
        description: 'Direct shots with purpose — depth, direction, and spin.',
        minScore: 40,
        maxScore: 60,
      },
    }),
    prisma.level.upsert({
      where: { order: 4 },
      update: {},
      create: {
        name: 'Match Readiness',
        order: 4,
        description: 'Apply skills under pressure and compete effectively in matches.',
        minScore: 60,
        maxScore: 80,
      },
    }),
    prisma.level.upsert({
      where: { order: 5 },
      update: {},
      create: {
        name: 'Competitive Confidence',
        order: 5,
        description: 'Advanced tactics, adaptability, and consistent tournament play.',
        minScore: 80,
        maxScore: 100,
      },
    }),
  ])

  console.log(`✅ Created ${levels.length} levels`)

  // ── Skill Categories ─────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.skillCategory.upsert({
      where: { slug: 'footwork' },
      update: {},
      create: { name: 'Footwork', slug: 'footwork', icon: '👟', color: '#f59e0b' },
    }),
    prisma.skillCategory.upsert({
      where: { slug: 'groundstrokes' },
      update: {},
      create: { name: 'Groundstrokes', slug: 'groundstrokes', icon: '🎾', color: '#10b981' },
    }),
    prisma.skillCategory.upsert({
      where: { slug: 'serve-return' },
      update: {},
      create: { name: 'Serve & Return', slug: 'serve-return', icon: '🏹', color: '#3b82f6' },
    }),
    prisma.skillCategory.upsert({
      where: { slug: 'net-play' },
      update: {},
      create: { name: 'Net Play', slug: 'net-play', icon: '🥅', color: '#8b5cf6' },
    }),
    prisma.skillCategory.upsert({
      where: { slug: 'mental-game' },
      update: {},
      create: { name: 'Mental Game', slug: 'mental-game', icon: '🧠', color: '#ec4899' },
    }),
  ])

  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]))
  const lvlMap = Object.fromEntries(levels.map((l) => [l.order, l.id]))

  console.log(`✅ Created ${categories.length} skill categories`)

  // ── Checklist Items ──────────────────────────────────────────────────────────
  // Format: { levelOrder, categorySlug, title, description, weight, sortOrder, isCore }
  const items = [
    // ─── LEVEL 1: Beginner Foundation ───────────────────────────────────────
    {
      levelOrder: 1, categorySlug: 'footwork',
      title: 'Ready Position', isCore: true, weight: 1.5, sortOrder: 1,
      description: 'Stand with feet shoulder-width apart, knees slightly bent, weight on balls of feet, racket held in front.',
    },
    {
      levelOrder: 1, categorySlug: 'footwork',
      title: 'Basic Split Step', isCore: false, weight: 1.0, sortOrder: 2,
      description: 'Perform a small hop as the opponent makes contact to prepare for explosive lateral movement.',
    },
    {
      levelOrder: 1, categorySlug: 'groundstrokes',
      title: 'Eastern Forehand Grip', isCore: true, weight: 1.5, sortOrder: 3,
      description: 'Hold the racket with an Eastern grip; base knuckle of index finger on bevel 3.',
    },
    {
      levelOrder: 1, categorySlug: 'groundstrokes',
      title: 'Forehand Mini Rally', isCore: false, weight: 1.0, sortOrder: 4,
      description: 'Sustain a 5-shot cooperative forehand rally with a partner using correct grip and swing path.',
    },
    {
      levelOrder: 1, categorySlug: 'groundstrokes',
      title: 'Two-Handed Backhand Grip', isCore: true, weight: 1.5, sortOrder: 5,
      description: 'Use correct two-handed or single-handed backhand grip consistently.',
    },
    {
      levelOrder: 1, categorySlug: 'groundstrokes',
      title: 'Backhand Mini Rally', isCore: false, weight: 1.0, sortOrder: 6,
      description: 'Sustain a 5-shot cooperative backhand rally with a partner.',
    },
    {
      levelOrder: 1, categorySlug: 'serve-return',
      title: 'Ball Toss Consistency', isCore: false, weight: 1.0, sortOrder: 7,
      description: 'Toss the ball to a repeatable contact point, slightly in front and to the side.',
    },
    {
      levelOrder: 1, categorySlug: 'serve-return',
      title: 'Flat Serve In (Half Court)', isCore: false, weight: 1.0, sortOrder: 8,
      description: 'Get a flat serve into the service box from the deuce side 3 out of 5 attempts.',
    },
    {
      levelOrder: 1, categorySlug: 'mental-game',
      title: 'Positive Reset', isCore: false, weight: 1.0, sortOrder: 9,
      description: 'Demonstrate a brief, positive reset routine after every point (e.g., turn racket, take a breath).',
    },
    {
      levelOrder: 1, categorySlug: 'net-play',
      title: 'Continental Grip for Volleys', isCore: false, weight: 1.0, sortOrder: 10,
      description: 'Hold the racket with a Continental grip and make clean contact on a hand-fed volley.',
    },

    // ─── LEVEL 2: Rally Consistency ──────────────────────────────────────────
    {
      levelOrder: 2, categorySlug: 'footwork',
      title: 'Shuffle Step Recovery', isCore: true, weight: 1.5, sortOrder: 1,
      description: 'After each groundstroke, shuffle back toward the center baseline position.',
    },
    {
      levelOrder: 2, categorySlug: 'footwork',
      title: 'Crossover Step for Wide Balls', isCore: false, weight: 1.0, sortOrder: 2,
      description: 'Use a crossover step to reach wide balls quickly without losing balance.',
    },
    {
      levelOrder: 2, categorySlug: 'groundstrokes',
      title: '10-Shot Forehand Rally', isCore: true, weight: 1.5, sortOrder: 3,
      description: 'Complete a 10-shot crosscourt forehand rally with a partner, keeping balls within 3 feet of baseline.',
    },
    {
      levelOrder: 2, categorySlug: 'groundstrokes',
      title: '10-Shot Backhand Rally', isCore: true, weight: 1.5, sortOrder: 4,
      description: 'Complete a 10-shot crosscourt backhand rally with a partner.',
    },
    {
      levelOrder: 2, categorySlug: 'groundstrokes',
      title: 'Topspin on Forehand', isCore: false, weight: 1.0, sortOrder: 5,
      description: 'Apply visible topspin on the forehand with a low-to-high swing path.',
    },
    {
      levelOrder: 2, categorySlug: 'serve-return',
      title: 'Serve In Consistently (5/10)', isCore: true, weight: 1.5, sortOrder: 6,
      description: 'Land 5 out of 10 first serves in the correct service box.',
    },
    {
      levelOrder: 2, categorySlug: 'serve-return',
      title: 'Return of Serve — Forehand Side', isCore: false, weight: 1.0, sortOrder: 7,
      description: 'Return a medium-paced serve to the forehand side in play 4 out of 6 attempts.',
    },
    {
      levelOrder: 2, categorySlug: 'net-play',
      title: 'Forehand Volley', isCore: false, weight: 1.0, sortOrder: 8,
      description: 'Punch a forehand volley with Continental grip, no backswing, controlling direction.',
    },
    {
      levelOrder: 2, categorySlug: 'net-play',
      title: 'Backhand Volley', isCore: false, weight: 1.0, sortOrder: 9,
      description: 'Execute a clean backhand volley, keeping the wrist firm and contact in front.',
    },
    {
      levelOrder: 2, categorySlug: 'mental-game',
      title: 'Focus Cue Word', isCore: false, weight: 1.0, sortOrder: 10,
      description: 'Identify and use a personal focus cue word (e.g., "bounce-hit") during rallies.',
    },

    // ─── LEVEL 3: Controlled Shot Making ─────────────────────────────────────
    {
      levelOrder: 3, categorySlug: 'footwork',
      title: 'Open Stance Forehand', isCore: false, weight: 1.0, sortOrder: 1,
      description: 'Use an open stance on the forehand to recover faster on wide balls.',
    },
    {
      levelOrder: 3, categorySlug: 'footwork',
      title: 'Approach Step Timing', isCore: true, weight: 1.5, sortOrder: 2,
      description: 'Execute an inside-out approach step to move through short balls and attack the net.',
    },
    {
      levelOrder: 3, categorySlug: 'groundstrokes',
      title: 'Crosscourt vs Down-the-Line Control', isCore: true, weight: 1.5, sortOrder: 3,
      description: 'Direct the ball crosscourt or down-the-line intentionally on 4 out of 6 attempts.',
    },
    {
      levelOrder: 3, categorySlug: 'groundstrokes',
      title: 'Deep Ball Placement', isCore: true, weight: 1.5, sortOrder: 4,
      description: 'Land 6 of 10 groundstrokes within 3 feet of the baseline (depth zone).',
    },
    {
      levelOrder: 3, categorySlug: 'groundstrokes',
      title: 'Slice Backhand', isCore: false, weight: 1.0, sortOrder: 5,
      description: 'Execute a controlled slice backhand that stays low and skids off the court.',
    },
    {
      levelOrder: 3, categorySlug: 'serve-return',
      title: 'Kick/Topspin Serve', isCore: false, weight: 1.0, sortOrder: 6,
      description: 'Hit a topspin (kick) second serve that bounces above shoulder height.',
    },
    {
      levelOrder: 3, categorySlug: 'serve-return',
      title: 'Serve + 1 Pattern', isCore: false, weight: 1.0, sortOrder: 7,
      description: 'Plan and execute a serve followed by an intentional groundstroke to a specific target.',
    },
    {
      levelOrder: 3, categorySlug: 'net-play',
      title: 'Approach Shot to Volley Combo', isCore: false, weight: 1.0, sortOrder: 8,
      description: 'Hit an approach shot and finish at the net with a winning volley.',
    },
    {
      levelOrder: 3, categorySlug: 'net-play',
      title: 'Overhead Smash', isCore: false, weight: 1.0, sortOrder: 9,
      description: 'Execute a controlled overhead from mid-court on a lob.',
    },
    {
      levelOrder: 3, categorySlug: 'mental-game',
      title: 'Point-by-Point Focus', isCore: false, weight: 1.0, sortOrder: 10,
      description: 'Stay focused on the current point; demonstrate ability to reset after errors.',
    },
    {
      levelOrder: 3, categorySlug: 'mental-game',
      title: 'Between-Point Routine', isCore: true, weight: 1.5, sortOrder: 11,
      description: 'Consistently use a structured between-point routine (walk, bounces, breath, look up).',
    },

    // ─── LEVEL 4: Match Readiness ─────────────────────────────────────────────
    {
      levelOrder: 4, categorySlug: 'footwork',
      title: 'Consistent Recovery Position', isCore: true, weight: 1.5, sortOrder: 1,
      description: 'Reliably recover to the correct position after every shot during a match.',
    },
    {
      levelOrder: 4, categorySlug: 'footwork',
      title: 'Movement Under Pressure', isCore: false, weight: 1.0, sortOrder: 2,
      description: 'Maintain good footwork patterns even when stretched wide or pulled into the court.',
    },
    {
      levelOrder: 4, categorySlug: 'groundstrokes',
      title: 'Offense/Defense Transitions', isCore: true, weight: 1.5, sortOrder: 3,
      description: 'Recognize when to play offensive, neutral, or defensive shots based on ball position.',
    },
    {
      levelOrder: 4, categorySlug: 'groundstrokes',
      title: 'Inside-Out Forehand', isCore: false, weight: 1.0, sortOrder: 4,
      description: "Hit an inside-out forehand to attack the opponent's backhand from the center.",
    },
    {
      levelOrder: 4, categorySlug: 'serve-return',
      title: 'First Serve Percentage in Matches', isCore: true, weight: 1.5, sortOrder: 5,
      description: 'Maintain 50%+ first serve percentage during a practice match set.',
    },
    {
      levelOrder: 4, categorySlug: 'serve-return',
      title: 'Return Positioning and Depth', isCore: false, weight: 1.0, sortOrder: 6,
      description: 'Position correctly for returns and target deep crosscourt or at the feet of server.',
    },
    {
      levelOrder: 4, categorySlug: 'net-play',
      title: 'Aggressive Net Approach', isCore: false, weight: 1.0, sortOrder: 7,
      description: 'Read short balls and approach the net aggressively to end points.',
    },
    {
      levelOrder: 4, categorySlug: 'net-play',
      title: 'Drop Volley', isCore: false, weight: 1.0, sortOrder: 8,
      description: 'Absorb pace on a drop volley to create an unreachable short ball.',
    },
    {
      levelOrder: 4, categorySlug: 'mental-game',
      title: 'Game Plan Execution', isCore: true, weight: 1.5, sortOrder: 9,
      description: 'Enter a match with a 2–3 point tactical plan and stick to it for at least 1 set.',
    },
    {
      levelOrder: 4, categorySlug: 'mental-game',
      title: 'Handle Adversity', isCore: false, weight: 1.0, sortOrder: 10,
      description: 'Demonstrate composure when losing or facing bad calls; avoid visible emotional outbursts.',
    },

    // ─── LEVEL 5: Competitive Confidence ─────────────────────────────────────
    {
      levelOrder: 5, categorySlug: 'footwork',
      title: 'Explosive First Step', isCore: false, weight: 1.0, sortOrder: 1,
      description: 'React with explosive first step on split step, consistently reaching wide balls.',
    },
    {
      levelOrder: 5, categorySlug: 'footwork',
      title: 'Full Court Coverage', isCore: true, weight: 1.5, sortOrder: 2,
      description: 'Cover the full court effectively in extended points, maintaining balance and recovery.',
    },
    {
      levelOrder: 5, categorySlug: 'groundstrokes',
      title: 'Weapon Development', isCore: true, weight: 1.5, sortOrder: 3,
      description: 'Identify and consistently deploy a signature weapon shot (e.g., inside-out forehand, heavy topspin backhand).',
    },
    {
      levelOrder: 5, categorySlug: 'groundstrokes',
      title: 'High Ball Defense', isCore: false, weight: 1.0, sortOrder: 4,
      description: 'Handle high-bouncing balls with topspin moonballs or on-the-rise groundstrokes.',
    },
    {
      levelOrder: 5, categorySlug: 'serve-return',
      title: 'Serve to Specific Zones', isCore: true, weight: 1.5, sortOrder: 5,
      description: 'Consistently hit T, body, or wide serves on demand in practice and match play.',
    },
    {
      levelOrder: 5, categorySlug: 'serve-return',
      title: 'Return Winner or Setup', isCore: false, weight: 1.0, sortOrder: 6,
      description: 'Neutralize or attack second serves, generating winners or forcing short replies.',
    },
    {
      levelOrder: 5, categorySlug: 'net-play',
      title: 'Net Domination', isCore: false, weight: 1.0, sortOrder: 7,
      description: 'Win 60%+ of points when approaching the net in practice sets.',
    },
    {
      levelOrder: 5, categorySlug: 'net-play',
      title: 'Lob and Passing Shot Recognition', isCore: false, weight: 1.0, sortOrder: 8,
      description: 'Read opponent positioning to choose between a lob and a passing shot.',
    },
    {
      levelOrder: 5, categorySlug: 'mental-game',
      title: 'Adaptability Mid-Match', isCore: true, weight: 1.5, sortOrder: 9,
      description: 'Recognize when initial game plan isn\'t working and adjust tactics during the match.',
    },
    {
      levelOrder: 5, categorySlug: 'mental-game',
      title: 'Compete in Big Points', isCore: false, weight: 1.0, sortOrder: 10,
      description: 'Raise performance level on break points, tiebreaks, and match points.',
    },
  ]

  let created = 0
  for (const item of items) {
    await prisma.checklistItem.upsert({
      where: {
        // Use a composite unique we'll define as a pseudo-key (title + levelId)
        id: `seed-${item.levelOrder}-${item.categorySlug}-${item.sortOrder}`,
      },
      update: {},
      create: {
        id: `seed-${item.levelOrder}-${item.categorySlug}-${item.sortOrder}`,
        levelId: lvlMap[item.levelOrder],
        categoryId: catMap[item.categorySlug],
        title: item.title,
        description: item.description,
        weight: item.weight,
        sortOrder: item.sortOrder,
        isCore: item.isCore,
      },
    })
    created++
  }

  console.log(`✅ Created ${created} checklist items`)
  console.log('🎾 Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
