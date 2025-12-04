import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { evaluateIntent } from "@/agent/policyEngine";
import { Intent, Policy, Rule } from "@/agent/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { policyId, intent, market } = body;

    if (!policyId || !intent) {
      return NextResponse.json(
        { error: "Missing required fields: policyId, intent" },
        { status: 400 }
      );
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
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    const policy: Policy = {
      id: policyData.id,
      name: policyData.name,
      rules: policyData.rules as Rule[],
    };

    const result = evaluateIntent(intent as Intent, policy, market);

    const { error: logError } = await supabase
      .from("evaluation_logs")
      .insert({
        policy_id: policyId,
        intent,
        result,
        timestamp: new Date().toISOString(),
      });

    if (logError) {
      console.error("Failed to log evaluation:", logError);
    }

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to evaluate intent" },
      { status: 500 }
    );
  }
}
