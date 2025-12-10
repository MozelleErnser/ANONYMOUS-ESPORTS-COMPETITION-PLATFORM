import { ethers } from "hardhat";

async function main() {
    console.log("Deploying Example contract...");

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", await deployer.getAddress());

    // Get account balance
    const balance = await ethers.provider.getBalance(await deployer.getAddress());
    console.log("Account balance:", ethers.formatEther(balance), "ETH");

    // Deploy the contract
    const Example = await ethers.getContractFactory("Example");
    const example = await Example.deploy();

    await example.waitForDeployment();

    const address = await example.getAddress();
    console.log("Example deployed to:", address);

    // Wait for a few block confirmations
    console.log("Waiting for block confirmations...");
    await example.deploymentTransaction()?.wait(5);
    console.log("Confirmed!");

    // Output deployment info
    console.log("\n=== Deployment Summary ===");
    console.log("Contract Address:", address);
    console.log("Network:", (await ethers.provider.getNetwork()).name);
    console.log("Deployer:", await deployer.getAddress());
    console.log("==========================\n");

    // Instructions for verification
    console.log("To verify the contract on Etherscan, run:");
    console.log(`npx hardhat verify --network ${(await ethers.provider.getNetwork()).name} ${address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
