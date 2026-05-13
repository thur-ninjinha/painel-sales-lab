import { createClient } from '@supabase/supabase-js';

export function getUserClient(req) {
  const auth = req.headers.authorization ?? '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false }
    }
  );
}

export async function requireUser(req, res) {
  const supabase = getUserClient(req);
  if (!supabase) {
    res.status(401).json({ error: 'no_token' });
    return null;
  }
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    res.status(401).json({ error: 'unauthorized' });
    return null;
  }
  return { supabase, user };
}
