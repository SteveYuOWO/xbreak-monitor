# xbreak-monitor

Receives webhook alerts from TradingView's [XBreak Screener](../xbreak/XBreakScreener.pine) and forwards them to Telegram.

## How It Works

```
TradingView XBreak Screener
  → POST /webhook/{secret}
    → Validate & parse signal
      → Send Telegram alert
```

## Webhook Payload

```json
{
  "symbol": "EURUSD",
  "signal": "Bullish DB",
  "price": "1.0950",
  "tf": "240"
}
```

Signal types: `Bullish DB`, `Bearish DB`, `Bullish CB`, `Bearish CB`

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/webhook/{secret}` | Receive TradingView alerts |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Telegram bot token |
| `TELEGRAM_CHAT_IDS` | Comma-separated chat IDs |
| `WEBHOOK_SECRET` | Secret in webhook URL path (optional) |

Secrets are managed via [1Password CLI](https://developer.1password.com/docs/cli/) — see `.env.tpl`.

## Development

```bash
bun install
bun run dev
```

## Deploy

```bash
./scripts/deploy.sh
```
