import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { runExampleAgentOnce } from "@/agent/exampleAgent";
import { evaluateIntent } from "@/agent/policyEngine";
import { Policy, Rule } from "@/agent/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { strategyId } = body;

    let policyId = strategyId;

    if (!policyId) {
      const { data: defaultPolicy, error: defaultError } = await supabase
        .from("policies")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (defaultError) {
        return NextResponse.json(
          { error: defaultError.message },
          { status: 500 }
        );
      }

      if (!defaultPolicy) {
        return NextResponse.json(
          { error: "No policies found. Please create a policy first." },
          { status: 404 }
        );
      }

      policyId = defaultPolicy.id;
    }

    const { data: policyData, error: policyError } = await supabase
      .from("policies")
      .select("*")
      .eq("id", policyId)
      .maybeSingle();

    if (policyError) {
      return NextResponse.json(
        { error: policyError.message },
        { status: 500 }
      );
    }

    if (!policyData) {
      return NextResponse.json(
        { error: "Policy not found" },
        { status: 404 }
      );
    }

    const policy: Policy = {
      id: policyData.id,
      name: policyData.name,
      rules: policyData.rules as Rule[],
    };

    const { intent, market } = await runExampleAgentOnce();

    const result = evaluateIntent(intent, policy, market);

    const { error: logError } = await supabase
      .from("evaluation_logs")
      .insert({
        policy_id: policy.id,
        intent,
        result,
        timestamp: new Date().toISOString(),
        market_question: market?.question ?? null,
        market_category: market?.category ?? null,
      });

    if (logError) {
      console.error("Failed to log evaluation:", logError);
    }

    return NextResponse.json({
      intent,
      market,
      result,
      policyUsed: policy.name,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to run agent" },
      { status: 500 }
    );
  }
}
