import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      proxy: {
        [env.VITE_API_BASE_URL || '/api-stg']: {
          target: env.VITE_API_TARGET || 'https://visitorku.io',
          changeOrigin: true,
          secure: false,
          timeout: 120000,
          proxyTimeout: 120000,
        }
      }
    },
    build: {
      // Pecah chunk jika ukurannya > 500KB
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          // rolldown-vite membutuhkan manualChunks berupa fungsi
          manualChunks(id) {
            if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router')) {
              return 'vendor-vue'
            }
            if (id.includes('node_modules/axios')) {
              return 'vendor-axios'
            }
            if (id.includes('node_modules/sweetalert2') || id.includes('node_modules/vue-sweetalert2')) {
              return 'vendor-sweetalert'
            }
          }
        }
      }
    }
  }
})
