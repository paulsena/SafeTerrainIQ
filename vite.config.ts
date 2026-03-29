import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'SafeTerrainIQ — Know Your Ground',
        short_name: 'SafeTerrainIQ',
        description: 'Terrain safety intelligence at your fingertips',
        theme_color: '#4a7c59',
        background_color: '#1a2d3d',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/arcgis': {
        target: 'https://gis.buncombecounty.org',
        changeOrigin: true,
        secure: true,
      },
      '/gemini-api': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/gemini-api/, ''),
        secure: true,
      },
    },
  },
})
