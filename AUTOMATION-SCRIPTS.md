# Anonymous Esports - Automation Scripts Guide

Complete guide to using and creating automation scripts for the Anonymous Esports platform.

## Overview

Automation scripts streamline development, testing, and deployment processes. This guide covers:

- Built-in npm scripts
- Creating new scripts
- Custom Hardhat tasks
- Deployment automation
- Documentation generation

## Built-in npm Scripts

### Development Scripts

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Watch mode (rerun tests on file changes)
npm run test:watch

# Linting
npm run lint

# Auto-format code
npm run format

# Type checking
npm run type-check
```

### Deployment Scripts

```bash
# Deploy to Sepolia testnet
npm run deploy:testnet

# Deploy to Mainnet
npm run deploy:mainnet

# Verify contract on Etherscan
npm run verify:contract

# Check account balance
npm run check:balance

# Check deployment status
npm run check:deployment
```

### Utility Scripts

```bash
# Clean build artifacts
npm run clean

# Generate gas report
npm run gas-report

# Generate documentation
npm run generate-docs

# Analyze contracts
npm run analyze

# Verify setup
npm run verify:setup
```

## package.json Scripts Configuration

View/edit scripts in `package.json`:

```json
{
  "scripts": {
    "compile": "hardhat compile",
    "test": "hardhat test",
    "test:coverage": "hardhat coverage",
    "test:watch": "hardhat test --watch",
    "lint": "eslint contracts/ test/ src/",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "deploy:testnet": "hardhat run scripts/deploy.ts --network sepolia",
    "deploy:mainnet": "hardhat run scripts/deploy.ts --network mainnet",
    "verify:contract": "hardhat verify --network sepolia",
    "clean": "hardhat clean && rm -rf dist coverage",
    "gas-report": "REPORT_GAS=true hardhat test",
    "analyze": "hardhat run scripts/analyze.ts"
  }
}
```

## Hardhat Custom Tasks

Custom tasks extend Hardhat functionality. Create in `tasks/` directory.

### Creating a Custom Task

Example: `tasks/deployVote.ts`

```typescript
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("deploy-voting", "Deploys voting contract")
    .addParam("network", "Target network")
    .addOptionalParam("owner", "Owner address")
    .setAction(async (args, hre: HardhatRuntimeEnvironment) => {
        const [deployer] = await hre.ethers.getSigners();
        const owner = args.owner || deployer.address;

        console.log(`Deploying voting contract...`);
        console.log(`Owner: ${owner}`);
        console.log(`Network: ${args.network}`);

        // Deployment logic
        const VotingFactory = await hre.ethers.getContractFactory("AnonymousEsports");
        const voting = await VotingFactory.deploy();
        await voting.waitForDeployment();

        const address = await voting.getAddress();
        console.log(`Deployed to: ${address}`);

        return address;
    });

export default {};
```

### Using Custom Tasks

```bash
# List all available tasks
npx hardhat

# Run custom task
npx hardhat deploy-voting --network sepolia --owner 0x...

# Get task help
npx hardhat help deploy-voting
```

## Deployment Automation Scripts

### Main Deploy Script (`scripts/deploy.ts`)

```typescript
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

interface DeploymentConfig {
    network: string;
    timestamp: string;
    contracts: Record<string, string>;
}

