import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [user, setUser]       = useState(null)

  useEffect(() => {
    // Timeout de segurança: se o Supabase não responder em 6s, força null
    // (evita tela preta por token corrompido ou falha de rede)
    const timeout = setTimeout(() => {
      setSession(prev => {
        if (prev === undefined) {
          console.warn('[Auth] getSession timeout — forçando session null')
          return null
        }
        return prev
      })
    }, 6000)

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        clearTimeout(timeout)
        setSession(session ?? null)
        setUser(session?.user ?? null)
      })
      .catch((err) => {
        clearTimeout(timeout)
        console.error('[Auth] getSession error:', err)
        // Limpa dados de auth corrompidos e reseta
        try { localStorage.removeItem('sb-' + new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0] + '-auth-token') } catch {}
        setSession(null)
        setUser(null)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      clearTimeout(timeout)
      setSession(session ?? null)
      setUser(session?.user ?? null)
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const loading = session === undefined

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
