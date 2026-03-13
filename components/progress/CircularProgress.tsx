'use client'

interface CircularProgressProps {
  value: number       // 0–100
  size?: number       // px
  strokeWidth?: number
  label?: string
  sublabel?: string
  color?: string
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  color = '#16a34a',
}: CircularProgressProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (clamped / 100) * circumference

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-bold text-gray-900" style={{ fontSize: size * 0.22 }}>
          {Math.round(clamped)}%
        </span>
        {label && (
          <span
            className="font-medium text-gray-600 leading-tight"
            style={{ fontSize: size * 0.1 }}
          >
            {label}
          </span>
        )}
        {sublabel && (
          <span
            className="text-gray-400 leading-tight"
            style={{ fontSize: size * 0.09 }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  )
}
