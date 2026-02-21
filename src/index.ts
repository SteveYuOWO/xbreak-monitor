import { startServer } from './server.ts'
import { db } from './services/db.ts'
import { logger } from './utils/logger.ts'

// Config import triggers fail-fast env validation at startup
import './config/index.ts'

await db.init()

const server = startServer()

logger.info('[Main] xbreak-monitor running')

const shutdown = async () => {
  logger.info('[Main] Shutting down...')
  server.stop()
  await db.close()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
