import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// GitHub Pages のプロジェクトサイトでは base が /リポジトリ名/ になる。
// CI では `VITE_BASE_PATH` を workflow 側で渡す。ローカルは `/` のまま。
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    {
      name: 'spa-github-pages-404',
      closeBundle() {
        copyFileSync(
          resolve(__dirname, 'dist/index.html'),
          resolve(__dirname, 'dist/404.html'),
        )
      },
    },
  ],
})
