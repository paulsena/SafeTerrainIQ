import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
