import { createWalletClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import {
  AGENT_GUARD_LOGGER_ADDRESS,
  BASE_SEPOLIA_RPC_URL,
} from "./config/onchainConfig";

export const agentGuardLoggerAddress = AGENT_GUARD_LOGGER_ADDRESS;

export const agentGuardLoggerAbi = [
  [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "caller",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "strategyId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "marketId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "allowed",
				"type": "bool"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "reason",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "EvaluationLogged",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "strategyId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "marketId",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "allowed",
				"type": "bool"
			},
			{
				"internalType": "string",
				"name": "reason",
				"type": "string"
			}
		],
		"name": "logEvaluation",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]
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
    console.log("Contract address being used:", agentGuardLoggerAddress);

    const txHash = await walletClient.writeContract({
      address: agentGuardLoggerAddress,
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
