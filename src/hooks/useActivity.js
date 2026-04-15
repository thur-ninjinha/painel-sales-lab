import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

let channelCounter = 0

export function useActivity(limit = 20) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  // Unique channel name per hook instance to avoid Supabase conflicts
  const channelName = useRef(`activity_log_${++channelCounter}`).current

  const fetchActivities = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
      setActivities(data ?? [])
    } catch {
      // silently ignore fetch errors
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => { fetchActivities() }, [fetchActivities])

  // Real-time: re-fetch when a new row is inserted
  useEffect(() => {
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' }, () => {
        fetchActivities()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel).catch(() => {})
    }
  }, [channelName, fetchActivities])

  return { activities, loading, refresh: fetchActivities }
}
