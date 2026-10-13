import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/** GitHub Pages project path, or `VITE_BASE=/` for a root host. Always ends with `/`. */
function siteBase(): string {
  const raw = process.env.VITE_BASE?.trim() || '/tongyun-codeworld/'
  if (raw === '/') return '/'
  return raw.endsWith('/') ? raw : `${raw}/`
}

// https://vite.dev/config/
export default defineConfig({
  base: siteBase(),
  plugins: [react()],
})
