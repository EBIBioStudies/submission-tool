import { fileURLToPath, URL } from 'node:url';

import {defineConfig, loadEnv} from 'vite';
import vue from '@vitejs/plugin-vue';
const env = loadEnv('', process.cwd());

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: env.VITE_BASE_URL || '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build : {
    chunkSizeWarningLimit: 1024000
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
});
