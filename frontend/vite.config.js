import { fileURLToPath, URL } from 'node:url';

import {defineConfig, loadEnv} from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      vue(),
      {
        name: 'config-endpoint',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/biostudies/submissions/config') {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                instanceKey: env.VITE_INSTANCE_KEY,
                recaptchaKey: env.VITE_RECAPTCHA_KEY,
                frontendUrl: env.VITE_FRONTEND_URL
              }));
            } else {
              next();
            }
          });
        }
      }
    ],
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
        '/biostudies/submissions/ror/organizations' : {
          target: "https://api.ror.org",
          changeOrigin: true,
          pathRewrite: { '^/biostudies/submissions/ror/organizations': '/v2/organizations' }
        }
      }
    }
  };
});
