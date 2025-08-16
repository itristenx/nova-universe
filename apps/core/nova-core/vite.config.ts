import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.ts', '.tsx', '.jsx', '.js', '.mjs', '.cjs', '.json'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@nova-universe/ui': fileURLToPath(new URL('../../../packages/ui/dist/index.mjs', import.meta.url)),
      // Back-compat: map legacy theme import to design-tokens
      '@nova-universe/theme': fileURLToPath(new URL('../../../packages/design-tokens/dist/index.esm.js', import.meta.url)),
      '@nova-universe/design-tokens': fileURLToPath(new URL('../../../packages/design-tokens/dist/index.esm.js', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
