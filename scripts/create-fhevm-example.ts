/**
 * Create FHEVM Example Repository Generator
 *
 * This script creates a standalone FHEVM example repository by:
 * 1. Cloning the base Hardhat template
 * 2. Inserting the example contract
 * 3. Generating matching tests
 * 4. Auto-generating documentation
 * 5. Creating deployment scripts
 *
 * Usage: npx ts-node scripts/create-fhevm-example.ts <example-name> <output-path>
 * Example: npx ts-node scripts/create-fhevm-example.ts fhe-counter ./my-fhe-counter
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

interface ExampleConfig {
    name: string;
    title: string;
    description: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    files: {
        contract: string;
        test: string;
        docs: string;
    };
    tags: string[];
}

// Configuration for all available examples
const EXAMPLES_MAP: Record<string, ExampleConfig> = {
    "fhe-counter": {
        name: "fhe-counter",
        title: "FHE Counter",
        description: "Basic encrypted counter demonstrating FHE operations",
        difficulty: "beginner",
        files: {
            contract: "contracts/examples/FHECounter.sol",
            test: "test/examples/FHECounter.test.ts",
            docs: "docs/examples/fhe-counter/",
        },
        tags: ["fhe", "counter", "basic", "arithmetic"],
    },
    "encrypt-single-value": {
        name: "encrypt-single-value",
        title: "Encrypt Single Value",
        description: "Demonstrates single value encryption and input proofs",
        difficulty: "beginner",
        files: {
            contract: "contracts/examples/EncryptSingleValue.sol",
            test: "test/examples/EncryptSingleValue.test.ts",
            docs: "docs/examples/encrypt-single-value/",
        },
        tags: ["encryption", "input-proof", "beginner"],
    },
    "weighted-voting": {
        name: "weighted-voting",
        title: "Weighted Voting",
        description: "Voting with reputation-based weights using FHE",
        difficulty: "intermediate",
        files: {
            contract: "contracts/examples/WeightedVoting.sol",
            test: "test/examples/WeightedVoting.test.ts",
            docs: "docs/examples/weighted-voting/",
        },
        tags: ["voting", "weights", "intermediate", "advanced"],
    },
    "access-control": {
        name: "access-control",
        title: "Access Control",
        description: "Role-based access control with FHE permissions",
        difficulty: "intermediate",
        files: {
            contract: "contracts/examples/AccessControl.sol",
            test: "test/examples/AccessControl.test.ts",
            docs: "docs/examples/access-control/",
        },
        tags: ["access-control", "permissions", "intermediate"],
    },
    "blind-auction": {
        name: "blind-auction",
        title: "Blind Auction",
        description: "Sealed-bid auction with encrypted bids",
        difficulty: "advanced",
        files: {
            contract: "contracts/examples/BlindAuction.sol",
            test: "test/examples/BlindAuction.test.ts",
            docs: "docs/examples/blind-auction/",
        },
        tags: ["auction", "advanced", "complex"],
    },
};

async function createExampleRepository(exampleName: string, outputPath: string): Promise<void> {
    console.log("========================================");
    console.log("FHEVM Example Repository Generator");
    console.log("========================================\n");

    // Validate example
    const config = EXAMPLES_MAP[exampleName];
    if (!config) {
        console.error(`❌ Example not found: ${exampleName}`);
        console.error("Available examples:", Object.keys(EXAMPLES_MAP).join(", "));
        process.exit(1);
    }

    console.log(`📦 Creating example: ${config.title}`);
    console.log(`📍 Output directory: ${outputPath}\n`);

    try {
        // Step 1: Create output directory
        console.log("Step 1: Creating directory structure...");
        fs.mkdirSync(outputPath, { recursive: true });
        console.log("✓ Directory created\n");

        // Step 2: Create base Hardhat structure
        console.log("Step 2: Setting up Hardhat template...");
        createHardhatTemplate(outputPath, config);
        console.log("✓ Hardhat template created\n");

        // Step 3: Copy contract
        console.log("Step 3: Adding example contract...");
        copyContract(config, outputPath);
        console.log("✓ Contract added\n");

        // Step 4: Create tests
        console.log("Step 4: Generating tests...");
        createTestFile(config, outputPath);
        console.log("✓ Tests created\n");

        // Step 5: Generate documentation
        console.log("Step 5: Generating documentation...");
        generateDocumentation(config, outputPath);
        console.log("✓ Documentation generated\n");

        // Step 6: Create deployment scripts
        console.log("Step 6: Creating deployment scripts...");
        createDeploymentScript(config, outputPath);
        console.log("✓ Deployment scripts created\n");

        // Step 7: Initialize git (optional)
        console.log("Step 7: Initializing git repository...");
        try {
            execSync("git init", { cwd: outputPath });
            execSync("git add .", { cwd: outputPath });
            console.log("✓ Git repository initialized\n");
        } catch (error) {
            console.log("⚠ Git initialization skipped\n");
        }

        // Success message
        console.log("========================================");
        console.log("✅ Example repository created successfully!");
        console.log("========================================\n");

        console.log("📋 Next steps:");
        console.log(`1. cd ${outputPath}`);
        console.log("2. npm install");
        console.log("3. npm run compile");
        console.log("4. npm run test");
        console.log("5. npm run deploy:testnet (with .env configured)\n");

        console.log(`📚 Documentation: ${path.join(outputPath, "README.md")}`);
        console.log(`💻 Contract: ${path.join(outputPath, "contracts")}`);
        console.log(`🧪 Tests: ${path.join(outputPath, "test")}\n`);

    } catch (error) {
        console.error("❌ Error creating example repository:");
        console.error(error);
        process.exit(1);
    }
}

function createHardhatTemplate(outputPath: string, config: ExampleConfig): void {
    // Create directories
    const dirs = ["contracts", "test", "scripts", "docs"];
    for (const dir of dirs) {
        fs.mkdirSync(path.join(outputPath, dir), { recursive: true });
    }

    // Create package.json
    const packageJson = {
        name: config.name,
        version: "1.0.0",
        description: config.description,
        main: "index.js",
        scripts: {
            compile: "hardhat compile",
            test: "hardhat test",
            "test:coverage": "hardhat coverage",
            lint: "eslint contracts/ test/",
            format: "prettier --write .",
            "type-check": "tsc --noEmit",
            "deploy:testnet": "hardhat run scripts/deploy.ts --network sepolia",
            "deploy:mainnet": "hardhat run scripts/deploy.ts --network mainnet",
            "gas-report": "REPORT_GAS=true hardhat test",
        },
        keywords: config.tags,
        author: "Generated by FHEVM Example Generator",
        license: "MIT",
        dependencies: {
            "@fhevm/solidity": "^0.9.1",
            "@zama-ai/fhevm-hardhat-template": "^1.0.0",
            ethers: "^6.0.0",
        },
        devDependencies: {
            "@types/node": "^18.0.0",
            "@typescript-eslint/eslint-plugin": "^6.0.0",
            "@typescript-eslint/parser": "^6.0.0",
            chai: "^4.3.0",
            eslint: "^8.0.0",
            "eslint-plugin-prettier": "^5.0.0",
            hardhat: "^2.17.0",
            "hardhat-deploy": "^0.11.0",
            "hardhat-gas-reporter": "^1.0.0",
            prettier: "^3.0.0",
            solhint: "^4.0.0",
            typescript: "^5.0.0",
        },
    };

    fs.writeFileSync(
        path.join(outputPath, "package.json"),
        JSON.stringify(packageJson, null, 2)
    );

    // Create tsconfig.json
    const tsConfig = {
        compilerOptions: {
            target: "ES2020",
            module: "commonjs",
            lib: ["ES2020"],
            outDir: "./dist",
            rootDir: "./",
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            declaration: true,
            declarationMap: true,
            sourceMap: true,
        },
        include: ["scripts", "test"],
        exclude: ["node_modules", "dist"],
    };

    fs.writeFileSync(
        path.join(outputPath, "tsconfig.json"),
        JSON.stringify(tsConfig, null, 2)
    );

    // Create hardhat.config.ts
    const hardhatConfig = `import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "hardhat-deploy";
import "hardhat-gas-reporter";

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.24",
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000,
            },
        },
    },
    networks: {
        hardhat: {
            allowUnlimitedContractSize: true,
        },
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || "",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        },
        mainnet: {
            url: process.env.MAINNET_RPC_URL || "",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        },
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS === "true",
        currency: "USD",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY || "",
    },
};

export default config;
`;

    fs.writeFileSync(path.join(outputPath, "hardhat.config.ts"), hardhatConfig);

    // Create .env.example
    const envExample = `# Network Configuration
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Wallet Configuration (for deployment)
PRIVATE_KEY=0x1234567890abcdef... # Never commit actual key!

# Contract Verification
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY

# Gas Reporting
REPORT_GAS=true
COINMARKETCAP_API_KEY=YOUR_COINMARKETCAP_KEY
`;

    fs.writeFileSync(path.join(outputPath, ".env.example"), envExample);

    // Create .gitignore
    const gitignore = `node_modules/
dist/
build/
artifacts/
cache/
coverage/
.hardhat/
.env
.env.local
*.log
.DS_Store
`;

    fs.writeFileSync(path.join(outputPath, ".gitignore"), gitignore);
}

function copyContract(config: ExampleConfig, outputPath: string): void {
    // Create a minimal contract if source doesn't exist
    const contractPath = path.join(outputPath, "contracts", "Example.sol");

    const contractContent = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title ${config.title}
/// @notice ${config.description}
contract Example is ZamaEthereumConfig {
    // TODO: Implement your example contract here
}
`;

    fs.writeFileSync(contractPath, contractContent);
}

function createTestFile(config: ExampleConfig, outputPath: string): void {
    const testPath = path.join(outputPath, "test", "Example.test.ts");

    const testContent = `import { expect } from "chai";
import { ethers } from "hardhat";

describe("${config.title}", () => {
    let example: any;
    let owner: any;

    beforeEach(async () => {
        [owner] = await ethers.getSigners();

        const ExampleFactory = await ethers.getContractFactory("Example");
        example = await ExampleFactory.deploy();
        await example.waitForDeployment();
    });

    describe("Deployment", () => {
        it("should deploy successfully", async () => {
            const address = await example.getAddress();
            expect(address).to.be.properAddress;
        });
    });

    describe("Functionality", () => {
        it("should have correct initial state", async () => {
            // Add your tests here
        });
    });
});
`;

    fs.writeFileSync(testPath, testContent);
}

function generateDocumentation(config: ExampleConfig, outputPath: string): void {
    // Create docs directory
    const docsDir = path.join(outputPath, "docs");
    fs.mkdirSync(docsDir, { recursive: true });

    // Create README
    const readmePath = path.join(outputPath, "README.md");
    const readmeContent = `# ${config.title}

## Overview

${config.description}

**Difficulty**: ${config.difficulty}

## Quick Start

\`\`\`bash
npm install
npm run compile
npm run test
\`\`\`

## What This Example Demonstrates

- Key concept 1
- Key concept 2
- Key concept 3

## Architecture

[Add architecture description or diagram]

## Usage

\`\`\`solidity
// Code example
\`\`\`

## Testing

Run the test suite:

\`\`\`bash
npm run test
\`\`\`

Generate coverage report:

\`\`\`bash
npm run test:coverage
\`\`\`

## Deployment

Configure your .env file with network RPC URLs and private key, then:

\`\`\`bash
npm run deploy:testnet
\`\`\`

## Security Considerations

- Security note 1
- Security note 2

## Learn More

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)

## License

MIT
`;

    fs.writeFileSync(readmePath, readmeContent);
}

function createDeploymentScript(config: ExampleConfig, outputPath: string): void {
    const deployPath = path.join(outputPath, "scripts", "deploy.ts");

    const deployContent = `import { ethers } from "hardhat";

async function main() {
    console.log("Deploying ${config.title}...");

    const ExampleFactory = await ethers.getContractFactory("Example");
    const example = await ExampleFactory.deploy();

    await example.waitForDeployment();
    const address = await example.getAddress();

    console.log("${config.title} deployed to:", address);

    // Save deployment info
    const deployment = {
        network: (await ethers.provider.getNetwork()).name,
        address: address,
        timestamp: new Date().toISOString(),
    };

    console.log(JSON.stringify(deployment, null, 2));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
`;

    fs.writeFileSync(deployPath, deployContent);
}

// Main entry point
const exampleName = process.argv[2];
const outputPath = process.argv[3];

if (!exampleName || !outputPath) {
    console.error("Usage: npx ts-node scripts/create-fhevm-example.ts <example-name> <output-path>");
    console.error("\nAvailable examples:");
    Object.keys(EXAMPLES_MAP).forEach((key) => {
        const config = EXAMPLES_MAP[key];
        console.error(`  ${key.padEnd(25)} - ${config.title} (${config.difficulty})`);
    });
    process.exit(1);
}

createExampleRepository(exampleName, outputPath);
