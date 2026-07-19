import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import type { Plugin } from 'vite'

// ─── Dev SSE middleware ────────────────────────────────────────────────────────
// Serves /api/mining-events as a Server-Sent Events endpoint in dev mode.
// Uses globalThis.__miningSSEClients (same registry as server functions).
function miningSSEPlugin(): Plugin {
  return {
    name: 'mining-sse',
    configureServer(server) {
      server.middlewares.use('/api/mining-events', (req, res) => {
        res.writeHead(200, {
          'Content-Type':      'text/event-stream; charset=utf-8',
          'Cache-Control':     'no-cache, no-transform',
          'Connection':        'keep-alive',
          'X-Accel-Buffering': 'no',
        })

        // Initial ping so the client knows it's connected
        res.write(': connected\n\n')

        // Register this client in the shared global set
        if (!globalThis.__miningSSEClients) {
          globalThis.__miningSSEClients = new Set()
        }
        const write = (data: string) => res.write(data)
        globalThis.__miningSSEClients.add(write)

        // Keepalive every 25 s
        const heartbeat = setInterval(() => {
          try { res.write(': ping\n\n') } catch { clearInterval(heartbeat) }
        }, 25_000)

        // Cleanup on disconnect
        req.on('close', () => {
          clearInterval(heartbeat)
          globalThis.__miningSSEClients?.delete(write)
          res.end()
        })
      })
    },
  }
}

const config = defineConfig({
  server: {
    host: true,
    allowedHosts: true,
    // Prevent Vite from watching data/*.json files — writing those files from
    // server functions would otherwise trigger a full SSR reload mid-save,
    // closing the progress modal before the GitHub commit completes.
    watch: {
      ignored: ['**/data/**'],
    },
  },
  plugins: [
    miningSSEPlugin(),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
