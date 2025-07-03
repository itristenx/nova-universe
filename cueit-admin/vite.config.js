import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite'; // ✅ import the Tailwind plugin

export default defineConfig({
  plugins: [
    react(),
    tailwind() // ✅ enable Tailwind
  ],
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
    'process.env.VITE_LOGO_URL': JSON.stringify(process.env.VITE_LOGO_URL)
  }
});