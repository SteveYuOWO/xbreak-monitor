import { Bot } from 'grammy'
import { config } from '../config/index.ts'
import type { Signal } from '../types/index.ts'
import { logger } from '../utils/logger.ts'

function formatPrice(value: number): string {
  return value >= 100 ? value.toFixed(2) : value.toFixed(5)
}

function formatInstrument(symbol: string): string {
  const nonForex = ['BTCUSDT', 'NAS100', 'GOLD', 'SILVER', 'USOIL']
  if (nonForex.includes(symbol)) return symbol
  if (symbol.length === 6) return `${symbol.slice(0, 3)}/${symbol.slice(3)}`
  return symbol
}

function formatTimeframe(tf: string): string {
  const map: Record<string, string> = {
    '1': 'M1', '5': 'M5', '15': 'M15', '30': 'M30',
    '60': 'H1', '120': 'H2', '240': 'H4', '480': 'H8',
    'D': 'Daily', 'W': 'Weekly', 'M': 'Monthly',
  }
  return map[tf] ?? `${tf}m`
}

export class TelegramService {
  private bot: Bot

  constructor() {
    this.bot = new Bot(config.telegram.botToken)
  }

  formatSignalMessage(signal: Signal): string {
    const isBull = signal.direction === 'BULL'
    const emoji = isBull ? '🟢' : '🔴'
    const signalLabel = signal.type === 'CB' ? 'Candle Break (CB)' : 'Dominant Break (DB)'
    const pair = formatInstrument(signal.instrument)
    const tf = formatTimeframe(signal.timeframe)

    const lines = [
      `${emoji} <b>${signal.direction} ${signal.type} — ${pair}</b>`,
      '',
      `💰 Price: <code>${formatPrice(signal.price)}</code>`,
      `⏰ Timeframe: ${tf}`,
      `🔎 Signal: ${signalLabel}`,
    ]

    return lines.join('\n')
  }

  async sendSignalAlert(signal: Signal): Promise<void> {
    const text = this.formatSignalMessage(signal)
    await this.sendToAll(text)
  }

  async sendToAll(text: string): Promise<void> {
    const chatIds = config.telegram.chatIds
    if (chatIds.length === 0) {
      logger.warn('[Telegram] No chat IDs configured, skipping send')
      return
    }

    await Promise.allSettled(
      chatIds.map(async chatId => {
        try {
          await this.bot.api.sendMessage(chatId, text, {
            parse_mode: 'HTML',
            link_preview_options: { is_disabled: true },
          })
          logger.info(`[Telegram] Message sent to ${chatId}`)
        } catch (err) {
          logger.error(`[Telegram] Failed to send to ${chatId}:`, err)
        }
      })
    )
  }
}

export const telegramService = new TelegramService()
