import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/', // ← très important pour le bon fonctionnement des routes
  plugins: [react()],
  server: {
    // Ce fallback fonctionne bien en dev pour une SPA React
    historyApiFallback: true
  }
});
