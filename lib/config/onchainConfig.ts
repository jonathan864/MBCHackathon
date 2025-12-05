// lib/config/onchainConfig.ts
import { getAddress } from "viem";

export const BASE_SEPOLIA_CHAIN_ID = 84532;

// This is your AgentGuardLogger contract on Base Sepolia.
// Use all-lowercase here; viem will turn it into the correct checksum form.
const RAW_DEFAULT_LOGGER_ADDRESS = "0xa655b27a7bebc73e588803c239a85d3870df72f8";

function resolveLoggerAddress(): `0x${string}` {
  const raw =
    (process.env.NEXT_PUBLIC_AGENT_GUARD_LOGGER_ADDRESS ||
      RAW_DEFAULT_LOGGER_ADDRESS)
      .trim()
      .toLowerCase();

  // getAddress will:
  // - validate it's 0x + 40 hex chars
  // - return the correct EIP-55 checksummed version
  return getAddress(raw);
}

export const AGENT_GUARD_LOGGER_ADDRESS: `0x${string}` = resolveLoggerAddress();

export const BASE_SEPOLIA_RPC_URL: string =
  process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";