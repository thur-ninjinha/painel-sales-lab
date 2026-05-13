import { SlideCanvas } from './SlideCanvas'
import { RegenerateButton } from './RegenerateButton'
import { AssetUpload } from './AssetUpload'

export function SlideGrid({ carouselId, slides, onChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {slides.map((slide) => (
        <div key={slide.index} className="flex flex-col gap-3">
          <div className="relative aspect-[4/5] overflow-hidden rounded border border-border bg-bg">
            <div style={{ transform: 'scale(0.333)', transformOrigin: 'top left', width: 1080, height: 1350 }}>
              <SlideCanvas slide={slide} />
            </div>
          </div>
          <div className="relative flex items-center justify-between">
            <span className="font-mono text-xs text-ink-muted">
              /{String(slide.index).padStart(2, '0')} · {slide.layout}
            </span>
            <div className="flex gap-2">
              <RegenerateButton carouselId={carouselId} slideIndex={slide.index} onDone={onChange} />
              <AssetUpload carouselId={carouselId} slideIndex={slide.index} onDone={onChange} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
