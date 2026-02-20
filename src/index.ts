import { startServer } from './server.ts'
import { logger } from './utils/logger.ts'

// Config import triggers fail-fast env validation at startup
import './config/index.ts'

const server = startServer()

logger.info('[Main] xbreak-monitor running')

const shutdown = () => {
  logger.info('[Main] Shutting down...')
  server.stop()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
