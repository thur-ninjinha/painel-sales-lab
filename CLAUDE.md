# Painel Zênite Studio — Claude Code Notes

Painel interno da Zênite Studio (Arthur + Miguel). Stack: Vite + React 19 + JavaScript + Tailwind 3 + Supabase + Vercel.

## Stack
- Vite 6 + React 19 + react-router-dom v7
- Tailwind 3 (sem v4 — código pre-Zênite-standard)
- Supabase JS client-side (auth via JWT, RLS sempre ativa)
- Hospedagem: Vercel (rewrites pra SPA + Functions em `api/`)
- Repo: `thur-ninjinha/painel-sales-lab` · Supabase project `onpcdaaaetpizsufjjef`

## Módulos
- `/` Dashboard · `/caixa` · `/metas` · `/trafego` · `/leads` · `/login`

---

## Módulo: Carrossel

Em `/carrossel`. Gera carrosséis Instagram 4:5 (10 slides PNG @2x) via Claude Opus 4.7 + Satori.

**Uso interno only** — Arthur + Miguel pra produzir conteúdo do @zenitestudio__. Não revender como serviço sem combinar antes.

### Stack
- Frontend: rotas em react-router (`/carrossel`, `/carrossel/novo`, `/carrossel/:id`) protegidas pelo AppLayout
- Backend: 4 Vercel Functions em `api/carrossel/` (generate, regenerate-slide, regenerate-all, export)
- IA: Claude Opus 4.7 via Vercel AI SDK + Anthropic provider, configurável por env `CAROUSEL_AI_MODEL`
- Render: Satori + @resvg/resvg-js → PNG @2x → JSZip → Supabase Storage
- DB: 3 tabelas (`carousel_series`, `carousels`, `carousel_versions`) com RLS por created_by
- Storage: buckets privados `carousel-uploads` (imagens manuais) e `carousel-exports` (zips PNG)

### Env vars necessárias (Vercel + .env.local)
- `ANTHROPIC_API_KEY` — secret da Anthropic
- `CAROUSEL_AI_MODEL` — default `claude-opus-4-7`
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — já existentes

### Série MVP: `studio-notes`
5 layouts: cover, headline, numbered, quote, closer. Paleta dark + Summit Gold. Fonts: Geist Sans + Geist Mono (commitadas em `api/_lib/fonts/`).

### Custo aproximado por carrossel
~R$ 0,65 (Claude Opus 4.7, ~10 slides com prompt caching).

### Spec e plano de implementação
- Design spec: `~/.claude/plans/quero-criar-um-criador-fluttering-globe.md`
- Implementation plan: `~/.claude/plans/2026-05-12-carrossel-creator-implementation.md`
