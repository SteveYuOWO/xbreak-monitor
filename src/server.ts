import { config } from './config/index.ts'
import { handleWebhook } from './services/webhookService.ts'
import { logger } from './utils/logger.ts'

export function startServer() {
  const { port, webhookSecret } = config.server

  const server = Bun.serve({
    port,
    async fetch(req: Request): Promise<Response> {
      const url = new URL(req.url)

      // Health check
      if (req.method === 'GET' && url.pathname === '/health') {
        return new Response('OK', { status: 200 })
      }

      // Webhook endpoint: POST /webhook or POST /webhook/{secret}
      if (req.method === 'POST' && url.pathname.startsWith('/webhook')) {
        if (webhookSecret) {
          const pathSecret = url.pathname.split('/')[2] || ''
          if (pathSecret !== webhookSecret) {
            logger.warn('[Server] Webhook received with invalid secret')
            return new Response('Unauthorized', { status: 401 })
          }
        }

        try {
          const body = await req.json()
          await handleWebhook(body)
          return new Response('OK', { status: 200 })
        } catch (err) {
          logger.error('[Server] Webhook handler error:', err)
          return new Response('Internal Server Error', { status: 500 })
        }
      }

      return new Response('Not Found', { status: 404 })
    },
  })

  logger.info(`[Server] Listening on port ${server.port}`)
  return server
}
