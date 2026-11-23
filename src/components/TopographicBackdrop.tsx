import React from 'react';

export const TopographicBackdrop: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 1440 900"
    fill="none"
    preserveAspectRatio="xMidYMid slice"
    className={`pointer-events-none absolute inset-0 w-full h-full opacity-35 ${className}`}
  >
    <defs>
      <linearGradient id="weissachContour" x1="0" y1="0" x2="1440" y2="900" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0070FF" stopOpacity="0.4" />
        <stop offset="50%" stopColor="#00E5FF" stopOpacity="0.22" />
        <stop offset="100%" stopColor="#0070FF" stopOpacity="0.05" />
      </linearGradient>
    </defs>
    <path
      d="M-80 220 C 190 120, 380 340, 680 240 C 980 140, 1180 40, 1520 180"
      stroke="url(#weissachContour)"
      strokeWidth="1"
    />
    <path
      d="M-60 360 C 240 240, 440 460, 760 340 C 1080 220, 1210 170, 1540 310"
      stroke="url(#weissachContour)"
      strokeWidth="1"
    />
    <path
      d="M-120 540 C 210 420, 480 650, 820 510 C 1140 380, 1280 370, 1560 490"
      stroke="url(#weissachContour)"
      strokeWidth="1"
    />
    <path
      d="M-100 720 C 280 610, 560 800, 900 660 C 1190 540, 1340 580, 1560 690"
      stroke="url(#weissachContour)"
      strokeWidth="1"
    />
    <ellipse
      cx="720"
      cy="460"
      rx="520"
      ry="240"
      stroke="rgba(0,112,255,0.12)"
      strokeWidth="1"
      strokeDasharray="6 10"
    />
  </svg>
);
