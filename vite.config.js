import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Vite の base（先頭スラッシュ・末尾スラッシュ）。
 * 未設定時はこのリポジトリの GitHub Pages 想定。CI では VITE_BASE_PATH を渡す。
 * ルート公開なら VITE_BASE_PATH=/
 */
function viteBaseFromEnv() {
  const raw = (process.env.VITE_BASE_PATH ?? '/ringcraft-lab/').trim()
  if (raw === '' || raw === '/') return '/'
  const lead = raw.startsWith('/') ? raw : `/${raw}`
  return lead.endsWith('/') ? lead : `${lead}/`
}

const BASE = viteBaseFromEnv()

/** GitHub Pages: 直URL・更新時に index を返す（SPA ルーティング） */
function githubPagesSpaFallback() {
  return {
    name: 'github-pages-spa-fallback',
    closeBundle() {
      const out = resolve(__dirname, 'dist')
      copyFileSync(resolve(out, 'index.html'), resolve(out, '404.html'))
    },
  }
}

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-192.png', 'pwa-512.png', 'pwa-180.png'],
      manifest: {
        id: `${BASE}tool`,
        name: 'リフィルコラージュ — RingCraft Lab',
        short_name: 'リフィルコラージュ',
        description: '画像をリフィルサイズに並べ、A4で印刷するツール',
        lang: 'ja',
        start_url: `${BASE}tool`,
        scope: BASE,
        display: 'standalone',
        orientation: 'any',
        theme_color: '#faf7f2',
        background_color: '#faf7f2',
        icons: [
          {
            src: `${BASE}pwa-192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: `${BASE}pwa-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: `${BASE}pwa-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      // 初回訪問後: ビルド成果物を precache。ナビは SPA の index にフォールバック（拡張子付き URL は除外）。
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
        navigateFallback: `${BASE}index.html`,
        navigateFallbackDenylist: [/\/[^?]*\.[^/]+$/],
      },
      devOptions: {
        enabled: false,
      },
    }),
    githubPagesSpaFallback(),
  ],
})
