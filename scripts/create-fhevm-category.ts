/**
 * Create FHEVM Category Repository Generator
 *
 * This script creates a repository with multiple examples from a single category.
 * Categories group related examples (e.g., "basic" contains counter, add, sub examples).
 *
 * Usage: npx ts-node scripts/create-fhevm-category.ts <category> <output-path>
 * Example: npx ts-node scripts/create-fhevm-category.ts basic ./my-basic-examples
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

interface CategoryConfig {
    name: string;
    title: string;
    description: string;
    examples: string[];
}

// Category definitions
const CATEGORIES_MAP: Record<string, CategoryConfig> = {
    basic: {
        name: "basic",
        title: "Basic FHEVM Examples",
        description: "Foundational examples demonstrating core FHE concepts",
        examples: [
            "fhe-counter",
            "encrypt-single-value",
            "user-decrypt-single-value",
            "access-control",
        ],
    },
    advanced: {
        name: "advanced",
        title: "Advanced FHEVM Examples",
        description: "Complex patterns and real-world applications",
        examples: [
            "weighted-voting",
            "blind-auction",
            "tournament",
        ],
    },
    encryption: {
        name: "encryption",
        title: "Encryption & Decryption Examples",
        description: "Deep dive into FHE encryption mechanisms",
        examples: [
            "encrypt-single-value",
            "encrypt-multiple-values",
            "user-decrypt-single-value",
            "user-decrypt-multiple-values",
        ],
    },
    voting: {
        name: "voting",
        title: "Voting & Governance Examples",
        description: "Building voting systems with privacy preservation",
        examples: [
            "fhe-counter",
            "weighted-voting",
            "access-control",
            "blind-auction",
        ],
    },
};

const EXAMPLES_INFO: Record<string, { title: string; description: string }> = {
    "fhe-counter": {
        title: "FHE Counter",
        description: "Basic encrypted counter demonstrating FHE operations",
    },
    "encrypt-single-value": {
        title: "Encrypt Single Value",
        description: "Demonstrates single value encryption and input proofs",
    },
    "encrypt-multiple-values": {
        title: "Encrypt Multiple Values",
        description: "Working with multiple encrypted values",
    },
    "user-decrypt-single-value": {
        title: "User Decrypt Single Value",
        description: "User-initiated decryption of single encrypted value",
    },
    "user-decrypt-multiple-values": {
        title: "User Decrypt Multiple Values",
        description: "User-initiated decryption of multiple encrypted values",
    },
    "weighted-voting": {
        title: "Weighted Voting",
        description: "Voting with reputation-based weights using FHE",
    },
    "access-control": {
        title: "Access Control",
        description: "Role-based access control with FHE permissions",
    },
    "blind-auction": {
        title: "Blind Auction",
        description: "Sealed-bid auction with encrypted bids",
    },
    tournament: {
        title: "Tournament System",
        description: "Multi-round tournament with encrypted scoring",
    },
};

async function createCategoryRepository(categoryName: string, outputPath: string): Promise<void> {
    console.log("========================================");
    console.log("FHEVM Category Repository Generator");
    console.log("========================================\n");

    // Validate category
    const category = CATEGORIES_MAP[categoryName];
    if (!category) {
        console.error(`❌ Category not found: ${categoryName}`);
        console.error("\nAvailable categories:");
        Object.keys(CATEGORIES_MAP).forEach((key) => {
            const cat = CATEGORIES_MAP[key];
            console.error(`  ${key.padEnd(15)} - ${cat.title} (${cat.examples.length} examples)`);
        });
        process.exit(1);
    }

    console.log(`📦 Creating category: ${category.title}`);
    console.log(`📚 Examples: ${category.examples.length}`);
    console.log(`📍 Output directory: ${outputPath}\n`);

    try {
        // Step 1: Create directory structure
        console.log("Step 1: Creating directory structure...");
        fs.mkdirSync(outputPath, { recursive: true });
        console.log("✓ Directory created\n");

        // Step 2: Set up Hardhat template
        console.log("Step 2: Setting up Hardhat template...");
        createHardhatTemplate(outputPath, category);
        console.log("✓ Hardhat template created\n");

        // Step 3: Add all example contracts
        console.log("Step 3: Adding example contracts...");
        for (const exampleName of category.examples) {
            createExampleContract(exampleName, outputPath);
            console.log(`  ✓ ${exampleName}`);
        }
        console.log();

        // Step 4: Create tests for all examples
        console.log("Step 4: Generating tests...");
        for (const exampleName of category.examples) {
            createExampleTest(exampleName, outputPath);
            console.log(`  ✓ ${exampleName}`);
        }
        console.log();

        // Step 5: Generate documentation
        console.log("Step 5: Generating documentation...");
        generateCategoryDocumentation(category, outputPath);
        console.log("✓ Documentation generated\n");

        // Step 6: Create unified deployment script
        console.log("Step 6: Creating deployment script...");
        createCategoryDeploymentScript(category, outputPath);
        console.log("✓ Deployment script created\n");

        // Step 7: Initialize git
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
        console.log("✅ Category repository created successfully!");
        console.log("========================================\n");

        console.log("📋 Next steps:");
        console.log(`1. cd ${outputPath}`);
        console.log("2. npm install");
        console.log("3. npm run compile");
        console.log("4. npm run test");
        console.log("5. npm run deploy:testnet\n");

        console.log("📚 Examples included:");
        category.examples.forEach((example) => {
            const info = EXAMPLES_INFO[example];
            console.log(`  • ${example} - ${info.description}`);
        });
        console.log();

    } catch (error) {
        console.error("❌ Error creating category repository:");
        console.error(error);
        process.exit(1);
    }
}

function createHardhatTemplate(outputPath: string, category: CategoryConfig): void {
    // Create directories
    const dirs = ["contracts", "contracts/examples", "test", "test/examples", "scripts", "docs"];
    for (const dir of dirs) {
        fs.mkdirSync(path.join(outputPath, dir), { recursive: true });
    }

    // Create package.json
    const packageJson = {
        name: `@fhevm/${category.name}-examples`,
        version: "1.0.0",
        description: category.description,
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
        keywords: ["fhevm", "fhe", category.name, "examples"],
        author: "Generated by FHEVM Example Generator",
        license: "MIT",
        dependencies: {
            "@fhevm/solidity": "^0.9.1",
            ethers: "^6.0.0",
        },
        devDependencies: {
            "@types/node": "^18.0.0",
            "@typescript-eslint/eslint-plugin": "^6.0.0",
            "@typescript-eslint/parser": "^6.0.0",
            chai: "^4.3.0",
            eslint: "^8.0.0",
            hardhat: "^2.17.0",
            "hardhat-deploy": "^0.11.0",
            "hardhat-gas-reporter": "^1.0.0",
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
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
        },
        include: ["scripts", "test"],
        exclude: ["node_modules"],
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
    },
};

export default config;
`;

    fs.writeFileSync(path.join(outputPath, "hardhat.config.ts"), hardhatConfig);

    // Create .env.example
    const envExample = `SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=0x...
ETHERSCAN_API_KEY=
REPORT_GAS=true
`;

    fs.writeFileSync(path.join(outputPath, ".env.example"), envExample);

    // Create .gitignore
    fs.writeFileSync(
        path.join(outputPath, ".gitignore"),
        "node_modules/\ndist/\n.hardhat/\ncoverage/\n.env\n.env.local\n*.log\n"
    );
}

function createExampleContract(exampleName: string, outputPath: string): void {
    const info = EXAMPLES_INFO[exampleName] || { title: exampleName, description: "Example" };

    const contractPath = path.join(outputPath, "contracts", "examples", `${exampleName}.sol`);

    const contractContent = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title ${info.title}
/// @notice ${info.description}
/// @dev Example contract demonstrating FHEVM concepts
contract ${exampleName.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("")} is ZamaEthereumConfig {
    // State variables
    // TODO: Add your state variables here

    // Events
    // TODO: Add your events here

    // Functions
    // TODO: Add your functions here
}
`;

    fs.writeFileSync(contractPath, contractContent);
}

function createExampleTest(exampleName: string, outputPath: string): void {
    const info = EXAMPLES_INFO[exampleName] || { title: exampleName };

    const testPath = path.join(outputPath, "test", "examples", `${exampleName}.test.ts`);

    const className = exampleName
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join("");

    const testContent = `import { expect } from "chai";
import { ethers } from "hardhat";

describe("${info.title}", () => {
    let contract: any;
    let owner: any;

    beforeEach(async () => {
        [owner] = await ethers.getSigners();

        const Factory = await ethers.getContractFactory("${className}");
        contract = await Factory.deploy();
        await contract.waitForDeployment();
    });

    describe("Deployment", () => {
        it("should deploy successfully", async () => {
            const address = await contract.getAddress();
            expect(address).to.be.properAddress;
        });
    });

    describe("Functionality", () => {
        it("should work correctly", async () => {
            // Add your tests here
        });
    });
});
`;

    fs.writeFileSync(testPath, testContent);
}

function generateCategoryDocumentation(category: CategoryConfig, outputPath: string): void {
    const docsDir = path.join(outputPath, "docs");
    fs.mkdirSync(docsDir, { recursive: true });

    // Create category README
    const readmePath = path.join(outputPath, "README.md");
    const examplesList = category.examples
        .map((example) => {
            const info = EXAMPLES_INFO[example];
            return `- **${info.title}**: ${info.description}`;
        })
        .join("\n");

    const readmeContent = `# ${category.title}

${category.description}

## Examples Included

${examplesList}

## Quick Start

\`\`\`bash
npm install
npm run compile
npm run test
\`\`\`

## Running Specific Tests

\`\`\`bash
npm test -- test/examples/example-name.test.ts
\`\`\`

## Deployment

\`\`\`bash
npm run deploy:testnet
\`\`\`

## Learning Path

Start with the first example and work your way through in order.

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/)

## License

MIT
`;

    fs.writeFileSync(readmePath, readmeContent);
}

function createCategoryDeploymentScript(category: CategoryConfig, outputPath: string): void {
    const deployPath = path.join(outputPath, "scripts", "deploy.ts");

    const deploymentCode = category.examples
        .map((example) => {
            const className = example
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join("");
            return `
    console.log("Deploying ${example}...");
    const ${className}Factory = await ethers.getContractFactory("${className}");
    const ${example.replace(/-/g, "")} = await ${className}Factory.deploy();
    await ${example.replace(/-/g, "")}.waitForDeployment();
    console.log("✓ ${example} deployed");
`;
        })
        .join("\n");

    const deployContent = `import { ethers } from "hardhat";

async function main() {
    console.log("Deploying ${category.title}...\n");

${deploymentCode}

    console.log("\n✅ All deployments completed!");
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
const categoryName = process.argv[2];
const outputPath = process.argv[3];

if (!categoryName || !outputPath) {
    console.error("Usage: npx ts-node scripts/create-fhevm-category.ts <category> <output-path>");
    console.error("\nAvailable categories:");
    Object.keys(CATEGORIES_MAP).forEach((key) => {
        const category = CATEGORIES_MAP[key];
        console.error(
            `  ${key.padEnd(15)} - ${category.title} (${category.examples.length} examples)`
        );
    });
    process.exit(1);
}

createCategoryRepository(categoryName, outputPath);
