import { ethers } from "hardhat";

async function main() {
  console.log("Deploying AgentSafeWallet...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const AgentSafeWallet = await ethers.getContractFactory("AgentSafeWallet");
  const wallet = await AgentSafeWallet.deploy(
    deployer.address,
    deployer.address
  );

  await wallet.waitForDeployment();

  const address = await wallet.getAddress();
  console.log("AgentSafeWallet deployed to:", address);
  console.log("Owner:", deployer.address);
  console.log("Executor:", deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
