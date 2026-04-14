import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2, Zap } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: '#0F1117' }}>
      {/* Gradiente decorativo de fundo */}
      <div className="absolute inset-0 bg-mesh-bg pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-brand opacity-[0.06] blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-sm relative animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-5">
            <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-glow-brand">
              SL
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-brand rounded-lg flex items-center justify-center shadow-glow-brand-sm">
              <Zap size={11} className="text-white" />
            </div>
          </div>
          <h1 className="text-text-primary font-bold text-2xl tracking-tight">Sales Lab</h1>
          <p className="text-text-secondary text-sm mt-1.5">Painel Interno — acesso restrito</p>
        </div>

        {/* Card com glass */}
        <div className="glass-strong rounded-2xl p-6 space-y-4 shadow-card">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest">Email</label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-surface2/60 border border-border/60 rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder-text-secondary/60 focus:outline-none focus:border-brand/60 focus:shadow-glow-brand-sm transition-all duration-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface2/60 border border-border/60 rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder-text-secondary/60 focus:outline-none focus:border-brand/60 focus:shadow-glow-brand-sm transition-all duration-200"
            />
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/25 rounded-xl px-3.5 py-2.5">
              <p className="text-danger text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-gradient-brand hover:opacity-90 hover:shadow-glow-brand-sm text-white font-semibold rounded-xl py-2.5 text-sm transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            {submitting ? 'Entrando...' : 'Entrar no painel'}
          </button>
        </div>

        <p className="text-center text-text-secondary/50 text-xs mt-6">© 2026 Sales Lab Studio</p>
      </div>
    </div>
  )
}
