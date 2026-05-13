import { supabase } from '../supabase';

export async function listCarousels() {
  const { data, error } = await supabase
    .from('carousels')
    .select('id, title, updated_at, series_id')
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getCarouselFull(id) {
  const { data, error } = await supabase
    .from('carousels')
    .select('*, versions:carousel_versions(*)')
    .eq('id', id)
    .order('version_number', { foreignTable: 'carousel_versions', ascending: true })
    .single();
  if (error) throw new Error(error.message);
  return data;
}
