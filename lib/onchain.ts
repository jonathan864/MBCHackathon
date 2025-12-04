import { createWalletClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import {
  AGENT_GUARD_LOGGER_ADDRESS,
  BASE_SEPOLIA_RPC_URL,
} from "./config/onchainConfig";

export const agentGuardLoggerAddress = AGENT_GUARD_LOGGER_ADDRESS;

export const agentGuardLoggerAbi = [
  {
    type: "event",
    name: "EvaluationLogged",
    inputs: [
      { name: "caller", type: "address", indexed: true },
      { name: "strategyId", type: "string", indexed: false },
      { name: "marketId", type: "string", indexed: false },
      { name: "allowed", type: "bool", indexed: false },
      { name: "reason", type: "string", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "logEvaluation",
    inputs: [
      { name: "strategyId", type: "string" },
      { name: "marketId", type: "string" },
      { name: "allowed", type: "bool" },
      { name: "reason", type: "string" },
    ],
  },
] as const;

function getWalletClient() {
  const rpcUrl = BASE_SEPOLIA_RPC_URL;
  const privateKey = "5ee91e6af2252535862fd1d8daedafc0dcc091f89a181d93556bc371bc85d5a9";

  const normalizedPrivateKey = privateKey.startsWith("0x")
    ? (privateKey as `0x${string}`)
    : (`0x${privateKey}` as `0x${string}`);

  const account = privateKeyToAccount(normalizedPrivateKey);

  return createWalletClient({
    chain: baseSepolia,
    transport: http(rpcUrl),
    account,
  });
}

export async function logEvaluationOnchain(params: {
  strategyId: string;
  marketId: string;
  allowed: boolean;
  reason: string;
}): Promise<{ txHash: `0x${string}` }> {
  try {
    const walletClient = getWalletClient();

    console.log("AgentGuard logger wallet address:", walletClient.account?.address);

    // 🔍 Debug the address at runtime
    console.log("AG logger address (raw):", agentGuardLoggerAddress);
    console.log("Type:", typeof agentGuardLoggerAddress);

    if (typeof agentGuardLoggerAddress !== "string") {
      throw new Error(
        "Onchain logging failed: agentGuardLoggerAddress is not a string at runtime"
      );
    }

    const trimmed = agentGuardLoggerAddress.trim();
    console.log("Trimmed address:", trimmed, "length:", trimmed.length);

    const isValidFormat = /^0x[0-9a-fA-F]{40}$/.test(trimmed);
    console.log("Regex valid?", isValidFormat);

    if (!isValidFormat) {
      throw new Error(
        `Onchain logging failed: contract address has bad format: "${trimmed}"`
      );
    }

    const txHash = await walletClient.writeContract({
      address: trimmed as `0x${string}`,
      abi: agentGuardLoggerAbi,
      functionName: "logEvaluation",
      args: [params.strategyId, params.marketId, params.allowed, params.reason],
    });

    console.log("Onchain evaluation logged:", {
      txHash,
      strategyId: params.strategyId,
      marketId: params.marketId,
      allowed: params.allowed,
    });

    return { txHash };
} catch (err) {
  console.error("logEvaluationOnchain error (raw):", err);

  const errorMessage = err instanceof Error ? err.message : String(err);
  const lowerErrorMessage = errorMessage.toLowerCase();

  if (lowerErrorMessage.includes("insufficient funds") || lowerErrorMessage.includes("gas")) {
    throw new Error("Onchain logging failed: insufficient funds on the logging wallet");
  }

  if (lowerErrorMessage.includes("invalid private key") || lowerErrorMessage.includes("bad key")) {
    throw new Error("Onchain logging failed: private key is invalid");
  }

  // Fallback – include original message so we can see it in the API response
  throw new Error("Onchain logging failed (raw): " + errorMessage);
  }
}
