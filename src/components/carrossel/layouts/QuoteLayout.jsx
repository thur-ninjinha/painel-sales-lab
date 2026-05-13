import { SummitDot } from '../SummitDot'
import { STUDIO_NOTES_CONFIG } from '../../../lib/carrossel/series-config'

const C = STUDIO_NOTES_CONFIG.palette

export function QuoteLayout({ slide }) {
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      width: 1080,
      height: 1350,
      background: C.bg_base,
      color: C.fg_primary,
      padding: 128,
      flexDirection: 'column',
      justifyContent: 'center',
      fontFamily: 'Geist',
      overflow: 'hidden'
    }}>
      <div style={{
        fontFamily: 'Geist',
        fontWeight: 200,
        fontSize: 240,
        lineHeight: 0.8,
        color: C.accent_gold,
        marginBottom: 32
      }}>
        "
      </div>
      <div style={{
        fontWeight: 400,
        fontSize: 60,
        lineHeight: 1.25,
        fontStyle: 'italic',
        maxWidth: 824
      }}>
        {slide.text.headline}
      </div>
      {slide.text.attribution && (
        <div style={{
          marginTop: 48,
          fontFamily: 'GeistMono',
          fontWeight: 400,
          fontSize: 24,
          color: C.fg_muted
        }}>
          — {slide.text.attribution}
        </div>
      )}
      <SummitDot position={slide.geometric.summit_dot_position} size={slide.geometric.summit_dot_size} />
    </div>
  )
}
