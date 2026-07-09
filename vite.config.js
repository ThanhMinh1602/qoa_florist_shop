import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const allowedHosts = ['localhost', '.ngrok-free.dev', '.ngrok.io', '192.168.1.6']

  if (env.VITE_PUBLIC_BASE_URL) {
    try {
      allowedHosts.push(new URL(env.VITE_PUBLIC_BASE_URL).hostname)
    } catch {
      // ignore invalid URL in env
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true,
      allowedHosts,
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: true,
      allowedHosts,
    },
  }
})
