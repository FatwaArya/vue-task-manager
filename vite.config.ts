import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isDev = command === 'serve'

  return {
    plugins: [
      vue(),
      vueDevTools(),
      tailwindcss(),
    ],
    server: isDev ? {
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    } : undefined,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
  }
})
