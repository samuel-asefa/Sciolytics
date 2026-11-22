import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Long-lived vendor chunks cache across deploys; the question bank
        // and charts stay in their own lazily-loaded chunks.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('firebase/ai') || id.includes('@firebase/ai')) return 'firebase-ai';
          if (id.includes('firebase') || id.includes('@firebase')) return 'firebase';
          if (id.includes('react-router') || id.includes('react-dom') || /node_modules\/react\//.test(id) || id.includes('scheduler')) return 'react';
          if (id.includes('lucide-react')) return 'icons';
        },
      },
    },
  },
})
