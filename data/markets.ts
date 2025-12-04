import type { Market } from "@/agent/types";

export const MARKETS: Market[] = [
  {
    id: "election-2024",
    question: "Will Candidate A win the 2024 election?",
    category: "Politics",
    liquidity: 150000,
    yesPrice: 0.62,
    noPrice: 0.38,
    endsAt: "2024-11-05T00:00:00.000Z",
  },
  {
    id: "btc-100k-2025",
    question: "Will BTC be above $100,000 by Dec 31, 2025?",
    category: "Crypto",
    liquidity: 200000,
    yesPrice: 0.30,
    noPrice: 0.70,
    endsAt: "2025-12-31T00:00:00.000Z",
  },
  {
    id: "sports-final",
    question: "Will Team X win the championship this season?",
    category: "Sports",
    liquidity: 80000,
    yesPrice: 0.55,
    noPrice: 0.45,
    endsAt: "2025-06-15T00:00:00.000Z",
  },
  {
    id: "tech-ai-breakthrough",
    question: "Will a major AI breakthrough be announced in 2025?",
    category: "Technology",
    liquidity: 120000,
    yesPrice: 0.48,
    noPrice: 0.52,
    endsAt: "2025-12-31T00:00:00.000Z",
  },
  {
    id: "economy-recession",
    question: "Will the US enter a recession in 2025?",
    category: "Economy",
    liquidity: 180000,
    yesPrice: 0.35,
    noPrice: 0.65,
    endsAt: "2025-12-31T00:00:00.000Z",
  },
];
