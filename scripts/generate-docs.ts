/**
 * Documentation Generator for FHEVM Examples
 *
 * Automatically generates GitBook-compatible documentation from code annotations.
 * Extracts JSDoc/TSDoc comments and creates markdown files.
 *
 * Usage: npx ts-node scripts/generate-docs.ts [example-name]
 * Examples:
 *   - npx ts-node scripts/generate-docs.ts fhe-counter    # Single example
 *   - npx ts-node scripts/generate-docs.ts --all          # All examples
 */

import fs from "fs";
import path from "path";
import glob from "glob";

interface ExampleConfig {
    name: string;
    title: string;
    description: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    contractPath: string;
    testPath: string;
}

const EXAMPLES_CONFIG: ExampleConfig[] = [
    {
        name: "fhe-counter",
        title: "FHE Counter",
        description: "Basic encrypted counter demonstrating FHE operations",
        difficulty: "beginner",
        contractPath: "contracts/examples/FHECounter.sol",
        testPath: "test/examples/FHECounter.test.ts",
    },
    {
        name: "encrypt-single-value",
        title: "Encrypt Single Value",
        description: "Demonstrates single value encryption and input proofs",
        difficulty: "beginner",
        contractPath: "contracts/examples/EncryptSingleValue.sol",
        testPath: "test/examples/EncryptSingleValue.test.ts",
    },
    {
        name: "weighted-voting",
        title: "Weighted Voting",
        description: "Voting with reputation-based weights using FHE",
        difficulty: "intermediate",
        contractPath: "contracts/examples/WeightedVoting.sol",
        testPath: "test/examples/WeightedVoting.test.ts",
    },
    {
        name: "access-control",
        title: "Access Control",
        description: "Role-based access control with FHE permissions",
        difficulty: "intermediate",
        contractPath: "contracts/examples/AccessControl.sol",
        testPath: "test/examples/AccessControl.test.ts",
    },
    {
        name: "blind-auction",
        title: "Blind Auction",
        description: "Sealed-bid auction with encrypted bids",
        difficulty: "advanced",
        contractPath: "contracts/examples/BlindAuction.sol",
        testPath: "test/examples/BlindAuction.test.ts",
    },
];

function extractJSDocComments(code: string): Map<string, string> {
    const comments = new Map<string, string>();

    // Regex for JSDoc/TSDoc comments
    const jsDocRegex = /\/\*\*([\s\S]*?)\*\//g;
    let match;

    while ((match = jsDocRegex.exec(code)) !== null) {
        const commentBlock = match[1];
        // Extract function/variable name following the comment
        const nextMatch = code.substring(match.index + match[0].length).match(/^\s*(function|const|let|interface|class|async function)\s+(\w+)/);

        if (nextMatch) {
            const name = nextMatch[2];
            comments.set(name, commentBlock.trim());
        }
    }

    return comments;
}

function extractSolidityDocs(code: string): Map<string, string> {
    const docs = new Map<string, string>();

    // Regex for Solidity comments (///)
    const solidityDocRegex = /\/\/\/ (.*?)(?=\n(?:\/\/\/|function|event|constructor|modifier))/gs;
    let match;

    while ((match = solidityDocRegex.exec(code)) !== null) {
        const docText = match[1].trim();
        // Extract function/event name
        const nextMatch = code.substring(match.index + match[0].length).match(/^\s*(function|event|constructor|modifier|contract)\s+(\w+)/);

        if (nextMatch) {
            const name = nextMatch[2];
            docs.set(name, docText);
        }
    }

    return docs;
}

function generateExampleDocumentation(config: ExampleConfig): void {
    console.log(`📝 Generating documentation for: ${config.title}`);

    // Create output directory
    const outputDir = path.join("docs", "examples", config.name);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Read contract and test files
    let contractCode = "";
    let testCode = "";

    if (fs.existsSync(config.contractPath)) {
        contractCode = fs.readFileSync(config.contractPath, "utf8");
    }

    if (fs.existsSync(config.testPath)) {
        testCode = fs.readFileSync(config.testPath, "utf8");
    }

    // Extract documentation
    const solidityDocs = extractSolidityDocs(contractCode);
    const tsDocs = extractJSDocComments(testCode);

    // Generate overview.md
    generateOverviewDoc(config, outputDir, solidityDocs);

    // Generate usage.md
    generateUsageDoc(config, outputDir, contractCode);

    // Generate api.md
    generateAPIDoc(config, outputDir, solidityDocs);

    // Generate security.md
    generateSecurityDoc(config, outputDir);

    console.log(`  ✓ Generated docs in ${outputDir}\n`);
}

