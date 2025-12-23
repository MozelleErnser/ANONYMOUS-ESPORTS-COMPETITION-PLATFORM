# Deployment Examples

Real-world deployment examples for FHEVM applications.

---

## Table of Contents

1. [Local Deployment](#local-deployment)
2. [Testnet Deployment](#testnet-deployment)
3. [Mainnet Deployment](#mainnet-deployment)
4. [Automated Deployment](#automated-deployment)
5. [Verification](#verification)

---

## Local Deployment

### Setup Local Node

```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy to local node
npm run deploy:local
```

### Deploy Script Example

`scripts/deploy.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying to local network...\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy FHECounter
  console.log("Deploying FHECounter...");
  const FHECounter = await ethers.getContractFactory("FHECounter");
  const counter = await FHECounter.deploy();
  await counter.waitForDeployment();
  const counterAddress = await counter.getAddress();
  console.log("FHECounter deployed to:", counterAddress);

  // Deploy ConfidentialERC20
  console.log("\nDeploying ConfidentialERC20...");
  const Token = await ethers.getContractFactory("ConfidentialERC20");
  const token = await Token.deploy("Test Token", "TEST");
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("ConfidentialERC20 deployed to:", tokenAddress);

  // Save deployment info
  const deployment = {
    network: "localhost",
    timestamp: new Date().toISOString(),
    contracts: {
      FHECounter: counterAddress,
      ConfidentialERC20: tokenAddress,
    },
  };

  console.log("\n✅ Deployment complete!");
  console.log(JSON.stringify(deployment, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### Testing Local Deployment

```typescript
// Test deployed contracts
async function testDeployment() {
  const counter = await ethers.getContractAt(
    "FHECounter",
    "0x..."
  );

  // Test counter
  const encryptedValue = "0x01";
  const proof = "0x";

  await counter.increment(encryptedValue, proof);
  console.log("✅ Counter test passed");
}
```

---

## Testnet Deployment

### Setup Environment

Create `.env`:

```env
# Sepolia testnet
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_key
```

### Get Testnet Funds

1. Visit [Sepolia Faucet](https://sepoliafaucet.com/)
2. Enter your wallet address
3. Request test ETH
4. Wait for confirmation

### Deploy to Sepolia

```bash
# Set environment
export SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
export PRIVATE_KEY=your_key
export ETHERSCAN_API_KEY=your_key

# Deploy
npm run deploy:testnet
```

### Testnet Deploy Script

```typescript
async function deployToTestnet() {
  const network = await ethers.provider.getNetwork();
  console.log("Deploying to:", network.name);

  if (network.chainId !== 11155111) {
    throw new Error("Wrong network! Connect to Sepolia");
  }

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.1")) {
    throw new Error("Insufficient funds for deployment");
  }

  // Deploy with gas estimation
  const FHECounter = await ethers.getContractFactory("FHECounter");

  console.log("Estimating gas...");
  const estimatedGas = await ethers.provider.estimateGas(
    FHECounter.getDeployTransaction()
  );
  console.log("Estimated gas:", estimatedGas.toString());

  console.log("Deploying...");
  const counter = await FHECounter.deploy();
  const receipt = await counter.deploymentTransaction()?.wait();

  console.log("✅ Deployed to:", await counter.getAddress());
  console.log("Gas used:", receipt?.gasUsed.toString());

  return counter;
}
```

### Monitor Deployment

```typescript
// Check transaction on block explorer
const txHash = receipt?.transactionHash;
console.log(`View on Sepolia: https://sepolia.etherscan.io/tx/${txHash}`);

// Poll for confirmation
async function waitForDeployment(txHash: string) {
  let retries = 0;
  while (retries < 30) {
    const receipt = await ethers.provider.getTransactionReceipt(txHash);

    if (receipt) {
      console.log("✅ Confirmed!");
      return receipt;
    }

    console.log("Waiting for confirmation... (attempt", retries + 1, ")");
    await new Promise((r) => setTimeout(r, 5000)); // Wait 5 seconds
    retries++;
  }

  throw new Error("Deployment timeout");
}
```

---

## Mainnet Deployment

### ⚠️ Important: Safety Checks

Before mainnet deployment:

```bash
# 1. Verify on testnet first
npm run deploy:testnet

# 2. Run full test suite
npm run test

# 3. Generate coverage report
npm run test:coverage

# 4. Check gas costs
npm run gas-report

# 5. Security audit
npm run security-check
```

### Mainnet Environment Setup

Create `.env.mainnet`:

```env
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_mainnet_key_here
ETHERSCAN_API_KEY=your_etherscan_key

# Set network
NETWORK=mainnet
```

### Mainnet Deployment Script

```typescript
async function deployToMainnet() {
  // Safety checks
  const network = await ethers.provider.getNetwork();

  if (network.chainId !== 1) {
    throw new Error("❌ WRONG NETWORK! This is not mainnet!");
  }

  console.log("\n⚠️  DEPLOYING TO MAINNET ⚠️\n");
  console.log("Waiting 10 seconds... Press Ctrl+C to cancel\n");

  await new Promise((r) => setTimeout(r, 10000));

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.5")) {
    throw new Error("❌ Insufficient funds!");
  }

  // Deploy with confirmation
  const FHECounter = await ethers.getContractFactory("FHECounter");

  console.log("\n📤 Sending transaction to mainnet...");
  const counter = await FHECounter.deploy({
    gasLimit: 3000000,  // Specify gas limit
    gasPrice: await ethers.provider.getGasPrice(),
  });

  const deployTx = counter.deploymentTransaction();
  console.log("Transaction hash:", deployTx?.hash);

  console.log("\n⏳ Waiting for confirmation...");
  const receipt = await deployTx?.wait(3); // Wait for 3 confirmations

  console.log("✅ Deployed!");
  console.log("Address:", await counter.getAddress());
  console.log("Block:", receipt?.blockNumber);

  return counter;
}
```

### Mainnet Monitoring

```typescript
// Monitor deployment
async function monitorDeployment(contractAddress: string) {
  console.log(
    `View on Etherscan: https://etherscan.io/address/${contractAddress}`
  );

  // Poll for transactions
  const interval = setInterval(async () => {
    const code = await ethers.provider.getCode(contractAddress);

    if (code !== "0x") {
      console.log("✅ Contract code verified on mainnet!");
      clearInterval(interval);
    } else {
      console.log("Waiting for contract deployment...");
    }
  }, 10000);
}
```

---

## Automated Deployment

### CI/CD Pipeline Example

`.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm run test

      - name: Check security
        run: npm run security-check

      - name: Deploy to testnet
        if: github.ref == 'refs/heads/main'
        env:
          SEPOLIA_RPC_URL: ${{ secrets.SEPOLIA_RPC_URL }}
          PRIVATE_KEY: ${{ secrets.TESTNET_PRIVATE_KEY }}
        run: npm run deploy:testnet

      - name: Deploy to mainnet
        if: github.event.inputs.deploy_mainnet == 'true'
        env:
          MAINNET_RPC_URL: ${{ secrets.MAINNET_RPC_URL }}
          PRIVATE_KEY: ${{ secrets.MAINNET_PRIVATE_KEY }}
        run: npm run deploy:mainnet
```

---

## Verification

### Verify on Etherscan

```bash
# Flatten contract
npm run flatten

# Verify (Sepolia)
npx hardhat verify \
  --network sepolia \
  0xContractAddress \
  "Constructor arg 1" \
  "Constructor arg 2"

# Verify (Mainnet)
npx hardhat verify \
  --network mainnet \
  0xContractAddress
```

### Automated Verification

```typescript
async function verifyContract(
  contractAddress: string,
  network: string,
  constructorArgs: any[] = []
) {
  console.log(`Verifying ${contractAddress} on ${network}...`);

  try {
    await ethers.provider.waitForBlock(
      (await ethers.provider.getBlockNumber()) + 5
    );

    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArgs,
      network: network,
    });

    console.log("✅ Verification successful!");
  } catch (error) {
    console.error("❌ Verification failed:", error);
  }
}
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] No compiler warnings
- [ ] Security audit completed
- [ ] Gas costs reviewed
- [ ] Documentation updated
- [ ] Testnet deployment successful

