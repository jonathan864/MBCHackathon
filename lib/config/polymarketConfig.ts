export const POLYMARKET_TRADING_ENABLED =
  process.env.POLYMARKET_TRADING_ENABLED === "true";

export const POLYMARKET_TRADING_DRY_RUN =
  process.env.POLYMARKET_TRADING_DRY_RUN === "true";

export const POLYMARKET_HOST =
  process.env.POLYMARKET_HOST ?? "https://clob.polymarket.com";

export const POLYMARKET_CHAIN_ID = 137; // Polygon mainnet

export const POLYMARKET_FUNDER_ADDRESS = process.env.POLYMARKET_FUNDER_ADDRESS;
export const POLYMARKET_PRIVATE_KEY = process.env.POLYMARKET_PRIVATE_KEY;
export const POLYMARKET_DEMO_TOKEN_ID = process.env.POLYMARKET_DEMO_TOKEN_ID;
