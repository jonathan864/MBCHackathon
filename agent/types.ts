export type Rule =
  | { type: "maxSize"; max: number }
  | { type: "perMarketCap"; max: number }
  | { type: "whitelistMarkets"; allowedIds: string[] }
  | { type: "minLiquidity"; min: number }
  | { type: "allowCategories"; categories: string[] }
  | { type: "maxPrice"; max: number };

export type Policy = {
  id: string;
  name: string;
  rules: Rule[];
};

export type Intent = {
  marketId: string;
  side: "YES" | "NO";
  size: number;
};

export type EvaluationResult = {
  allowed: boolean;
  reason: string;
};

export type EvaluationLog = {
  id: string;
  policyId: string;
  policyName?: string;
  intent: Intent;
  result: EvaluationResult;
  timestamp: string;
  marketQuestion?: string | null;
  marketCategory?: string | null;
};

export type Market = {
  id: string;
  question: string;
  category: string;
  liquidity: number;
  yesPrice: number;
  noPrice: number;
  endsAt: string;
};

export type BacktestResult = {
  marketId: string;
  marketQuestion: string;
  marketCategory: string;
  liquidity: number;
  yesPrice: number;
  noPrice: number;
  allowed: boolean;
  reason: string;
};

export type BacktestSummary = {
  totalMarkets: number;
  allowedCount: number;
  blockedCount: number;
  breakdownByReason: Record<string, number>;
};

export type BacktestResponse = {
  strategyId: string;
  strategyName: string;
  summary: BacktestSummary;
  results: BacktestResult[];
};
