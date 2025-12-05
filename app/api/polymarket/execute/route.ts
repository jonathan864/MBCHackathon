import { NextRequest, NextResponse } from "next/server";
import {
  executePolymarketOrder,
  PolymarketSide,
} from "@/lib/polymarket";
import { TickSize } from "@polymarket/clob-client";

const VALID_TICK_SIZES = ["0.1", "0.01", "0.001", "0.0001"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      tokenId,
      side,
      price,
      size,
      tickSize,
      negRisk,
    } = body ?? {};

    if (
      typeof tokenId !== "string" ||
      !tokenId.trim() ||
      (side !== "BUY" && side !== "SELL") ||
      typeof price !== "number" ||
      typeof size !== "number" ||
      typeof tickSize !== "string" ||
      !VALID_TICK_SIZES.includes(tickSize) ||
      typeof negRisk !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Invalid or missing execution params" },
        { status: 400 }
      );
    }

    const result = await executePolymarketOrder({
      tokenId: tokenId.trim(),
      side: side as PolymarketSide,
      price,
      size,
      tickSize: tickSize as TickSize,
      negRisk,
    });

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("Polymarket execution API error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        ok: false,
        result: {
          executed: false,
          dryRun: false,
          reason: msg,
        },
      },
      { status: 500 }
    );
  }
}
