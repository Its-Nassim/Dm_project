import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_DEV_PROXY_TARGET || 'http://127.0.0.1:5000'
  const api = { target, changeOrigin: true }
  return {
    plugins: [react()],
    server: {
      proxy: {
        '^/predict$': api,
        '^/predict_batch$': api,
        '^/health$': api,
        '^/model_info$': api,
        // add the download route here once M5 confirms its path (section 8)
      },
    },
  }
})