function generateOverviewDoc(
    config: ExampleConfig,
    outputDir: string,
    docs: Map<string, string>
): void {
    const content = `# ${config.title}

## What Does This Demonstrate?

${config.description}

**Difficulty Level**: ${config.difficulty}

## Why Is This Important?

[Add explanation of real-world use case]

## Key Concepts

- Concept 1
- Concept 2
- Concept 3

## How It Works

[Add technical explanation]

## Architecture

\`\`\`
┌─────────────────────┐
│  Smart Contract     │
├─────────────────────┤
│  FHE Operations     │
└─────────────────────┘
\`\`\`

## Next Steps

1. Read the [Usage Guide](./usage.md)
2. Check the [API Reference](./api.md)
3. Review [Security Considerations](./security.md)

## See Also

- Related examples
- Linked documentation
`;

    fs.writeFileSync(path.join(outputDir, "overview.md"), content);
}

function generateUsageDoc(config: ExampleConfig, outputDir: string, contractCode: string): void {
    const content = `# How to Use ${config.title}

## Installation

\`\`\`bash
npm install
npm run compile
\`\`\`

## Quick Start

\`\`\`typescript
// Import and deploy
const Contract = await ethers.getContractFactory("${extractContractName(contractCode)}");
const contract = await Contract.deploy();
await contract.waitForDeployment();

// Use the contract
// [Add usage examples]
\`\`\`

## Step-by-Step Guide

### Step 1: Setup
[Instructions]

### Step 2: Initialize
[Instructions]

### Step 3: Use
[Instructions]

## Common Patterns

### Pattern 1: [Pattern Name]
\`\`\`solidity
// Code example
\`\`\`

### Pattern 2: [Pattern Name]
\`\`\`solidity
// Code example
\`\`\`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Issue 1 | Solution |
| Issue 2 | Solution |

## Best Practices

- Practice 1
- Practice 2
- Practice 3

## See Also

- [API Reference](./api.md)
- [Security Considerations](./security.md)
`;

    fs.writeFileSync(path.join(outputDir, "usage.md"), content);
}

function generateAPIDoc(config: ExampleConfig, outputDir: string, docs: Map<string, string>): void {
    let functionsDoc = "";
    let eventsDoc = "";

    docs.forEach((doc, name) => {
        if (name.startsWith("on") || name.includes("Event")) {
            eventsDoc += `### ${name}\n\n${doc}\n\n`;
        } else {
            functionsDoc += `### ${name}\n\n${doc}\n\n`;
        }
    });

    const content = `# ${config.title} - API Reference

## Functions

${functionsDoc || "Add function documentation here"}

## Events

${eventsDoc || "Add event documentation here"}

## Types

### Custom Types

[Document custom types and enums]

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| Error 1 | Cause | Solution |
| Error 2 | Cause | Solution |

## Gas Costs

| Operation | Approx Gas |
|-----------|-----------|
| Operation 1 | ~X gas |
| Operation 2 | ~Y gas |

## Examples

### Example 1

\`\`\`typescript
// Code example
\`\`\`

### Example 2

\`\`\`typescript
// Code example
\`\`\`
`;

    fs.writeFileSync(path.join(outputDir, "api.md"), content);
}

