import { z } from 'zod';

export const LayoutEnum = z.enum(['cover', 'headline', 'numbered', 'quote', 'closer']);

export const SummitDotPosition = z.enum(['top-right', 'bottom-left', 'center-mark', 'large-corner', 'none']);
export const SummitDotSize = z.enum(['sm', 'md', 'lg', 'xl']);

export const SlideSchema = z.object({
  layout: LayoutEnum,
  index: z.number().int().min(1).max(10),
  text: z.object({
    eyebrow: z.string().nullable(),
    headline: z.string().min(1),
    body: z.string().nullable(),
    accent_word: z.string().nullable(),
    attribution: z.string().nullable()
  }),
  number: z.string().nullable(),
  geometric: z.object({
    summit_dot_position: SummitDotPosition,
    summit_dot_size: SummitDotSize
  }),
  asset_placeholder: z.boolean()
});

export const CarouselDocSchema = z.object({
  series_id: z.literal('studio-notes'),
  title: z.string().min(1).max(120),
  slides: z.array(SlideSchema).length(10),
  meta: z.object({
    estimated_read_minutes: z.number().int().min(1).max(15),
    detected_intent: z.enum(['educational', 'case-study', 'reflection', 'announcement', 'tips'])
  })
});

export const BriefInputSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('theme'),
    input: z.object({
      topic: z.string().min(3).max(300),
      tone_hint: z.string().max(200).nullable()
    })
  }),
  z.object({
    mode: z.literal('repurpose'),
    input: z.object({
      source_text: z.string().min(50).max(8000)
    })
  }),
  z.object({
    mode: z.literal('template'),
    input: z.object({
      skeleton: z.array(z.string().min(1)).length(10)
    })
  })
]);
