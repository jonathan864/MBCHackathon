import { fetchPolymarketMarkets } from "@/lib/polymarket";
import type { Intent, Market } from "./types";

export async function runExampleAgentOnce(): Promise<{ intent: Intent; market: Market | null }> {
  const markets = await fetchPolymarketMarkets();

  if (!markets || markets.length === 0) {
    const fallbackIntent: Intent = {
      marketId: "fallback-market",
      side: "YES",
      size: 10,
    };
    return { intent: fallbackIntent, market: null };
  }

  const market = markets[Math.floor(Math.random() * markets.length)];

  const side = market.yesPrice < 0.5 ? "YES" : "NO";
  const size = Math.floor(Math.random() * 100) + 1;

  const intent: Intent = {
    marketId: market.id,
    side,
    size,
  };

  return { intent, market };
}
