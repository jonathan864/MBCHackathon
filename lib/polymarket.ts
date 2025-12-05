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

const POLY_HOST =
  process.env.POLYMARKET_HOST ?? "https://clob.polymarket.com";
const POLY_CHAIN_ID = 137; // Polygon mainnet

const TRADING_ENABLED =
  process.env.POLYMARKET_TRADING_ENABLED === "true";

const FUNDER_ADDRESS = process.env.POLYMARKET_FUNDER_ADDRESS;
const PRIVATE_KEY = process.env.POLYMARKET_PRIVATE_KEY;

if (TRADING_ENABLED) {
  if (!FUNDER_ADDRESS) {
    console.warn("[Polymarket] FUNDER_ADDRESS missing; trading will fail");
  }
  if (!PRIVATE_KEY) {
    console.warn("[Polymarket] PRIVATE_KEY missing; trading will fail");
  }
}

let clobClientPromise: Promise<ClobClient> | null = null;

async function getClobClient(): Promise<ClobClient> {
  if (!TRADING_ENABLED) {
    throw new Error("Polymarket trading disabled (POLYMARKET_TRADING_ENABLED!=true)");
  }
  if (!PRIVATE_KEY || !FUNDER_ADDRESS) {
    throw new Error("Polymarket config missing PRIVATE_KEY or FUNDER_ADDRESS");
  }

  if (!clobClientPromise) {
    const signer = new Wallet(PRIVATE_KEY);
    const baseClient = new ClobClient(POLY_HOST, POLY_CHAIN_ID, signer);
    const creds = await baseClient.createOrDeriveApiKey();

    const signatureType = 1; // email/Magic-style auth per Polymarket docs

    clobClientPromise = Promise.resolve(
      new ClobClient(
        POLY_HOST,
        POLY_CHAIN_ID,
        signer,
        await creds,
        signatureType,
        FUNDER_ADDRESS
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

/**
 * Execute a single Polymarket order on the CLOB.
 */
export async function executePolymarketOrder(
  params: ExecutePolymarketOrderParams
) {
  const client = await getClobClient();

  const sideEnum = params.side === "BUY" ? Side.BUY : Side.SELL;

  console.log("[Polymarket] Executing order", {
    tokenId: params.tokenId,
    side: params.side,
    price: params.price,
    size: params.size,
    tickSize: params.tickSize,
    negRisk: params.negRisk,
  });

  const resp = await client.createAndPostOrder(
    {
      tokenID: params.tokenId,
      price: params.price,
      side: sideEnum,
      size: params.size,
    },
    { tickSize: params.tickSize, negRisk: params.negRisk },
    OrderType.GTC
  );

  console.log("[Polymarket] Order response:", resp);
  return resp;
}
