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

// ==================== Polymarket Trading Executor ====================

import { ClobClient, OrderType, Side, TickSize } from "@polymarket/clob-client";
import { Wallet } from "@ethersproject/wallet";
import {
  POLYMARKET_TRADING_ENABLED,
  POLYMARKET_TRADING_DRY_RUN,
  POLYMARKET_HOST,
  POLYMARKET_CHAIN_ID,
  POLYMARKET_FUNDER_ADDRESS,
  POLYMARKET_PRIVATE_KEY,
} from "@/lib/config/polymarketConfig";

if (POLYMARKET_TRADING_ENABLED) {
  if (!POLYMARKET_FUNDER_ADDRESS) {
    console.warn("[Polymarket] FUNDER_ADDRESS missing; trading will fail");
  }
  if (!POLYMARKET_PRIVATE_KEY) {
    console.warn("[Polymarket] PRIVATE_KEY missing; trading will fail");
  }
}

let clobClientPromise: Promise<ClobClient> | null = null;

async function getClobClient(): Promise<ClobClient> {
  if (!POLYMARKET_TRADING_ENABLED) {
    throw new Error("Polymarket trading disabled (POLYMARKET_TRADING_ENABLED!=true)");
  }
  if (!POLYMARKET_PRIVATE_KEY || !POLYMARKET_FUNDER_ADDRESS) {
    throw new Error("Polymarket config missing PRIVATE_KEY or FUNDER_ADDRESS");
  }

  if (!clobClientPromise) {
    const signer = new Wallet(POLYMARKET_PRIVATE_KEY);
    const baseClient = new ClobClient(POLYMARKET_HOST, POLYMARKET_CHAIN_ID, signer);
    const creds = await baseClient.createOrDeriveApiKey();

    const signatureType = 1; // email/Magic-style auth per Polymarket docs

    clobClientPromise = Promise.resolve(
      new ClobClient(
        POLYMARKET_HOST,
        POLYMARKET_CHAIN_ID,
        signer,
        await creds,
        signatureType,
        POLYMARKET_FUNDER_ADDRESS
      )
    );
  }

  return clobClientPromise;
}

export type PolymarketSide = "BUY" | "SELL";

export interface ExecutePolymarketOrderParams {
  tokenId: string;
  side: PolymarketSide;
  price: number;
  size: number;
  tickSize: TickSize;
  negRisk: boolean;
}

export type PolymarketExecutionResult =
  | {
      executed: true;
      dryRun: false;
      orderId: string;
      side: string;
      size: number;
      price: number;
      tokenId: string;
    }
  | {
      executed: false;
      dryRun: true;
      side: string;
      size: number;
      price: number;
      tokenId: string;
      reason: string;
    }
  | {
      executed: false;
      dryRun: false;
      reason: string;
    };

/**
 * Execute a single Polymarket order on the CLOB.
 */
export async function executePolymarketOrder(
  params: ExecutePolymarketOrderParams
): Promise<PolymarketExecutionResult> {
  const { tokenId, side, price, size, tickSize, negRisk } = params;

  // Dry run mode: simulate order without sending
  if (!POLYMARKET_TRADING_ENABLED && POLYMARKET_TRADING_DRY_RUN) {
    console.log("[Polymarket] DRY RUN – would place order:", {
      side,
      size,
      price,
      tokenId,
      tickSize,
      negRisk,
    });

    return {
      executed: false,
      dryRun: true,
      side,
      size,
      price,
      tokenId,
      reason: "Dry run mode – no order sent",
    };
  }

  // Trading disabled and not in dry run mode
  if (!POLYMARKET_TRADING_ENABLED && !POLYMARKET_TRADING_DRY_RUN) {
    return {
      executed: false,
      dryRun: false,
      reason: "Trading disabled",
    };
  }

  // Real trading mode
  try {
    const client = await getClobClient();
    const sideEnum = side === "BUY" ? Side.BUY : Side.SELL;

    console.log("[Polymarket] Executing order", {
      tokenId,
      side,
      price,
      size,
      tickSize,
      negRisk,
    });

    const resp = await client.createAndPostOrder(
      {
        tokenID: tokenId,
        price,
        side: sideEnum,
        size,
      },
      { tickSize, negRisk },
      OrderType.GTC
    );

    console.log("[Polymarket] Order response:", resp);

    return {
      executed: true,
      dryRun: false,
      orderId: resp.orderID || "unknown",
      side,
      size,
      price,
      tokenId,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("[Polymarket] Order execution failed:", errorMessage);

    return {
      executed: false,
      dryRun: false,
      reason: errorMessage,
    };
  }
}
