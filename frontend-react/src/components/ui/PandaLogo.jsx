/**
 * Auto-switches between logo versions:
 *   /1.png  — light-mode logo (shown when html.dark is absent)
 *   /2.png  — dark-mode logo  (shown when html.dark is set)
 *
 * The `invert` prop is kept for backward compat but no longer does anything.
 */
export default function PandaLogo({ className = 'w-8 h-8', style, invert = false }) {
  return (
    <span className="contents">
      {/* light mode → logo 1 */}
      <img
        src="/1.png"
        alt="PANDA"
        draggable={false}
        style={style}
        className={`${className} object-contain select-none block dark:hidden`}
      />
      {/* dark mode → logo 2 */}
      <img
        src="/2.png"
        alt="PANDA"
        draggable={false}
        style={style}
        className={`${className} object-contain select-none hidden dark:block`}
      />
    </span>
  );
}

/** Compact square icon tile — always on a dark/black surface, so always uses logo 1. */
export function PandaTile({ size = 'md' }) {
  const sizes = { sm: 'w-7 h-7', md: 'w-8 h-8', lg: 'w-10 h-10', xl: 'w-14 h-14' };
  return (
    <div className={`${sizes[size]} bg-black rounded-xl flex items-center justify-center shrink-0 ring-1 ring-white/10`}>
      <img
        src="/2.png"
        alt="PANDA"
        draggable={false}
        className="w-[85%] h-[85%] object-contain select-none"
      />
    </div>
  );
}
