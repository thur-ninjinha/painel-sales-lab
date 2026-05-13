import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { CarouselDocSchema, BriefInputSchema } from '../../src/lib/carrossel/schemas.js';
import { ZENITE_SYSTEM_PROMPT, buildUserPrompt } from '../../src/lib/carrossel/prompt.js';
import { validateCarouselDoc } from '../../src/lib/carrossel/validate.js';
import { requireUser } from '../_lib/supabase.js';
import { addNewVersion, getCurrentDoc } from '../_lib/db.js';

const MODEL = process.env.CAROUSEL_AI_MODEL ?? 'claude-opus-4-7';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  const auth = await requireUser(req, res);
  if (!auth) return;
  const { supabase } = auth;

  const { carouselId, brief: rawBrief } = req.body ?? {};
  if (!carouselId) {
    res.status(400).json({ error: 'missing_carousel_id' });
    return;
  }

  let brief;
  if (rawBrief) {
    try {
      brief = BriefInputSchema.parse(rawBrief);
    } catch (e) {
      res.status(400).json({ error: 'invalid_brief', details: e.errors });
      return;
    }
  } else {
    const { doc } = await getCurrentDoc(supabase, carouselId);
    brief = { mode: 'theme', input: { topic: doc.title, tone_hint: null } };
  }

  const { object } = await generateObject({
    model: anthropic(MODEL),
    schema: CarouselDocSchema,
    system: ZENITE_SYSTEM_PROMPT,
    prompt: buildUserPrompt(brief)
  });
  validateCarouselDoc(object);
  await addNewVersion(supabase, carouselId, object);
  res.status(200).json({ ok: true });
}
