import { ethers } from "hardhat";

async function main() {
  console.log("========================================");
  console.log("Anonymous Esports Platform Deployment");
  console.log("========================================\n");

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}\n`);

  try {
    // Get the network information
    const network = await ethers.provider.getNetwork();
    console.log(`Network: ${network.name} (Chain ID: ${network.chainId})\n`);

    // Deploy AnonymousEsports contract
    console.log("Deploying AnonymousEsports contract...");
    const AnonymousEsportsFactory = await ethers.getContractFactory("AnonymousEsports");
    const anonymousEsports = await AnonymousEsportsFactory.deploy();
    await anonymousEsports.waitForDeployment();
    const esportsAddress = await anonymousEsports.getAddress();
    console.log(`✓ AnonymousEsports deployed to: ${esportsAddress}\n`);

    // Save deployment info
    const deployment = {
      network: network.name,
      chainId: network.chainId,
      anonymousEsports: esportsAddress,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
    };

    console.log("========================================");
    console.log("Deployment Complete!");
    console.log("========================================\n");
    console.log(JSON.stringify(deployment, null, 2));

    // Optional: Verify on block explorer
    if (network.name !== "hardhat" && network.name !== "localhost") {
      console.log("\n📝 To verify the contract on the block explorer:");
      console.log(
        `npm hardhat verify --network ${network.name} ${esportsAddress}`
      );
    }
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
