import { supabase } from './supabase'

/**
 * Fire-and-forget activity logger.
 * Call after any successful CRUD operation.
 */
export async function logActivity({ action, entity_type, entity_name, meta = {} }) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('activity_log').insert([{
      user_id: user.id,
      user_email: user.email,
      action,
      entity_type,
      entity_name: entity_name ?? '',
      meta,
    }])
  } catch {
    // never block the main operation
  }
}
