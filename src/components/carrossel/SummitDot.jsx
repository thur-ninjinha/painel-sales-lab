import { STUDIO_NOTES_CONFIG } from '../../lib/carrossel/series-config'

const SIZE_PX = { sm: 16, md: 32, lg: 80, xl: 160 }

export function SummitDot({ position, size, color = STUDIO_NOTES_CONFIG.palette.accent_gold }) {
  if (position === 'none') return null
  const px = SIZE_PX[size]
  const styles = {
    position: 'absolute',
    width: px,
    height: px,
    borderRadius: 9999,
    background: color
  }
  if (position === 'top-right') {
    styles.top = 64
    styles.right = 64
  } else if (position === 'bottom-left') {
    styles.bottom = 64
    styles.left = 64
  } else if (position === 'center-mark') {
    styles.top = '50%'
    styles.left = '50%'
    styles.transform = 'translate(-50%, -50%)'
  } else if (position === 'large-corner') {
    styles.bottom = -Math.floor(px / 3)
    styles.right = -Math.floor(px / 3)
  }
  return <div style={styles} aria-hidden />
}
