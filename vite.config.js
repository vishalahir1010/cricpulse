import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'CricPulse — Live Cricket. Real Stats. One Place.',
        short_name: 'CricPulse',
        description: 'Live cricket scores, scorecards, series, players and stats in one premium dashboard.',
        theme_color: '#0a0e12',
        background_color: '#0a0e12',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache only the built app shell (JS/CSS/HTML/icons). Live data —
        // Firestore, Cloud Functions (cricketProxy/weatherProxy), Firebase
        // Auth — is deliberately left OUT of any runtime caching rule, so
        // every request for it always hits the network and a "cached"
        // service worker can never show a stale live score as if fresh.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/__/],
      },
      devOptions: {
        enabled: false, // avoid SW caching interfering with `npm run dev`
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        // Split heavy, rarely-changing vendor code out of the main bundle
        // so a route change doesn't re-download all of Firebase/Recharts,
        // and the browser can cache these chunks independently.
        manualChunks(id) {
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'firebase';
          }
          if (id.includes('node_modules/recharts')) {
            return 'charts';
          }
          if (id.includes('node_modules/react-icons')) {
            return 'icons';
          }
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true,
    css: false,
  },
})
