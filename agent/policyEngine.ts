import { Intent, Policy, EvaluationResult, Rule, Market } from "./types";

export function evaluateIntent(
  intent: Intent,
  policy: Policy,
  market?: Market | null
): EvaluationResult {
  for (const rule of policy.rules) {
    const result = evaluateRule(intent, rule, market);
    if (!result.allowed) {
      return result;
    }
  }

  return {
    allowed: true,
    reason: "All rules passed",
  };
}

function evaluateRule(intent: Intent, rule: Rule, market?: Market | null): EvaluationResult {
  switch (rule.type) {
    case "maxSize":
      if (intent.size > rule.max) {
        return {
          allowed: false,
          reason: `Position size ${intent.size} exceeds maximum allowed ${rule.max}`,
        };
      }
      return { allowed: true, reason: "maxSize rule passed" };

    case "perMarketCap":
      if (intent.size > rule.max) {
        return {
          allowed: false,
          reason: `Position size ${intent.size} exceeds per-market cap of ${rule.max}`,
        };
      }
      return { allowed: true, reason: "perMarketCap rule passed" };

    case "whitelistMarkets":
      if (!rule.allowedIds.includes(intent.marketId)) {
        return {
          allowed: false,
          reason: `Market "${intent.marketId}" is not in the whitelist`,
        };
      }
      return { allowed: true, reason: "whitelistMarkets rule passed" };

    case "minLiquidity":
      if (!market) {
        return {
          allowed: false,
          reason: "Market data not available for liquidity check",
        };
      }
      if (market.liquidity < rule.min) {
        return {
          allowed: false,
          reason: "Liquidity too low",
        };
      }
      return { allowed: true, reason: "minLiquidity rule passed" };

    case "allowCategories":
      if (!market) {
        return {
          allowed: false,
          reason: "Market data not available for category check",
        };
      }
      if (!rule.categories.includes(market.category)) {
        return {
          allowed: false,
          reason: "Category not allowed",
        };
      }
      return { allowed: true, reason: "allowCategories rule passed" };

    case "maxPrice":
      if (!market) {
        return {
          allowed: false,
          reason: "Market data not available for price check",
        };
      }
      const priceToCheck = intent.side === "YES" ? market.yesPrice : market.noPrice;
      if (priceToCheck > rule.max) {
        return {
          allowed: false,
          reason: "Price too expensive for this strategy",
        };
      }
      return { allowed: true, reason: "maxPrice rule passed" };

    default:
      return {
        allowed: false,
        reason: "Unknown rule type",
      };
  }
}
