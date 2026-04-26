import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import prerender from '@prerenderer/rollup-plugin'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/n8n-zeno/',
  plugins: [
    react(),
    prerender({
      routes: ['/', '/login', '/signup', '/checkout'],
      renderer: '@prerenderer/renderer-jsdom',
      server: {
        port: 3000,
        host: 'localhost',
      },
    }),
  ],
  build: {
    target: 'es2015'
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})