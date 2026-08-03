import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

function ignoreProxyAbort(proxy) {
  proxy.on('error', (err) => {
    if (err?.code === 'ECONNABORTED' || err?.code === 'ECONNRESET' || err?.code === 'EPIPE') {
      return
    }
    console.error('[vite] proxy error:', err.message)
  })
  proxy.on('proxyReqWs', (_proxyReq, _req, socket) => {
    socket.on('error', (err) => {
      if (err?.code === 'ECONNABORTED' || err?.code === 'ECONNRESET' || err?.code === 'EPIPE') {
        return
      }
      console.error('[vite] ws proxy socket error:', err.message)
    })
  })
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const allowedHosts = ['localhost', '.ngrok-free.dev', '.ngrok.io', '192.168.1.6']
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:3001'

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
          target: apiTarget,
          changeOrigin: true,
          configure: ignoreProxyAbort,
        },
        '/socket.io': {
          target: apiTarget,
          ws: true,
          changeOrigin: true,
          configure: ignoreProxyAbort,
        },
      },
    },
    preview: {
      host: true,
      allowedHosts,
    },
  }
})
