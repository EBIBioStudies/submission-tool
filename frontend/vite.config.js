import { fileURLToPath, URL } from 'node:url';

import {defineConfig, loadEnv} from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [vue()],
    base: env.VITE_BASE_URL || '/',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      chunkSizeWarningLimit: 1024000
    },
    server: {
      proxy: {
        '/biostudies/submissions/api': {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/biostudies\/submissions\/api/, '')
        },
        '/biostudies/submissions/config': {
          bypass: (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              instanceKey: env.VITE_INSTANCE_KEY,
              recaptchaKey: env.VITE_RECAPTCHA_KEY,
              frontendUrl: env.VITE_FRONTEND_URL
            }));
          }
        }
      }
    }
  };
});
