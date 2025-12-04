import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { fetchPolymarketMarkets } from "@/lib/polymarket";
import { evaluateIntent } from "@/agent/policyEngine";
import { Policy, Rule, Intent, BacktestResult, BacktestSummary } from "@/agent/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { strategyId } = body;

    if (!strategyId) {
      return NextResponse.json(
        { error: "strategyId is required" },
        { status: 400 }
      );
    }

    const { data: policyData, error: policyError } = await supabase
      .from("policies")
      .select("*")
      .eq("id", strategyId)
      .maybeSingle();

    if (policyError) {
      return NextResponse.json(
        { error: policyError.message },
        { status: 500 }
      );
    }

    if (!policyData) {
      return NextResponse.json(
        { error: "Strategy not found" },
        { status: 404 }
      );
    }

    const policy: Policy = {
      id: policyData.id,
      name: policyData.name,
      rules: policyData.rules as Rule[],
    };

    const markets = await fetchPolymarketMarkets();

    const results: BacktestResult[] = [];
    const breakdownByReason: Record<string, number> = {};

    for (const market of markets) {
      const intent: Intent = {
        marketId: market.id,
        side: "YES",
        size: 50,
      };

      const evaluation = evaluateIntent(intent, policy, market);

      results.push({
        marketId: market.id,
        marketQuestion: market.question,
        marketCategory: market.category,
        liquidity: market.liquidity,
        yesPrice: market.yesPrice,
        noPrice: market.noPrice,
        allowed: evaluation.allowed,
        reason: evaluation.reason,
      });

      if (!evaluation.allowed) {
        breakdownByReason[evaluation.reason] = (breakdownByReason[evaluation.reason] || 0) + 1;
      }
    }

    const allowedCount = results.filter((r) => r.allowed).length;
    const blockedCount = results.filter((r) => !r.allowed).length;

    const summary: BacktestSummary = {
      totalMarkets: markets.length,
      allowedCount,
      blockedCount,
      breakdownByReason,
    };

    return NextResponse.json({
      strategyId: policy.id,
      strategyName: policy.name,
      summary,
      results,
    });
  } catch (error) {
    console.error("Backtest error:", error);
    return NextResponse.json(
      { error: "Failed to run backtest" },
      { status: 500 }
    );
  }
}
