export async function createCarouselWithVersion(supabase, userId, brief, doc) {
  const { data: carousel, error: cErr } = await supabase
    .from('carousels')
    .insert({ series_id: doc.series_id, title: doc.title, brief, created_by: userId })
    .select()
    .single();
  if (cErr) throw new Error(`carousel_create_failed: ${cErr.message}`);

  const { data: version, error: vErr } = await supabase
    .from('carousel_versions')
    .insert({ carousel_id: carousel.id, version_number: 1, doc })
    .select()
    .single();
  if (vErr) throw new Error(`version_create_failed: ${vErr.message}`);

  await supabase.from('carousels').update({ current_version_id: version.id }).eq('id', carousel.id);
  return { carouselId: carousel.id, versionId: version.id };
}

export async function getCurrentDoc(supabase, carouselId) {
  const { data, error } = await supabase
    .from('carousels')
    .select('current_version_id, version:carousel_versions!current_version_id(*)')
    .eq('id', carouselId)
    .single();
  if (error || !data?.version) throw new Error('current_version_missing');
  const v = Array.isArray(data.version) ? data.version[0] : data.version;
  return { doc: v.doc, versionId: v.id, versionNumber: v.version_number };
}

export async function updateSlideInPlace(supabase, carouselId, slideIndex, newSlide) {
  const { doc, versionId } = await getCurrentDoc(supabase, carouselId);
  const updatedDoc = { ...doc, slides: doc.slides.map((s) => (s.index === slideIndex ? newSlide : s)) };
  const { error } = await supabase.from('carousel_versions').update({ doc: updatedDoc }).eq('id', versionId);
  if (error) throw new Error(`update_slide_failed: ${error.message}`);
}

export async function addNewVersion(supabase, carouselId, doc) {
  const { data: maxV } = await supabase
    .from('carousel_versions')
    .select('version_number')
    .eq('carousel_id', carouselId)
    .order('version_number', { ascending: false })
    .limit(1)
    .single();
  const nextNum = (maxV?.version_number ?? 0) + 1;

  const { data: version, error } = await supabase
    .from('carousel_versions')
    .insert({ carousel_id: carouselId, version_number: nextNum, doc })
    .select()
    .single();
  if (error) throw new Error(`new_version_failed: ${error.message}`);

  await supabase.from('carousels').update({ current_version_id: version.id }).eq('id', carouselId);
  return version.id;
}

export async function markVersionExported(supabase, versionId, zipPath) {
  const { error } = await supabase
    .from('carousel_versions')
    .update({ exported_at: new Date().toISOString(), export_zip_path: zipPath })
    .eq('id', versionId);
  if (error) throw new Error(`mark_exported_failed: ${error.message}`);
}
