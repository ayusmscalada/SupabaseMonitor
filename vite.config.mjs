import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Read only to find the API server; nothing here is exposed to the browser bundle.
  const env = loadEnv(mode, process.cwd(), '');
  const api = `http://${env.SERVER_IP || '127.0.0.1'}:${env.PORT || 3000}`;

  return {
    plugins: [react()],
    server: {
      proxy: { '/api': api },
    },
  };
});
