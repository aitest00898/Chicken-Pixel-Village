import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const deployTarget = process.env.VITE_DEPLOY_TARGET;

export default defineConfig({
  base: deployTarget === 'github-pages' ? '/Chicken-Pixel-Village/' : '/',
  plugins: [react()],
  build: { target: 'es2022', sourcemap: true },
  server: { port: 4173 },
});
