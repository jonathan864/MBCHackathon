import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    baseSepolia: {
      type: "http" as const,
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.AGENT_GUARD_PRIVATE_KEY ? [process.env.AGENT_GUARD_PRIVATE_KEY] : [],
    },
  },
};

export default config;