### Deployment

- [ ] Correct network selected
- [ ] Deployer has sufficient funds
- [ ] Gas limit specified
- [ ] Environment variables set
- [ ] Backup of private key secured

### Post-Deployment

- [ ] Contract deployed successfully
- [ ] Transaction confirmed
- [ ] Verified on block explorer
- [ ] Documentation updated with address
- [ ] Monitoring enabled

---

## Common Issues

### "Insufficient funds"

**Solution**:
```bash
# Check balance
ethers-cli balance YOUR_ADDRESS

# Get testnet funds from faucet
```

### "Transaction timeout"

**Solution**:
```typescript
// Increase timeout
const tx = await contract.function({
  gasLimit: 5000000,  // Higher gas
});

await tx.wait(5); // Wait for 5 confirmations
```

### "Out of gas"

**Solution**:
```typescript
// Estimate and increase gas
const estimated = await contract.estimateGas.function();
await contract.function({ gasLimit: estimated.mul(120).div(100) });
```

---

## Examples

### Deploy Only FHECounter

```bash
DEPLOY_ONLY=FHECounter npm run deploy:testnet
```

### Deploy with Custom Gas

```bash
GAS_PRICE=50 npm run deploy:testnet
```

### Dry Run (Simulate)

```bash
npm run deploy --dry-run
```

---

**Ready to deploy?** Follow the checklist above! 🚀
