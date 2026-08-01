import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const deployTarget = process.env.VITE_DEPLOY_TARGET;

export default defineConfig({
  base: deployTarget === 'github-pages' ? '/Chicken-Pixel-Village/' : '/',
  plugins: [react()],
  build: {
    target: 'es2022',
    sourcemap: true,
    // Firestore's browser SDK is a single vendor chunk; route and Firebase families are split below.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('/node_modules/')) return undefined;
          if (id.includes('/firebase/firestore') || id.includes('/@firebase/firestore')) return 'firebase-firestore';
          if (id.includes('/firebase/auth') || id.includes('/@firebase/auth')) return 'firebase-auth';
          if (id.includes('/firebase/functions') || id.includes('/@firebase/functions')) return 'firebase-functions';
          if (id.includes('/firebase/data-connect') || id.includes('/@firebase/data-connect')) return 'firebase-data-connect';
          if (id.includes('/firebase/')) return 'firebase-core';
          return undefined;
        },
      },
    },
  },
  server: { port: 4173 },
});
