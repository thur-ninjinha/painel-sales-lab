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
      <Loader2 size={22} className="text-white animate-spin" />
    </div>
  )

  if (session) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signIn(email, password)
    } catch {
      setError('Email ou senha incorretos.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-black font-black text-sm tracking-tight">SL</span>
          </div>
          <span className="font-display text-white font-bold text-xl tracking-widest uppercase italic">
            Sales Lab
          </span>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <p className="label-caps mb-2">Acesso restrito</p>
          <h1 className="font-display font-extrabold italic text-white uppercase"
              style={{ fontSize: '3rem', lineHeight: '0.9' }}>
            ENTRE NO<br />PAINEL
          </h1>
        </div>

        {/* Form */}
        <div className="card p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="label-caps">Email</label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-ink-muted focus:outline-none focus:border-border-light transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="label-caps">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-ink-muted focus:outline-none focus:border-border-light transition-colors"
            />
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/30 rounded-lg px-4 py-2.5">
              <p className="text-danger text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-white hover:bg-ink-soft text-black font-bold uppercase tracking-widest text-xs rounded-lg py-3 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><Loader2 size={14} className="animate-spin" />Entrando...</>
            ) : (
              <>Entrar <ArrowRight size={14} /></>
            )}
          </button>
        </div>

        <p className="label-caps text-center mt-6">© 2026 Sales Lab Studio</p>
      </div>
    </div>
  )
}
