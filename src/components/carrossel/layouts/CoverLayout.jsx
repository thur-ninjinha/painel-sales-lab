import { SummitDot } from '../SummitDot'
import { STUDIO_NOTES_CONFIG } from '../../../lib/carrossel/series-config'

const C = STUDIO_NOTES_CONFIG.palette

export function CoverLayout({ slide }) {
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      width: 1080,
      height: 1350,
      background: C.bg_base,
      color: C.fg_primary,
      padding: 96,
      flexDirection: 'column',
      justifyContent: 'space-between',
      fontFamily: 'Geist',
      overflow: 'hidden'
    }}>
      {slide.text.eyebrow ? (
        <div style={{
          fontFamily: 'GeistMono',
          fontSize: 28,
          fontWeight: 400,
          color: C.fg_muted,
          letterSpacing: 0.5
        }}>
          {slide.text.eyebrow}
        </div>
      ) : <div />}
      <div style={{
        fontWeight: 200,
        fontSize: 96,
        lineHeight: 1.05,
        letterSpacing: -2,
        maxWidth: 880
      }}>
        {slide.text.headline}
      </div>
      {slide.text.body ? (
        <div style={{ fontFamily: 'GeistMono', fontSize: 24, color: C.fg_muted }}>
          {slide.text.body}
        </div>
      ) : <div />}
      <SummitDot position={slide.geometric.summit_dot_position} size={slide.geometric.summit_dot_size} />
    </div>
  )
}
