import { CoverLayout } from './layouts/CoverLayout'
import { HeadlineLayout } from './layouts/HeadlineLayout'
import { NumberedLayout } from './layouts/NumberedLayout'
import { QuoteLayout } from './layouts/QuoteLayout'
import { CloserLayout } from './layouts/CloserLayout'

export function SlideCanvas({ slide }) {
  switch (slide.layout) {
    case 'cover':    return <CoverLayout slide={slide} />
    case 'headline': return <HeadlineLayout slide={slide} />
    case 'numbered': return <NumberedLayout slide={slide} />
    case 'quote':    return <QuoteLayout slide={slide} />
    case 'closer':   return <CloserLayout slide={slide} />
    default:         return null
  }
}
