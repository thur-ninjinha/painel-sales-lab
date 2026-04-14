import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2, ArrowRight } from 'lucide-react'

export function Login() {
  const { session, loading, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-bg">
      <Loader2 size={24} className="text-brand animate-spin" />
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
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 animate-fade-in">
      {/* Glow de fundo */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #7C6EFA 0%, transparent 70%)', filter: 'blur(60px)' }}
      />

      <div className="w-full max-w-[360px] relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-brand items-center justify-center mb-5 shadow-brand-lg">
            <span className="text-white font-bold text-lg">SL</span>
          </div>
          <h1 className="text-text-primary font-bold text-2xl tracking-tight">Boas-vindas</h1>
          <p className="text-text-secondary text-sm mt-1.5">Entre no seu painel Sales Lab</p>
        </div>

        {/* Form card */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Email</label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-surface2 border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface2 border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </div>

            {error && (
              <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-2.5">
                <p className="text-danger text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand hover:bg-brand-hover text-white font-semibold rounded-xl py-2.5 text-sm transition-all shadow-brand hover:shadow-brand-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
            >
              {submitting ? (
                <><Loader2 size={15} className="animate-spin" />Entrando...</>
              ) : (
                <>Entrar<ArrowRight size={15} /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-text-muted text-xs mt-6">© 2026 Sales Lab Studio</p>
      </div>
    </div>
  )
}
