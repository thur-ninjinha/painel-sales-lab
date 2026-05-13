import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { CarouselDocSchema, BriefInputSchema } from '../../src/lib/carrossel/schemas.js';
import { ZENITE_SYSTEM_PROMPT, buildUserPrompt } from '../../src/lib/carrossel/prompt.js';
import { validateCarouselDoc, ValidationError } from '../../src/lib/carrossel/validate.js';
import { requireUser } from '../_lib/supabase.js';
import { createCarouselWithVersion } from '../_lib/db.js';

const MODEL = process.env.CAROUSEL_AI_MODEL ?? 'claude-opus-4-7';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  const auth = await requireUser(req, res);
  if (!auth) return;
  const { supabase, user } = auth;

  let brief;
  try {
    brief = BriefInputSchema.parse(req.body);
  } catch (e) {
    res.status(400).json({ error: 'invalid_brief', details: e.errors });
    return;
  }

  let doc, attempts = 0;
  while (true) {
    const { object } = await generateObject({
      model: anthropic(MODEL),
      schema: CarouselDocSchema,
      system: ZENITE_SYSTEM_PROMPT,
      prompt: buildUserPrompt(brief),
      providerOptions: { anthropic: { cacheControl: { type: 'ephemeral' } } }
    });
    doc = object;
    try {
      validateCarouselDoc(doc);
      break;
    } catch (e) {
      if (!(e instanceof ValidationError)) throw e;
      attempts++;
      if (attempts > 1) {
        res.status(500).json({ error: 'ai_validation_failed', message: e.message });
        return;
      }
    }
  }

  const { carouselId } = await createCarouselWithVersion(supabase, user.id, brief, doc);
  res.status(200).json({ carouselId });
}
