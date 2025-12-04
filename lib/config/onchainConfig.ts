export const BASE_SEPOLIA_CHAIN_ID = 84532;

function validateAndNormalizeAddress(address: string | undefined, fallback: string): `0x${string}` {
  const addr = (address || fallback).trim();

  if (!addr) {
    throw new Error("Contract address is missing");
  }

  if (!/^0x[0-9a-fA-F]{40}$/.test(addr)) {
    throw new Error(`Invalid contract address format: "${addr}"`);
  }

  return addr as `0x${string}`;
}

export const AGENT_GUARD_LOGGER_ADDRESS = validateAndNormalizeAddress(
  process.env.NEXT_PUBLIC_AGENT_GUARD_LOGGER_ADDRESS,
  "0xA655B27a7BEBc73e588803C239a85d3870dF72f8"
);

export const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
