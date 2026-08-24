import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
// Para GitHub Pages project page: username.github.io/repo-name/
const repoName = 'finance-app'

export default defineConfig({
  base: `/${repoName}/`,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Gerenciador Financeiro',
        short_name: 'Finanças',
        description: 'App para gerenciar entradas, saídas e pagamentos recorrentes',
        theme_color: '#4a90d9',
        background_color: '#f5f5f5',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: `/${repoName}/`,
        start_url: `/${repoName}/`,
        icons: [
          {
            src: 'icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
