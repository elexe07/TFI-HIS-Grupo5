import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// En desarrollo, /api y /docs se redirigen a la API de NestJS (sin CORS ni URLs hardcodeadas).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/docs': 'http://localhost:3000',
    },
  },
});
