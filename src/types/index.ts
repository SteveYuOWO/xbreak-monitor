// TradingView webhook payload
export interface WebhookPayload {
  symbol: string       // e.g. "EURUSD"
  signal: string       // e.g. "Bullish DB", "Bearish CB"
  price: string        // e.g. "1.0950"
  tf: string           // e.g. "240"
}

// Domain types
export type SignalType = 'CB' | 'DB'
export type SignalDirection = 'BULL' | 'BEAR'

export interface Signal {
  type: SignalType
  direction: SignalDirection
  instrument: string
  price: number
  timeframe: string
}
