import postgres from 'postgres'
import { config } from '../config/index.ts'
import type { Signal } from '../types/index.ts'
import { logger } from '../utils/logger.ts'

let sql: postgres.Sql

export const db = {
  async init() {
    sql = postgres(config.db.url)

    await sql`
      CREATE TABLE IF NOT EXISTS signals (
        id         SERIAL PRIMARY KEY,
        instrument VARCHAR(20)  NOT NULL,
        direction  VARCHAR(4)   NOT NULL,
        type       VARCHAR(2)   NOT NULL,
        timeframe  VARCHAR(10)  NOT NULL,
        price      NUMERIC      NOT NULL,
        created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        UNIQUE (instrument, direction, type, timeframe)
      )
    `

    logger.info('[DB] Connected and schema ready')
  },

  /** Returns true if the signal is new (inserted), false if duplicate. */
  async tryInsertSignal(signal: Signal): Promise<boolean> {
    const result = await sql`
      INSERT INTO signals (instrument, direction, type, timeframe, price)
      VALUES (${signal.instrument}, ${signal.direction}, ${signal.type}, ${signal.timeframe}, ${signal.price})
      ON CONFLICT (instrument, direction, type, timeframe) DO NOTHING
    `
    return result.count > 0
  },

  async close() {
    await sql?.end()
    logger.info('[DB] Connection closed')
  },
}
