function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

export const config = {
  telegram: {
    botToken: requireEnv('TELEGRAM_BOT_TOKEN'),
    chatIds: requireEnv('TELEGRAM_CHAT_IDS').split(',').map(s => s.trim()).filter(Boolean),
  },

  server: {
    port: 58431,
    webhookSecret: process.env.WEBHOOK_SECRET || '',
  },
} as const
