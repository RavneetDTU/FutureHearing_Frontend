import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// Proxy /v1 to the backend so the httpOnly fh_session cookie is first-party on localhost.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_BASE_URL || 'http://103.55.104.142:5035';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/v1': { target: apiTarget, changeOrigin: true },
        '/health': { target: apiTarget, changeOrigin: true },
      },
    },
  };
});
