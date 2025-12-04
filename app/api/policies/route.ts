import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Policy, Rule } from "@/agent/types";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("policies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const policies: Policy[] = data.map((row) => ({
      id: row.id,
      name: row.name,
      rules: row.rules as Rule[],
    }));

    return NextResponse.json({ policies });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch policies" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, rules } = body;

    if (!name || !rules) {
      return NextResponse.json(
        { error: "Missing required fields: name, rules" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("policies")
      .insert({
        name,
        description: description || "",
        rules,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const policy: Policy = {
      id: data.id,
      name: data.name,
      rules: data.rules as Rule[],
    };

    return NextResponse.json({ policy }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create policy" },
      { status: 500 }
    );
  }
}
