import React from 'react';

export default function DefaultAILogo({ size = 40, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="gradientDefault" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <filter id="glowDefault">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="100" cy="90" r="40" stroke="url(#gradientDefault)" strokeWidth="8" fill="none" filter="url(#glowDefault)"/>
      <circle cx="100" cy="90" r="8" fill="url(#gradientDefault)"/>
      <path d="M 130 110 L 155 135" stroke="url(#gradientDefault)" strokeWidth="10" strokeLinecap="round" filter="url(#glowDefault)"/>
      <line x1="100" y1="50" x2="100" y2="20" stroke="#9333ea" strokeWidth="2" opacity="0.4" />
      <circle cx="100" cy="20" r="6" fill="#9333ea" filter="url(#glowDefault)" />
      <line x1="125" y1="60" x2="155" y2="30" stroke="#06b6d4" strokeWidth="2" opacity="0.4" />
      <circle cx="155" cy="30" r="6" fill="#06b6d4" filter="url(#glowDefault)" />
      <line x1="140" y1="90" x2="180" y2="90" stroke="#ec4899" strokeWidth="2" opacity="0.4" />
      <circle cx="180" cy="90" r="6" fill="#ec4899" filter="url(#glowDefault)" />
      <line x1="125" y1="115" x2="145" y2="145" stroke="#9333ea" strokeWidth="2" opacity="0.4" />
      <circle cx="145" cy="145" r="6" fill="#9333ea" filter="url(#glowDefault)" />
      <line x1="60" y1="90" x2="20" y2="90" stroke="#06b6d4" strokeWidth="2" opacity="0.4" />
      <circle cx="20" cy="90" r="6" fill="#06b6d4" filter="url(#glowDefault)" />
      <line x1="75" y1="60" x2="45" y2="30" stroke="#ec4899" strokeWidth="2" opacity="0.4" />
      <circle cx="45" cy="30" r="6" fill="#ec4899" filter="url(#glowDefault)" />
      <line x1="75" y1="115" x2="50" y2="145" stroke="#9333ea" strokeWidth="2" opacity="0.4" />
      <circle cx="50" cy="145" r="6" fill="#9333ea" filter="url(#glowDefault)" />
      <line x1="100" y1="130" x2="100" y2="160" stroke="#06b6d4" strokeWidth="2" opacity="0.4" />
      <circle cx="100" cy="160" r="6" fill="#06b6d4" filter="url(#glowDefault)" />
    </svg>
  );
}