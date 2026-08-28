import React from 'react';

/**
 * TRINETHRA Shield Logo - Exact replica of the brand logo from the screenshot.
 * Shield shape with:
 *  - Traffic light (top-left of shield)
 *  - Camera (top-right of shield)
 *  - Eye symbol (bottom center of shield)
 */
interface TrinethraLogoProps {
  className?: string;
  size?: number;
}

export const TrinethraLogo: React.FC<TrinethraLogoProps> = ({
  className = "h-20 w-auto",
  size
}) => {
  const s = size ? size : undefined;
  return (
    <svg
      className={className}
      width={s}
      height={s}
      viewBox="0 0 120 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield outer shape */}
      <path
        d="M60 4 L108 22 L108 62 C108 92 88 114 60 132 C32 114 12 92 12 62 L12 22 Z"
        fill="#0C2540"
      />
      {/* Shield inner lighter border */}
      <path
        d="M60 11 L101 27 L101 62 C101 88 83 108 60 124 C37 108 19 88 19 62 L19 27 Z"
        fill="#122B4A"
      />

      {/* ── Traffic Light (top-left quadrant) ── */}
      {/* Traffic light housing */}
      <rect x="26" y="28" width="28" height="52" rx="5" fill="#1E3A5F" stroke="#4A90D9" strokeWidth="1.5"/>
      {/* Red light */}
      <circle cx="40" cy="40" r="8" fill="#EF4444"/>
      <circle cx="40" cy="40" r="5" fill="#FF6B6B"/>
      {/* Yellow light */}
      <circle cx="40" cy="54" r="8" fill="#F59E0B"/>
      <circle cx="40" cy="54" r="5" fill="#FBD38D"/>
      {/* Green light */}
      <circle cx="40" cy="68" r="8" fill="#10B981"/>
      <circle cx="40" cy="68" r="5" fill="#6EE7B7"/>
      {/* Traffic light pole */}
      <rect x="38" y="80" width="4" height="6" rx="1" fill="#4A90D9"/>

      {/* ── Camera (top-right quadrant) ── */}
      {/* Camera body */}
      <rect x="66" y="34" width="32" height="24" rx="4" fill="#1E3A5F" stroke="#4A90D9" strokeWidth="1.5"/>
      {/* Camera lens outer ring */}
      <circle cx="82" cy="46" r="9" fill="#0C2540" stroke="#4A90D9" strokeWidth="2"/>
      {/* Camera lens inner */}
      <circle cx="82" cy="46" r="5.5" fill="#1E3A5F"/>
      <circle cx="82" cy="46" r="3" fill="#4A90D9" opacity="0.7"/>
      <circle cx="84" cy="44" r="1" fill="white" opacity="0.5"/>
      {/* Camera viewfinder bump */}
      <rect x="90" y="38" width="7" height="6" rx="2" fill="#1E3A5F" stroke="#4A90D9" strokeWidth="1"/>
      {/* Camera flash dot */}
      <circle cx="70" cy="38" r="2" fill="#F59E0B"/>

      {/* ── Eye symbol (bottom center) ── */}
      {/* Eye outline */}
      <path
        d="M36 96 Q60 78 84 96 Q60 114 36 96 Z"
        fill="#1E3A5F"
        stroke="#4A90D9"
        strokeWidth="1.5"
      />
      {/* Iris */}
      <circle cx="60" cy="96" r="10" fill="#0C2540" stroke="#4A90D9" strokeWidth="1.5"/>
      {/* Pupil */}
      <circle cx="60" cy="96" r="6" fill="#4A90D9"/>
      <circle cx="60" cy="96" r="3" fill="#0C2540"/>
      {/* Eye shine */}
      <circle cx="63" cy="93" r="1.5" fill="white" opacity="0.7"/>

      {/* Divider lines between quadrants */}
      <line x1="57" y1="22" x2="57" y2="88" stroke="#4A90D9" strokeWidth="0.8" opacity="0.4" strokeDasharray="3,3"/>
      <line x1="22" y1="88" x2="98" y2="88" stroke="#4A90D9" strokeWidth="0.8" opacity="0.4" strokeDasharray="3,3"/>
    </svg>
  );
};