async function main() {
    console.log("=== Deployment Script ===\n");

    // Get signer
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying with account: ${deployer.address}`);

    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log(`Network: ${network.name} (Chain ID: ${network.chainId})\n`);

    // Deploy contracts
    const contracts: Record<string, string> = {};

    // Deploy AnonymousEsports
    console.log("Deploying AnonymousEsports...");
    const VotingFactory = await ethers.getContractFactory("AnonymousEsports");
    const voting = await VotingFactory.deploy();
    await voting.waitForDeployment();
    const votingAddress = await voting.getAddress();
    contracts.AnonymousEsports = votingAddress;
    console.log(`✓ Deployed to: ${votingAddress}\n`);

    // Save deployment info
    const deployment: DeploymentConfig = {
        network: network.name,
        timestamp: new Date().toISOString(),
        contracts,
    };

    const deploymentPath = path.join(__dirname, `../deployments/${network.name}.json`);
    fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
    fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));

    console.log(`\nDeployment summary saved to: ${deploymentPath}`);
    console.log(JSON.stringify(deployment, null, 2));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

### Verification Script (`scripts/verify.ts`)

```typescript
import { run } from "hardhat";

async function verifyContract(address: string, constructorArgs: any[] = []) {
    try {
        console.log(`Verifying contract at ${address}...`);

        await run("verify:verify", {
            address: address,
            constructorArguments: constructorArgs,
        });

        console.log("✓ Contract verified successfully");
    } catch (error: any) {
        if (error.message.includes("Already Verified")) {
            console.log("✓ Contract is already verified");
        } else {
            console.error("✗ Verification failed:", error);
            throw error;
        }
    }
}

export default verifyContract;
```

### Utility Scripts

#### Check Balance

```typescript
// scripts/checkBalance.ts
import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(signer.address);

    console.log(`Account: ${signer.address}`);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
}

main().catch(console.error);
```

#### Analyze Contracts

```typescript
// scripts/analyze.ts
import { ethers } from "hardhat";
import fs from "fs";

async function main() {
    const artifacts = fs.readdirSync("./artifacts/contracts");

    console.log("Contract Analysis\n");
    console.log("=".repeat(50));

    for (const file of artifacts) {
        if (!file.endsWith(".sol")) continue;

        const contractName = file.replace(".sol", "");
        const artifactPath = `./artifacts/contracts/${file}/${contractName}.json`;

        if (fs.existsSync(artifactPath)) {
            const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

            console.log(`\n${contractName}`);
            console.log(`- Functions: ${artifact.abi.filter((x: any) => x.type === "function").length}`);
            console.log(`- Bytecode: ${(artifact.bytecode.length / 2 - 1)} bytes`);
            console.log(`- Constructor: ${artifact.abi.some((x: any) => x.type === "constructor") ? "Yes" : "No"}`);
        }
    }
}

main().catch(console.error);
```

## Documentation Generation Scripts

### Auto-generate Documentation

```typescript
// scripts/generateDocs.ts
import fs from "fs";
import path from "path";
import glob from "glob";

function extractJSDoc(code: string): string[] {
    const lines: string[] = [];
    const docRegex = /\/\/\/ @(.*)\n/g;
    let match;

    while ((match = docRegex.exec(code)) !== null) {
        lines.push(`* ${match[1]}`);
    }

    return lines;
}

async function generateDocs() {
    console.log("Generating documentation...\n");

    const contractFiles = glob.sync("contracts/**/*.sol");

    for (const file of contractFiles) {
        const code = fs.readFileSync(file, "utf8");
        const basename = path.basename(file, ".sol");

        const docLines = extractJSDoc(code);

        const markdown = `
# ${basename}

## Overview
Auto-generated documentation

## Functions
${docLines.join("\n")}
`;

        const outputPath = path.join("docs", `${basename}.md`);
        fs.mkdirSync("docs", { recursive: true });
        fs.writeFileSync(outputPath, markdown);

        console.log(`✓ Generated: ${outputPath}`);
    }

    console.log("\n✓ Documentation generation complete");
}

generateDocs().catch(console.error);
```

### Generate GitBook Summary

```typescript
// scripts/generateGitBook.ts
import fs from "fs";
import path from "path";
import glob from "glob";

async function generateSummary() {
    const docFiles = glob.sync("docs/**/*.md");
    const summary = ["# Summary\n"];

    const categories: Record<string, string[]> = {};

    for (const file of docFiles) {
        const basename = path.basename(file, ".md");
        const category = path.dirname(file).split("/").pop() || "root";

        if (!categories[category]) {
            categories[category] = [];
        }

        categories[category].push(`* [${basename}](./${file})`);
    }

    for (const [category, items] of Object.entries(categories)) {
        summary.push(`\n## ${category}\n`);
        summary.push(...items);
    }

    fs.writeFileSync("docs/SUMMARY.md", summary.join("\n"));
    console.log("✓ Generated SUMMARY.md");
}

