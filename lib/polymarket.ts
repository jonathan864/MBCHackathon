import type { Market } from "@/agent/types";
import { MARKETS } from "@/data/markets";

const GAMMA_BASE = "https://gamma-api.polymarket.com";

export async function fetchPolymarketMarkets(): Promise<Market[]> {
  try {
    const res = await fetch(`${GAMMA_BASE}/markets?limit=50&active=true&closed=false`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Gamma /markets returned non-OK status", res.status);
      return MARKETS;
    }

    const raw = await res.json();

    const markets: Market[] = (Array.isArray(raw) ? raw : []).map((m: any): Market => {
      let yesPrice = 0.5;
      let noPrice = 0.5;

      if (m.outcomePrices) {
        try {
          const parsed = JSON.parse(m.outcomePrices);
          if (Array.isArray(parsed) && parsed.length >= 2) {
            yesPrice = Number(parsed[0]) || 0.5;
            noPrice = Number(parsed[1]) || 0.5;
          }
        } catch (e) {
          console.error("Failed to parse outcomePrices", e);
        }
      }

      return {
        id: m.id,
        question: m.question ?? m.slug ?? "Unknown question",
        category: m.category || "General",
        liquidity: m.liquidity ? Number(m.liquidity) || 0 : 0,
        yesPrice,
        noPrice,
        endsAt: m.endDate || new Date().toISOString(),
      };
    });

    const filtered = markets.filter((m) => !!m.id && !!m.question);
    return filtered.length > 0 ? filtered : MARKETS;
  } catch (err) {
    console.error("Error fetching Gamma markets", err);
    return MARKETS;
  }
}
