/**
 * Zênite Studio brand mark — Summit Dot concept.
 * Z glyph in Barlow Condensed extra-bold italic + Summit Violet dot at apex.
 * Variants: size sm/md/lg, optional wordmark.
 * No gradients, no shadows, no glow (per brand rules).
 */
export function Brand({ size = 'md', showWordmark = false }) {
  const dims = {
    sm: { box: 'w-9 h-9', radius: 'rounded-lg', glyph: 'text-[18px]', dot: 'w-1.5 h-1.5', dotPos: 'top-[5px] right-[6px]', wordmark: 'text-lg' },
    md: { box: 'w-10 h-10', radius: 'rounded-lg', glyph: 'text-[20px]', dot: 'w-1.5 h-1.5', dotPos: 'top-[6px] right-[7px]', wordmark: 'text-xl' },
    lg: { box: 'w-14 h-14', radius: 'rounded-xl', glyph: 'text-[28px]', dot: 'w-2 h-2',     dotPos: 'top-[9px] right-[10px]', wordmark: 'text-2xl' },
  }[size]

  return (
    <div className="flex items-center gap-3">
      <div className={`${dims.box} ${dims.radius} bg-white flex items-center justify-center flex-shrink-0 relative`}>
        <span className={`font-display font-extrabold italic text-black leading-none ${dims.glyph}`}>Z</span>
        <span
          aria-hidden="true"
          className={`absolute ${dims.dotPos} ${dims.dot} rounded-full bg-summit-violet`}
        />
      </div>
      {showWordmark && (
        <span className={`font-display text-white font-bold tracking-widest uppercase italic ${dims.wordmark}`}>
          Zênite Studio
        </span>
      )}
    </div>
  )
}
