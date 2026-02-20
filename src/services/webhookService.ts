import type { WebhookPayload, Signal, SignalType, SignalDirection } from '../types/index.ts'
import { telegramService } from './telegramService.ts'
import { logger } from '../utils/logger.ts'

function parseSignal(raw: string): { type: SignalType; direction: SignalDirection } | null {
  const map: Record<string, { type: SignalType; direction: SignalDirection }> = {
    'Bullish DB': { type: 'DB', direction: 'BULL' },
    'Bearish DB': { type: 'DB', direction: 'BEAR' },
    'Bullish CB': { type: 'CB', direction: 'BULL' },
    'Bearish CB': { type: 'CB', direction: 'BEAR' },
  }
  return map[raw] ?? null
}

function validatePayload(body: unknown): WebhookPayload | null {
  if (typeof body !== 'object' || body === null) return null
  const obj = body as Record<string, unknown>
  if (typeof obj.symbol !== 'string' || !obj.symbol) return null
  if (typeof obj.signal !== 'string' || !obj.signal) return null
  if (typeof obj.price !== 'string' || !obj.price) return null
  if (typeof obj.tf !== 'string' || !obj.tf) return null
  return obj as unknown as WebhookPayload
}

export async function handleWebhook(body: unknown): Promise<void> {
  const payload = validatePayload(body)
  if (!payload) {
    logger.warn('[Webhook] Invalid payload received:', body)
    return
  }

  const parsed = parseSignal(payload.signal)
  if (!parsed) {
    logger.warn(`[Webhook] Unknown signal type: "${payload.signal}"`)
    return
  }

  const signal: Signal = {
    type: parsed.type,
    direction: parsed.direction,
    instrument: payload.symbol,
    price: parseFloat(payload.price),
    timeframe: payload.tf,
  }

  logger.info(`[Webhook] Signal received: ${signal.instrument} ${signal.direction} ${signal.type} @ ${signal.price}`)

  await telegramService.sendSignalAlert(signal)

  logger.info(`[Webhook] Signal sent: ${signal.instrument} ${signal.direction} ${signal.type}`)
}
