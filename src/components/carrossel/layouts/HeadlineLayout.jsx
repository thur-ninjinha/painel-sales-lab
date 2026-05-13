import { SummitDot } from '../SummitDot'
import { STUDIO_NOTES_CONFIG } from '../../../lib/carrossel/series-config'

const C = STUDIO_NOTES_CONFIG.palette

function renderHeadlineWithAccent(headline, accent) {
  if (!accent) return headline
  const idx = headline.toLowerCase().indexOf(accent.toLowerCase())
  if (idx < 0) return headline
  const before = headline.slice(0, idx)
  const match = headline.slice(idx, idx + accent.length)
  const after = headline.slice(idx + accent.length)
  return (
    <>
      {before}
      <span style={{ color: C.accent_gold }}>{match}</span>
      {after}
    </>
  )
}

export function HeadlineLayout({ slide }) {
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      width: 1080,
      height: 1350,
      background: C.bg_base,
      color: C.fg_primary,
      padding: 173,
      flexDirection: 'column',
      justifyContent: 'center',
      fontFamily: 'Geist',
      overflow: 'hidden'
    }}>
      <div style={{
        fontWeight: 700,
        fontSize: 84,
        lineHeight: 1.1,
        letterSpacing: -1.5,
        display: 'flex',
        flexWrap: 'wrap'
      }}>
        {renderHeadlineWithAccent(slide.text.headline, slide.text.accent_word)}
      </div>
      {slide.text.body && (
        <div style={{
          marginTop: 32,
          fontWeight: 400,
          fontSize: 28,
          lineHeight: 1.4,
          color: C.fg_muted,
          maxWidth: 720
        }}>
          {slide.text.body}
        </div>
      )}
      <SummitDot position={slide.geometric.summit_dot_position} size={slide.geometric.summit_dot_size} />
    </div>
  )
}
