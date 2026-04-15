import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useActivity(limit = 20) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    setActivities(data ?? [])
    setLoading(false)
  }, [limit])

  useEffect(() => { fetch() }, [fetch])

  // Real-time: re-fetch when a new row is inserted
  useEffect(() => {
    const channel = supabase
      .channel('activity_log_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' }, () => {
        fetch()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetch])

  return { activities, loading, refresh: fetch }
}
