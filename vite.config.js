import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const API_ORIGIN = 'http://103.55.104.142:5035';

// Proxy /v1 to the backend so the httpOnly fh_session cookie is first-party on localhost.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/v1': { target: API_ORIGIN, changeOrigin: true },
      '/health': { target: API_ORIGIN, changeOrigin: true },
    },
  },
});
