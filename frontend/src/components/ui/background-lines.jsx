import React from 'react'

// Lightweight Background Lines effect inspired by Aceternity UI
// Renders subtle animated lines behind children. Keeps parent background intact.
const BackgroundLines = ({ className = '', children }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <svg
          className="absolute inset-0 h-full w-full opacity-30"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="glow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.0" />
              <stop offset="50%" stopColor="#93c5fd" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {Array.from({ length: 12 }).map((_, i) => {
            const y = (i + 1) * 8;
            return (
              <g key={i}>
                <rect x="-10%" y={`${y}%`} width="120%" height="1" fill="url(#glow)">
                  <animate attributeName="x" from="-10%" to="-10%" dur="6s" repeatCount="indefinite" />
                </rect>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export { BackgroundLines }


