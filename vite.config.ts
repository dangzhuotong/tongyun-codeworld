import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/** GitHub Pages project path, or `VITE_BASE=/` for a root host. Always ends with `/`. */
function siteBase(): string {
  const raw = process.env.VITE_BASE?.trim() || '/tongyun-codeworld/'
  if (raw === '/') return '/'
  return raw.endsWith('/') ? raw : `${raw}/`
}

// https://vite.dev/config/
const base = siteBase()

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    // 仅本地 dev。线上静态站先请求 raw.githubusercontent.com，失败再试 jsDelivr。
    proxy: {
      [`${base}sdn-raw`]: {
        target: 'https://raw.githubusercontent.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^.*\/sdn-raw(?=\/|$)/, '/liquidslr/system-design-notes/main'),
      },
    },
  },
})
