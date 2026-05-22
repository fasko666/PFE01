export default function PandaLogo({ className = 'w-8 h-8', invert = false }) {
  const fill = invert ? '#ffffff' : '#09090b';
  const stroke = invert ? '#09090b' : '#ffffff';
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer head polygon */}
      <polygon
        fill={fill}
        points="50,2 66,5 80,13 90,26 94,43 93,61 86,76 74,87 60,94 50,97 40,94 26,87 14,76 7,61 6,43 10,26 20,13 34,5"
      />
      {/* Left ear */}
      <polygon fill={fill} points="20,13 11,3 2,10 6,26" />
      {/* Right ear */}
      <polygon fill={fill} points="80,13 89,3 98,10 94,26" />

      {/* Inner face outline */}
      <polygon
        fill="none"
        stroke={stroke}
        strokeWidth="2.2"
        points="28,27 50,16 72,27 82,52 72,76 50,87 28,76 18,52"
      />

      {/* Brow — M shape: corner-L → peak-L → valley-center → peak-R → corner-R */}
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2.6"
        strokeLinejoin="miter"
        strokeLinecap="butt"
        points="28,27 42,19 50,33 58,19 72,27"
      />

      {/* Left snout diagonal: brow peak-L → lower snout left */}
      <line stroke={stroke} strokeWidth="2.6" x1="42" y1="19" x2="32" y2="62" />
      {/* Right snout diagonal: brow peak-R → lower snout right */}
      <line stroke={stroke} strokeWidth="2.6" x1="58" y1="19" x2="68" y2="62" />

      {/* Horizontal snout bar */}
      <line stroke={stroke} strokeWidth="2.2" x1="32" y1="62" x2="68" y2="62" />
      {/* Center vertical */}
      <line stroke={stroke} strokeWidth="2.2" x1="50" y1="33" x2="50" y2="62" />

      {/* Nose — small hexagon */}
      <polygon
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        points="44,70 50,65 56,70 56,79 50,83 44,79"
      />
    </svg>
  );
}

/** Compact square icon tile — white bear on pure black, matches the uploaded logo */
export function PandaTile({ size = 'md' }) {
  const sizes = { sm: 'w-7 h-7', md: 'w-8 h-8', lg: 'w-10 h-10', xl: 'w-14 h-14' };
  return (
    <div className={`${sizes[size]} bg-black rounded-xl flex items-center justify-center shrink-0 ring-1 ring-white/10`}>
      <PandaLogo className="w-[85%] h-[85%]" invert />
    </div>
  );
}
