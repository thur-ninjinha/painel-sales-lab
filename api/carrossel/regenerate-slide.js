import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { SlideSchema } from '../../src/lib/carrossel/schemas.js';
import { ZENITE_SYSTEM_PROMPT } from '../../src/lib/carrossel/prompt.js';
import { requireUser } from '../_lib/supabase.js';
import { getCurrentDoc, updateSlideInPlace } from '../_lib/db.js';

const MODEL = process.env.CAROUSEL_AI_MODEL ?? 'claude-opus-4-7';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  const auth = await requireUser(req, res);
  if (!auth) return;
  const { supabase } = auth;

  const { carouselId, slideIndex, hint } = req.body ?? {};
  if (!carouselId || !slideIndex) {
    res.status(400).json({ error: 'missing_params' });
    return;
  }

  const { doc } = await getCurrentDoc(supabase, carouselId);
  const target = doc.slides.find((s) => s.index === slideIndex);
  if (!target) {
    res.status(404).json({ error: 'slide_not_found' });
    return;
  }

  const summary = doc.slides.map((s) => ({ index: s.index, layout: s.layout, headline: s.text.headline }));
  const slidePrompt = `Regenere APENAS o slide ${slideIndex}. Mantenha o layout (${target.layout}).${hint ? ` Dica: ${hint}` : ''}

Contexto:
${JSON.stringify(summary, null, 2)}

Slide atual:
${JSON.stringify(target, null, 2)}

Retorne SÓ o novo slide.`;

  const { object } = await generateObject({
    model: anthropic(MODEL),
    schema: SlideSchema,
    system: ZENITE_SYSTEM_PROMPT,
    prompt: slidePrompt
  });
  const newSlide = { ...object, index: slideIndex, layout: target.layout };

  await updateSlideInPlace(supabase, carouselId, slideIndex, newSlide);
  res.status(200).json({ ok: true });
}
