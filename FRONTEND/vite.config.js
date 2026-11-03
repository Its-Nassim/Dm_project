import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_DEV_PROXY_TARGET || 'http://127.0.0.1:5000'
  const api = { target, changeOrigin: true }

  return {
    plugins: [react()],
    server: {
      port: 4173,
      proxy: {
        '^/predict$': api,
        '^/predict_batch$': api,
        '^/health$': api,
        '^/model_info$': api,
      },
    },
    preview: {
      port: 4173,
    },
  }
})
