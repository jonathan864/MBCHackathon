import { NextRequest, NextResponse } from "next/server";
import { logEvaluationOnchain } from "@/lib/onchain";
import { executePolymarketOrder } from "@/lib/polymarket";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { strategyId, marketId, allowed, reason } = body;

    if (
      typeof strategyId !== "string" ||
      !strategyId.trim() ||
      typeof marketId !== "string" ||
      !marketId.trim() ||
      typeof allowed !== "boolean" ||
      typeof reason !== "string" ||
      !reason.trim()
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { txHash } = await logEvaluationOnchain({
      strategyId,
      marketId,
      allowed,
      reason,
    });

    // Optional demo Polymarket execution after successful on-chain log.
    // This will only actually run if POLYMARKET_TRADING_ENABLED=true
    // and the required env vars are set.
    try {
      if (allowed === true) {
        const demoTokenId = process.env.POLYMARKET_DEMO_TOKEN_ID;

        // Demo parameters — VERY small size. I'll tune these later.
        const demoTickSize = "0.001";
        const demoNegRisk = false;
        const demoPrice = 0.40;
        const demoSize = 0.1;

        if (demoTokenId && demoTokenId.trim()) {
          await executePolymarketOrder({
            tokenId: demoTokenId.trim(),
            side: "BUY", // later I can map YES/NO status to BUY/SELL
            price: demoPrice,
            size: demoSize,
            tickSize: demoTickSize,
            negRisk: demoNegRisk,
          });
        } else {
          console.log(
            "[Polymarket] Skipping execution – no POLYMARKET_DEMO_TOKEN_ID configured"
          );
        }
      }
    } catch (execErr) {
      console.error(
        "Polymarket execution after on-chain log failed (non-fatal):",
        execErr
      );
    }

    return NextResponse.json({ txHash });
  } catch (err) {
    console.error("Failed to log evaluation onchain (API route):", err);

    const errorMessage = err instanceof Error ? err.message : String(err);

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}