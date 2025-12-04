import { NextRequest, NextResponse } from "next/server";
import { logEvaluationOnchain } from "@/lib/onchain";

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