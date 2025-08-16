import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@nova-universe/ui': fileURLToPath(new URL('../../../packages/ui/dist/index.js', import.meta.url)),
      '@nova-universe/theme': fileURLToPath(new URL('../../../packages/theme/theme.ts', import.meta.url)),
      '@nova-universe/cosmo-sdk': fileURLToPath(new URL('../../../packages/cosmo-sdk/dist/index.js', import.meta.url)),
    },
  },
  server: {
    port: 5180,
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
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@heroicons/react', '@heroui/react'],
          query: ['@tanstack/react-query'],
          motion: ['framer-motion'],
          socket: ['socket.io-client'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