generateSummary().catch(console.error);
```

## CI/CD Automation

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run compile
      - run: npm run test
      - run: npm run test:coverage
```

Create `.github/workflows/deploy.yml`:

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
      - run: npm ci
      - run: npm run compile
      - run: npm run test
      - name: Deploy
        env:
          PRIVATE_KEY: ${{ secrets.PRIVATE_KEY }}
          SEPOLIA_RPC_URL: ${{ secrets.SEPOLIA_RPC_URL }}
        run: npm run deploy:testnet
```

## Best Practices

### Script Naming
- Use descriptive names: `deploy.ts`, `verify.ts`, `analyze.ts`
- Prefix utilities: `check-balance.ts`, `generate-docs.ts`

### Error Handling
```typescript
main()
    .then(() => {
        console.log("✓ Success");
        process.exit(0);
    })
    .catch((error) => {
        console.error("✗ Error:", error.message);
        process.exit(1);
    });
```

### Logging
```typescript
console.log("=".repeat(50));        // Section header
console.log("Starting process...");  // Step indicator
console.log("✓ Step completed");    // Success marker
console.error("✗ Error occurred");  // Error marker
```

### Configuration
```typescript
const config = {
    networks: {
        sepolia: {
            rpc: process.env.SEPOLIA_RPC_URL,
            chainId: 11155111,
        },
    },
};
```

## Troubleshooting

### Script Fails to Run

```bash
# Check if script exists
ls scripts/

# Run with verbose output
npx hardhat run scripts/deploy.ts --network hardhat --verbose

# Check TypeScript compilation
npx tsc scripts/deploy.ts --noEmit
```

### Environment Variables Not Loaded

```bash
# Check .env file exists
cat .env

# Check environment variables are exported
export PRIVATE_KEY=0x...
npm run deploy:testnet
```

### Task Not Found

```bash
# List available tasks
npx hardhat

# Check tasks are imported in hardhat.config.ts
grep "import" hardhat.config.ts

# Register task explicitly
task("my-task", "Description").setAction(async () => {
    // Implementation
});
```

## Common Patterns

### Multi-Step Deployment

```typescript
async function deploy() {
    const contracts: Record<string, any> = {};

    // Step 1: Deploy contracts
    console.log("Step 1: Deploying contracts...");
    contracts.voting = await deployVoting();
    contracts.access = await deployAccessControl();

    // Step 2: Configure relationships
    console.log("Step 2: Configuring...");
    await contracts.voting.setAccessControl(contracts.access.address);

    // Step 3: Initialize
    console.log("Step 3: Initializing...");
    await contracts.voting.initialize();

    return contracts;
}
```

### Conditional Deployment

```typescript
async function deployIfNeeded() {
    const existing = await checkExistingDeployment();

    if (existing) {
        console.log(`Contract already deployed at: ${existing}`);
        return existing;
    }

    console.log("Deploying new contract...");
    return deployContract();
}
```

### Batch Operations

```typescript
async function deployAll() {
    const contracts = [
        "Contract1",
        "Contract2",
        "Contract3",
    ];

    const deployed = [];

    for (const contractName of contracts) {
        console.log(`Deploying ${contractName}...`);
        const contract = await deployContract(contractName);
        deployed.push(contract);
        console.log(`✓ ${contractName} deployed`);
    }

    return deployed;
}
```

## Resources

### Documentation
- Hardhat: https://hardhat.org/docs
- Ethers.js: https://docs.ethers.org/

### Examples
- Hardhat Examples: https://github.com/nomiclabs/hardhat/tree/main/packages/hardhat-core/sample-projects
- OpenZeppelin Scripts: https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/scripts

---

**Automation makes development faster and more reliable! Use these scripts to streamline your workflow.** 🚀
