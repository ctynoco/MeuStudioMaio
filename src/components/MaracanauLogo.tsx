import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'simple' | 'compact';
  animated?: boolean;
}

export default function MaracanauLogo({ className = '', variant = 'full', animated = false }: LogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      {/* Visual icon portion */}
      <div className={`relative flex items-center justify-center transition-all ${animated ? 'animate-pulse' : ''}`} style={{ width: '100px', height: '80px' }}>
        {/* Exterior Arch (Green Headphones styled frame) */}
        <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-md">
          {/* Main green curved bridge top arch */}
          <path
            d="M 15 50 A 35 35 0 0 1 85 50"
            fill="none"
            stroke="#10b981"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Outer accents / pads */}
          <rect x="8" y="42" width="10" height="24" rx="4" fill="#059669" />
          <rect x="82" y="42" width="10" height="24" rx="4" fill="#059669" />
          
          {/* Teal inner arc helper */}
          <path
            d="M 23 50 A 27 27 0 0 1 77 50"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Inner TV screen background block */}
          <rect x="22" y="24" width="56" height="42" rx="10" fill="#0f4c81" stroke="#0ea5e9" strokeWidth="2" />
          
          {/* TV antenna indicator */}
          <line x1="50" y1="24" x2="40" y2="12" stroke="#38bdf8" strokeWidth="2" />
          <line x1="50" y1="24" x2="60" y2="12" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="40" cy="12" r="2.5" fill="#38bdf8" />
          <circle cx="60" cy="12" r="2.5" fill="#38bdf8" />
        </svg>

        {/* Text 'tv' placed inside the screen with professional pairing */}
        <div className="absolute inset-0 flex items-center justify-center pt-5">
          <span className="text-white font-extrabold text-2xl tracking-tight select-none">tv</span>
        </div>
      </div>

      {variant !== 'simple' && (
        <div className="mt-2 flex flex-col items-center">
          {/* "Câmara" stylized text */}
          <h1 className="text-white font-serif text-3xl font-bold tracking-wide leading-none drop-shadow-sm select-none">
            Câmara
          </h1>
          {/* "de Maracanaú" subtitle */}
          <p className="text-sky-300 font-sans text-xs font-semibold tracking-wider uppercase mt-1 leading-none select-none">
            de Maracanaú
          </p>
        </div>
      )}
    </div>
  );
}
