import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

export function Login() {
  const { session, loading, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-bg">
      <Loader2 size={28} className="text-brand animate-spin" />
    </div>
  )

  if (session) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signIn(email, password)
    } catch (err) {
      setError('Email ou senha incorretos.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg shadow-brand/20">
            SL
          </div>
          <h1 className="text-text-primary font-bold text-2xl">Sales Lab</h1>
          <p className="text-text-secondary text-sm mt-1">Painel Interno — acesso restrito</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Email</label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand hover:bg-brand-hover text-white font-medium rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
