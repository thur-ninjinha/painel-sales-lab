import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Mostra diagnóstico diretamente no DOM antes do React montar
  document.body.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:monospace">
      <div style="max-width:480px;width:100%">
        <p style="color:#FF4545;font-size:11px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;margin-bottom:12px">Erro de configuração</p>
        <h1 style="color:#fff;font-size:2rem;font-weight:900;margin:0 0 16px">Variáveis de ambiente ausentes</h1>
        <p style="color:#888;font-size:13px;margin-bottom:16px">
          As variáveis <code style="color:#fff">VITE_SUPABASE_URL</code> e <code style="color:#fff">VITE_SUPABASE_ANON_KEY</code>
          não estão definidas neste deployment.
        </p>
        <p style="color:#555;font-size:11px">Configure-as no painel da Vercel em Settings → Environment Variables e faça um novo deploy.</p>
      </div>
    </div>
  `
  throw new Error('VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
