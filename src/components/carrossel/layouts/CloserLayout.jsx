import { SummitDot } from '../SummitDot'
import { STUDIO_NOTES_CONFIG } from '../../../lib/carrossel/series-config'

const C = STUDIO_NOTES_CONFIG.palette

export function CloserLayout({ slide }) {
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
      <div />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{
          fontWeight: 200,
          fontSize: 72,
          lineHeight: 1.1,
          letterSpacing: -1,
          maxWidth: 720
        }}>
          {slide.text.headline}
        </div>
        {slide.text.body && (
          <div style={{ marginTop: 28, fontWeight: 400, fontSize: 28, color: C.fg_muted }}>
            {slide.text.body}
          </div>
        )}
      </div>
      <div style={{
        fontFamily: 'GeistMono',
        fontWeight: 500,
        fontSize: 28,
        color: C.fg_muted
      }}>
        {STUDIO_NOTES_CONFIG.handle}
      </div>
      <SummitDot position={slide.geometric.summit_dot_position} size={slide.geometric.summit_dot_size} />
    </div>
  )
}
