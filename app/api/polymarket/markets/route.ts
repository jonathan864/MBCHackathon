import { NextResponse } from "next/server";
import { fetchPolymarketMarkets } from "@/lib/polymarket";

export async function GET() {
  const markets = await fetchPolymarketMarkets();
  return NextResponse.json({ markets });
}
