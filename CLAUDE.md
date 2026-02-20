# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

xbreak-monitor receives webhook alerts from TradingView's XBreak Screener and forwards them as formatted messages to Telegram. It runs on Bun, uses grammY for the Telegram bot API, and is deployed via Docker on a remote server.

## Commands

- `bun install` — install dependencies
- `bun run dev` — start dev server with hot reload (requires 1Password CLI for secrets via `op run`)
- `bun run start` — start production server (also uses `op run`)
- `bun run typecheck` — run TypeScript type checking (`tsc --noEmit`)
- `./scripts/deploy.sh` — deploy to remote server (git pull + docker compose rebuild + health check)

There are no tests or linter configured in this project.

## Architecture

The app is a single Bun HTTP server (port 58431) with two routes:

1. **`GET /health`** — returns `"OK"` for health checks
2. **`POST /webhook/{secret}`** — receives TradingView JSON payloads, validates the URL secret, parses the signal, and sends a formatted Telegram alert

**Request flow:** `server.ts` (HTTP routing + secret validation) → `webhookService.ts` (payload validation + signal parsing) → `telegramService.ts` (message formatting + delivery to all configured chat IDs)

**Config** (`src/config/index.ts`): Fail-fast validation at startup — missing required env vars throw immediately. Imported as a side effect in `index.ts`.

**Secrets management:** Environment variables are resolved at runtime via 1Password CLI (`op run --env-file=.env.tpl`). The `.env.tpl` file maps env var names to 1Password secret references, not actual values.

## Webhook Payload Format

```json
{"symbol": "EURUSD", "signal": "Bullish DB", "price": "1.0950", "tf": "240"}
```

Valid signal values: `Bullish DB`, `Bearish DB`, `Bullish CB`, `Bearish CB`

## Key Conventions

- TypeScript with explicit `.ts` extensions in imports (e.g., `import { config } from './config/index.ts'`)
- ESM modules (`"type": "module"` in package.json)
- Logger uses `[Component]` prefix pattern (e.g., `[Server]`, `[Telegram]`, `[Webhook]`)
- Telegram messages use HTML parse mode