function generateSecurityDoc(config: ExampleConfig, outputDir: string): void {
    const content = `# ${config.title} - Security Considerations

## Overview

Security is critical for smart contracts. This guide outlines important considerations.

## Key Security Features

- Feature 1
- Feature 2
- Feature 3

## Vulnerabilities & Mitigations

### Vulnerability 1: [Name]

**Description**: [What is the vulnerability?]

**Mitigation**: [How is it prevented?]

\`\`\`solidity
// Example mitigation code
\`\`\`

### Vulnerability 2: [Name]

**Description**: [What is the vulnerability?]

**Mitigation**: [How is it prevented?]

## Best Practices Applied

- ✓ Input validation
- ✓ Access control checks
- ✓ Safe math operations
- ✓ Proper event logging

## Testing Strategy

1. **Unit Tests**: Individual function behavior
2. **Integration Tests**: Multi-component interactions
3. **Security Tests**: Attack vectors and edge cases
4. **Gas Tests**: Efficiency analysis

## Audit Checklist

- [ ] Contract reviewed for logic errors
- [ ] Security vulnerabilities identified and mitigated
- [ ] Test coverage adequate (80%+)
- [ ] Gas costs reasonable
- [ ] Documentation complete

## Recommendations

1. Run security audit tools
2. Get peer review
3. Test on testnet first
4. Consider professional audit for mainnet

## Resources

- [Security Best Practices](../../../SECURITY-CHECKLIST.md)
- [Common Vulnerabilities](https://swcregistry.io/)
- [FHEVM Security Docs](https://docs.zama.ai/fhevm)

## Reporting Issues

Found a security issue? Report responsibly:
- Email: security@zama.ai
- Include: Description, PoC, suggested fix
`;

    fs.writeFileSync(path.join(outputDir, "security.md"), content);
}

function extractContractName(code: string): string {
    const match = code.match(/contract\s+(\w+)/);
    return match ? match[1] : "Example";
}

function generateSummaryFile(): void {
    console.log("📚 Generating SUMMARY.md for GitBook...\n");

    let summary = `# Summary

## Introduction

- [Home](../README.md)
- [Quick Start](../QUICK-START.md)

## Examples by Difficulty

### Beginner

`;

    // Group examples by difficulty
    const byDifficulty: Record<string, ExampleConfig[]> = {
        beginner: [],
        intermediate: [],
        advanced: [],
    };

    EXAMPLES_CONFIG.forEach((example) => {
        byDifficulty[example.difficulty].push(example);
    });

    // Add examples to summary
    for (const difficulty of ["beginner", "intermediate", "advanced"]) {
        if (byDifficulty[difficulty].length > 0) {
            if (difficulty !== "beginner") {
                summary += `\n### ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}\n\n`;
            }

            for (const example of byDifficulty[difficulty]) {
                summary += `- [${example.title}](./examples/${example.name}/overview.md)\n`;
                summary += `  - [Usage](./examples/${example.name}/usage.md)\n`;
                summary += `  - [API Reference](./examples/${example.name}/api.md)\n`;
                summary += `  - [Security](./examples/${example.name}/security.md)\n`;
            }
        }
    }

    summary += `\n## Resources

- [FHE Concepts](./concepts.md)
- [Best Practices](./best-practices.md)
- [Troubleshooting](./troubleshooting.md)
`;

    fs.writeFileSync("docs/SUMMARY.md", summary);
    console.log("✓ SUMMARY.md generated\n");
}

async function main(): Promise<void> {
    console.log("========================================");
    console.log("FHEVM Documentation Generator");
    console.log("========================================\n");

    const argument = process.argv[2];

    if (!argument) {
        console.error("Usage: npx ts-node scripts/generate-docs.ts [example-name|--all]");
        console.error("\nAvailable examples:");
        EXAMPLES_CONFIG.forEach((example) => {
            console.error(`  ${example.name.padEnd(25)} - ${example.title}`);
        });
        process.exit(1);
    }

    if (argument === "--all") {
        console.log("Generating documentation for all examples...\n");
        for (const config of EXAMPLES_CONFIG) {
            generateExampleDocumentation(config);
        }
    } else {
        const example = EXAMPLES_CONFIG.find((e) => e.name === argument);
        if (!example) {
            console.error(`❌ Example not found: ${argument}`);
            process.exit(1);
        }
        generateExampleDocumentation(example);
    }

    // Generate summary
    generateSummaryFile();

    console.log("========================================");
    console.log("✅ Documentation generation complete!");
    console.log("========================================\n");

    console.log("📚 Documentation generated in docs/examples/\n");
}

main().catch(console.error);
