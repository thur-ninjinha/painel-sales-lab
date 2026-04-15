import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  handleReset() {
    // Limpa localStorage de auth e recarrega
    Object.keys(localStorage)
      .filter(k => k.includes('supabase') || k.includes('-auth-token') || k.includes('sb-'))
      .forEach(k => localStorage.removeItem(k))
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-6">
            <span className="text-black font-black text-sm">SL</span>
          </div>
          <p className="label-caps mb-2 text-danger">Erro inesperado</p>
          <h1 className="font-display font-extrabold italic text-white uppercase mb-4"
              style={{ fontSize: '2.5rem', lineHeight: '0.95' }}>
            ALGO<br />DEU ERRADO
          </h1>
          <p className="text-ink-muted text-xs mb-6">
            {this.state.error?.message ?? 'Erro desconhecido'}
          </p>
          <button
            onClick={() => this.handleReset()}
            className="w-full bg-white hover:bg-gray-100 text-black font-bold uppercase tracking-widest text-xs rounded-lg py-3 transition-colors"
          >
            Limpar cache e recarregar
          </button>
        </div>
      </div>
    )
  }
}
