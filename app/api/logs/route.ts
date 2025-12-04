import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { EvaluationLog, Intent, EvaluationResult } from "@/agent/types";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("evaluation_logs")
      .select(`
        *,
        policies:policy_id (
          name
        )
      `)
      .order("timestamp", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const logs: EvaluationLog[] = data.map((row) => ({
      id: row.id,
      policyId: row.policy_id,
      policyName: row.policies?.name || "Unknown Strategy",
      intent: row.intent as Intent,
      result: row.result as EvaluationResult,
      timestamp: row.timestamp,
      marketQuestion: row.market_question ?? null,
      marketCategory: row.market_category ?? null,
    }));

    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
