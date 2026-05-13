import { SummitDot } from '../SummitDot'
import { STUDIO_NOTES_CONFIG } from '../../../lib/carrossel/series-config'

const C = STUDIO_NOTES_CONFIG.palette

export function NumberedLayout({ slide }) {
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      width: 1080,
      height: 1350,
      background: C.bg_elevated,
      color: C.fg_primary,
      padding: 96,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 64,
      fontFamily: 'Geist',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', flexBasis: '30%', alignItems: 'flex-start' }}>
        <div style={{
          fontFamily: 'GeistMono',
          fontWeight: 500,
          fontSize: 200,
          lineHeight: 0.9,
          color: C.accent_gold
        }}>
          {slide.number ?? '/00'}
        </div>
      </div>
      <div style={{ width: 1, height: 480, background: C.fg_muted, opacity: 0.3 }} />
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          fontWeight: 400,
          fontSize: 56,
          lineHeight: 1.15,
          letterSpacing: -0.5
        }}>
          {slide.text.headline}
        </div>
        {slide.text.body && (
          <div style={{
            marginTop: 24,
            fontWeight: 400,
            fontSize: 26,
            lineHeight: 1.4,
            color: C.fg_muted
          }}>
            {slide.text.body}
          </div>
        )}
      </div>
      <SummitDot position={slide.geometric.summit_dot_position} size={slide.geometric.summit_dot_size} />
    </div>
  )
}
