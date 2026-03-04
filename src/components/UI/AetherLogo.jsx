import React from 'react';

/**
 * AetherLogo - Modern rocket/space shuttle logo representing AI taking flight
 * Inspired by space exploration and futuristic technology
 */
function AetherLogo({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Gradient for rocket body */}
        <linearGradient id="rocket-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>

        {/* Gradient for flame */}
        <linearGradient id="flame-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>

        {/* Glow effect */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx="20" cy="20" r="18" fill="url(#rocket-gradient)" opacity="0.1" />

      {/* Rocket body */}
      <path
        d="M 20 8 L 24 16 L 23 28 L 17 28 L 16 16 Z"
        fill="url(#rocket-gradient)"
        filter="url(#glow)"
      />

      {/* Rocket nose cone */}
      <path
        d="M 20 8 L 24 16 L 20 14 L 16 16 Z"
        fill="url(#rocket-gradient)"
        opacity="0.8"
      />

      {/* Window/porthole */}
      <circle cx="20" cy="18" r="2" fill="white" opacity="0.9" />
      <circle cx="20" cy="18" r="1.2" fill="#6366f1" opacity="0.6" />

      {/* Wings */}
      <path d="M 16 20 L 12 24 L 14 26 L 16 24 Z" fill="url(#rocket-gradient)" opacity="0.9" />
      <path d="M 24 20 L 28 24 L 26 26 L 24 24 Z" fill="url(#rocket-gradient)" opacity="0.9" />

      {/* Flame/exhaust - dynamic and energetic */}
      <path
        d="M 17 28 Q 18 32 20 34 Q 22 32 23 28 Z"
        fill="url(#flame-gradient)"
        opacity="0.9"
      >
        <animate
          attributeName="opacity"
          values="0.7;1;0.7"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>

      {/* Smaller flame particles */}
      <circle cx="18" cy="31" r="1" fill="#f97316" opacity="0.8">
        <animate
          attributeName="cy"
          values="31;34;31"
          dur="1s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.8;0.3;0.8"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="22" cy="31" r="1" fill="#ea580c" opacity="0.8">
        <animate
          attributeName="cy"
          values="31;34;31"
          dur="1.2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.8;0.3;0.8"
          dur="1.2s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Sparkles/stars around rocket */}
      <circle cx="12" cy="12" r="0.5" fill="white" opacity="0.8">
        <animate
          attributeName="opacity"
          values="0.3;1;0.3"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="28" cy="14" r="0.5" fill="white" opacity="0.8">
        <animate
          attributeName="opacity"
          values="0.3;1;0.3"
          dur="2.5s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="26" cy="10" r="0.5" fill="white" opacity="0.8">
        <animate
          attributeName="opacity"
          values="0.3;1;0.3"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}

export default AetherLogo;
