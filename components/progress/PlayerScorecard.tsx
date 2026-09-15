interface PlayerScorecardProps {
  overallScore: number
  currentLevel: {
    order: number
    name: string
    description: string
  }
  nextLevel: {
    name: string
  } | null
  percentToNextLevel: number
  missingCoreCount: number
}

export function PlayerScorecard({
  overallScore,
  currentLevel,
  nextLevel,
  percentToNextLevel,
  missingCoreCount,
}: PlayerScorecardProps) {
  const roundedScore = Math.round(overallScore)
  const arc = `conic-gradient(#61ce68 ${roundedScore * 3.6}deg, rgba(255,255,255,0.12) 0deg)`

  return (
    <section className="overflow-hidden rounded-2xl border border-[#303843] bg-[#171c23] shadow-[0_22px_55px_rgba(0,0,0,0.12)]">
      <div className="border-b border-[#2a3039] bg-[radial-gradient(circle_at_80%_0%,rgba(72,164,80,0.18),transparent_36%)] px-5 py-4 sm:px-6">
        <p className="text-xs font-extrabold tracking-[0.12em] text-[#64d26d]">PLAYER SCORECARD</p>
        <h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#f1f3f8]">Your progress, in one place.</h2>
      </div>

      <div className="grid gap-6 p-5 sm:grid-cols-[150px_1fr] sm:items-center sm:p-6">
        <div className="flex justify-center sm:justify-start">
          <div
            className="grid h-[132px] w-[132px] place-items-center rounded-full p-1"
            style={{ background: arc }}
            role="img"
            aria-label={`Overall score: ${roundedScore} out of 100`}
          >
            <div className="grid h-full w-full place-items-center rounded-full bg-[#171c23] text-center">
              <strong className="text-4xl font-black leading-none tracking-[-0.05em] text-[#f4f6fa]">{roundedScore}</strong>
              <span className="mt-1 text-xs font-bold text-[#aeb7c9]">OUT OF 100</span>
            </div>
          </div>
        </div>

        <div>
          <span className="inline-flex rounded-full border border-[#4f9955] bg-[#1d4023] px-2.5 py-1 text-xs font-extrabold text-[#82dc87]">
            Level {currentLevel.order} · {currentLevel.name}
          </span>
          <p className="mt-3 text-sm leading-6 text-[#c5ccd8]">{currentLevel.description}</p>

          {nextLevel ? (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-[#aeb7c9]">
                <span>Progress toward {nextLevel.name}</span>
                <span className="text-[#79d47e]">{percentToNextLevel}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#2b313b]" aria-hidden="true">
                <div className="h-full rounded-full bg-[#61ce68]" style={{ width: `${percentToNextLevel}%` }} />
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm font-bold text-[#82dc87]">You&apos;ve reached the highest level.</p>
          )}

          <p className="mt-4 text-xs leading-5 text-[#aeb7c9]">
            {missingCoreCount > 0
              ? `${missingCoreCount} core skill${missingCoreCount === 1 ? '' : 's'} still needs attention before the next level.`
              : 'Your current level core skills are on track.'}
          </p>
        </div>
      </div>
    </section>
  )
}
