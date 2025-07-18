import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react(), nodePolyfills()],
    optimizeDeps: {
      include: ['spark-md5', 'vuvuzela'],
    },
    resolve: {
    },
    define: {
      'process.env': env,
      global: 'globalThis',
    },
    server: {
      fs: {
        allow: ['..'],
        strict: false
      },
    },
    publicDir: 'public',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        external: [],
        output: {
          manualChunks: {
            // Remove the pouchdb line completely
          }
        }
      }
    }
  }
});
