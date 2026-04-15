import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

function showFatalError(err) {
  const msg = err?.message ?? String(err)
  document.body.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:monospace">
      <div style="max-width:480px;width:100%;text-align:center">
        <div style="width:48px;height:48px;background:#fff;border-radius:10px;display:flex;align-items:center;justify-content:center;margin:0 auto 24px">
          <span style="color:#000;font-weight:900;font-size:13px">SL</span>
        </div>
        <p style="color:#FF4545;font-size:10px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;margin-bottom:10px">Erro fatal</p>
        <h1 style="color:#fff;font-size:2rem;font-weight:900;margin:0 0 16px;line-height:1">O PAINEL NÃO CARREGOU</h1>
        <div style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:10px;padding:14px 16px;margin-bottom:20px;text-align:left">
          <p style="color:#FF4545;font-size:12px;word-break:break-all;margin:0">${msg}</p>
        </div>
        <button onclick="(function(){Object.keys(localStorage).forEach(k=>localStorage.removeItem(k));location.reload()})()"
          style="background:#fff;color:#000;border:none;border-radius:10px;padding:12px 24px;font-weight:900;font-size:11px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;width:100%">
          Limpar tudo e recarregar
        </button>
        <p style="color:#444;font-size:11px;margin-top:12px">Ou tente em uma aba anônima (Ctrl+Shift+N)</p>
      </div>
    </div>
  `
}

// Captura erros síncronos de módulos
window.addEventListener('error', (e) => {
  if (e.error && !(e.error instanceof React?.Component)) {
    showFatalError(e.error)
  }
})

// Captura promises rejeitadas
window.addEventListener('unhandledrejection', (e) => {
  console.error('[Unhandled rejection]', e.reason)
})

try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (err) {
  showFatalError(err)
}
