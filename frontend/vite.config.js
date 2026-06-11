import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // reachable through the Cloudflare tunnel
    allowedHosts: ['stammtisch.zulatus.com'],
  },
})
