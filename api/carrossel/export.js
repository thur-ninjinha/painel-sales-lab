import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import JSZip from 'jszip';
import React from 'react';
import { requireUser } from '../_lib/supabase.js';
import { getCurrentDoc, markVersionExported } from '../_lib/db.js';
import { loadGeistFonts } from '../_lib/fonts.js';
import { SlideCanvas } from '../../src/components/carrossel/SlideCanvas.jsx';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  const auth = await requireUser(req, res);
  if (!auth) return;
  const { supabase } = auth;

  const { carouselId } = req.body ?? {};
  if (!carouselId) {
    res.status(400).json({ error: 'missing_carousel_id' });
    return;
  }

  const { doc, versionId, versionNumber } = await getCurrentDoc(supabase, carouselId);
  const fonts = await loadGeistFonts();

  const pngs = await Promise.all(
    doc.slides.map(async (slide) => {
      const svg = await satori(React.createElement(SlideCanvas, { slide }), {
        width: 1080,
        height: 1350,
        fonts
      });
      const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 2160 } });
      return {
        name: `slide-${String(slide.index).padStart(2, '0')}.png`,
        buffer: resvg.render().asPng()
      };
    })
  );

  const zip = new JSZip();
  pngs.forEach((p) => zip.file(p.name, p.buffer));
  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

  const zipPath = `carousels/${carouselId}/v${versionNumber}.zip`;
  const { error: upErr } = await supabase.storage
    .from('carousel-exports')
    .upload(zipPath, zipBuffer, { upsert: true, contentType: 'application/zip' });
  if (upErr) {
    res.status(500).json({ error: 'upload_failed', message: upErr.message });
    return;
  }

  await markVersionExported(supabase, versionId, zipPath);

  const { data: signed, error: signErr } = await supabase.storage
    .from('carousel-exports')
    .createSignedUrl(zipPath, 3600);
  if (signErr) {
    res.status(500).json({ error: 'sign_failed' });
    return;
  }

  res.status(200).json({ zipUrl: signed.signedUrl });
}
