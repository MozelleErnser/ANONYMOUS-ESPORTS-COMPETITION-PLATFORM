# Anonymous Esports - Documentation Generation Guide

Guide for automatically generating and maintaining documentation for the Anonymous Esports platform.

## Overview

Documentation generation automates the creation of:
- API documentation
- Contract guides
- Example documentation
- GitBook SUMMARY.md
- README files

## Setup

### Prerequisites

```bash
# Install dependencies
npm install

# Check scripts are available
npm run --list | grep docs
```

### Required Files

Documentation generation requires:
- JSDoc/TSDoc comments in code
- Markdown files in `docs/` directory
- Contract ABI files
- Example contracts with comments

## Documentation Scripts

### Generate All Documentation

```bash
npm run generate-docs
```

Generates:
- Contract documentation
- Example documentation
- API reference
- GitBook SUMMARY.md

### Generate Specific Example

```bash
npm run generate-docs -- --example SimpleVote
```

Generates documentation for single example.

### Generate API Docs

```bash
npm run generate-docs -- --type api
```

Generates API reference from contract ABIs.

## JSDoc/TSDoc Standards

### Smart Contract Documentation

```solidity
/// @title ContractName
/// @notice Brief description of contract purpose
/// @dev Detailed implementation notes
contract YourContract is ZamaEthereumConfig {
    /// @notice State variable description
    euint32 private encryptedValue;

    /// @notice Emitted when important action occurs
    /// @param indexed parameter1 Parameter description
    /// @param parameter2 Another parameter
    event ActionName(indexed address indexed parameter1, uint256 parameter2);

    /// @notice Function description (one sentence)
    /// @dev Detailed explanation of implementation
    /// @param paramName Parameter description with type
    /// @return returnValue Return value description
    /// @custom:security-note Important security consideration
    function yourFunction(
        uint256 paramName
    ) external returns (uint256 returnValue) {
        // Implementation
    }
}
```

### TypeScript Documentation

```typescript
/**
 * Brief description of function
 *
 * Longer description if needed. Explain the purpose and usage.
 *
 * @param {Type} paramName - Parameter description
 * @param {Type} otherParam - Another parameter
 * @returns {Type} Return value description
 *
 * @example
 * const result = await functionName(param);
 *
 * @throws {ErrorType} Description of when error is thrown
 *
 * @internal
 * Implementation notes for developers
 */
async function functionName(paramName: Type, otherParam: Type): Promise<Type> {
    // Implementation
}

/**
 * Class description
 *
 * @class ClassName
 */
class ClassName {
    /**
     * Constructor description
     *
     * @param {Type} param - Parameter description
     */
    constructor(param: Type) {
        // Implementation
    }
}
```

## Markdown Documentation Files

### Structure

```
docs/
├── README.md                           # Overview
├── SUMMARY.md                          # GitBook index (auto-generated)
├── examples/
│   ├── simple-vote/
│   │   ├── overview.md                 # What it does
│   │   ├── usage.md                    # How to use
│   │   ├── api.md                      # API reference
│   │   └── security.md                 # Security notes
│   └── weighted-voting/
│       ├── overview.md
│       ├── usage.md
│       ├── api.md
│       └── security.md
├── concepts/
│   ├── fhe-basics.md
│   ├── encryption-binding.md
│   └── permissions.md
└── guides/
    ├── getting-started.md
    ├── best-practices.md
    └── troubleshooting.md
```

### Example Overview Document

```markdown
# Simple Vote Example

## What Does This Demonstrate?

This example demonstrates basic encrypted voting using FHE.

- **Concept**: Homomorphic addition
- **Difficulty**: Beginner
- **Estimated Time**: 30 minutes

## Why Is This Important?

[Explanation of real-world use case]

## Key Concepts

- **Encryption Binding**: Values are bound to contract/user pairs
- **Input Proofs**: Attest correct binding without revealing value
- **Homomorphic Addition**: Add encrypted values without decrypting

## Architecture

[ASCII diagram or description of how it works]

## Next Steps

- Try the [Weighted Voting example](../weighted-voting/)
- Learn about [FHE concepts](../../concepts/)
- See [API reference](./api.md)

## Related Topics

- [Access Control](../access-control/)
- [Multi-round Tournaments](../tournament/)
```

### Example Usage Document

```markdown
# How to Use Simple Vote

## Installation

```bash
# Clone and setup
git clone <repo>
npm install
npm run compile
```

## Quick Start

```solidity
// Deploy
const voting = await SimpleVote.deploy();

// Cast vote
await voting.vote(encryptedVote, inputProof);

// Get event
voting.on("VoteCast", (voter) => {
    console.log(`Vote from: ${voter}`);
});
```

## API Reference

### Functions

#### vote()

```solidity
function vote(
    externalEuint32 voteInput,
    bytes calldata inputProof
) external
```

**Description**: Casts an encrypted vote

**Parameters**:
- `voteInput` (externalEuint32): Encrypted vote value
- `inputProof` (bytes): Zero-knowledge proof

**Returns**: None (emits event)

**Events**: `VoteCast(indexed address voter)`

**Gas**: ~150,000 gas

**Errors**:
- `"Not authorized"` - Caller is not registered voter
- `"Invalid proof"` - Input proof verification failed

### Events

#### VoteCast

```solidity
event VoteCast(indexed address indexed voter)
```

**Description**: Emitted when vote is cast

**Parameters**:
- `voter` (address): Address of voter

**Example**:
```typescript
voting.on("VoteCast", (voter) => {
    console.log(`Vote from: ${voter}`);
});
```

## Examples

### Basic Usage

[Working code example]

### Advanced Usage

[More complex example]

### Common Patterns

[Pattern examples]

## See Also

- [Security Considerations](./security.md)
- [API Reference](./api.md)
- [Troubleshooting](../../guides/troubleshooting.md)
```

## Documentation Generation Scripts

### Custom Generation Script

```typescript
// scripts/generateDocs.ts
import fs from "fs";
import path from "path";
import glob from "glob";

interface DocConfig {
    name: string;
    title: string;
    description: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    files: {
        contract: string;
        test: string;
        docs: string;
    };
}

const EXAMPLES_CONFIG: DocConfig[] = [
    {
        name: "simple-vote",
        title: "Simple Vote",
        description: "Basic encrypted voting example",
        difficulty: "beginner",
        files: {
            contract: "contracts/examples/SimpleVote.sol",
            test: "test/examples/SimpleVote.test.ts",
            docs: "docs/examples/simple-vote/",
        },
    },
    {
        name: "weighted-voting",
        title: "Weighted Voting",
        description: "Voting with reputation weights",
        difficulty: "intermediate",
        files: {
            contract: "contracts/examples/WeightedVoting.sol",
            test: "test/examples/WeightedVoting.test.ts",
            docs: "docs/examples/weighted-voting/",
        },
    },
];

async function generateDocumentation(exampleName?: string) {
    console.log("Generating documentation...\n");

    const configs = exampleName
        ? EXAMPLES_CONFIG.filter((c) => c.name === exampleName)
        : EXAMPLES_CONFIG;

    if (configs.length === 0) {
        console.error(`No configuration found for: ${exampleName}`);
        process.exit(1);
    }

    for (const config of configs) {
        await generateExampleDocs(config);
    }

    // Generate SUMMARY.md
    await generateSummary();

    console.log("\n✓ Documentation generation complete");
}

async function generateExampleDocs(config: DocConfig) {
    console.log(`Generating docs for: ${config.title}`);

    // Read source files
    const contractCode = fs.readFileSync(config.files.contract, "utf8");
    const testCode = fs.readFileSync(config.files.test, "utf8");

    // Extract JSDoc comments
    const docs = extractDocs(contractCode);

    // Create documentation directory
    fs.mkdirSync(config.files.docs, { recursive: true });

    // Generate overview
    const overview = generateOverview(config, docs);
    fs.writeFileSync(path.join(config.files.docs, "overview.md"), overview);

    // Generate usage
    const usage = generateUsage(config, contractCode);
    fs.writeFileSync(path.join(config.files.docs, "usage.md"), usage);

    // Generate API reference
    const api = generateAPI(config, docs);
    fs.writeFileSync(path.join(config.files.docs, "api.md"), api);

    console.log(`✓ Generated ${config.title} docs`);
}

function extractDocs(code: string): Record<string, string> {
    const docs: Record<string, string> = {};
    const docRegex = /\/\/\/ (.*?)(?=function|event|contract)/gs;

    let match;
    while ((match = docRegex.exec(code)) !== null) {
        docs[match[0]] = match[1];
    }

    return docs;
}

function generateOverview(config: DocConfig, docs: Record<string, string>): string {
    return `# ${config.title}

## What Does This Demonstrate?

${config.description}

**Difficulty**: ${config.difficulty}

## Why Is This Important?

[Auto-generated overview]

## Key Concepts

- Concept 1
- Concept 2

## See Also

- [Usage Guide](./usage.md)
- [API Reference](./api.md)
`;
}

function generateUsage(config: DocConfig, code: string): string {
    // Extract function examples from code comments
    return `# How to Use ${config.title}

## Installation

\`\`\`bash
npm install
npm run compile
\`\`\`

## Quick Start

[Auto-generated usage example]

## API Reference

See [API.md](./api.md)
`;
}

function generateAPI(config: DocConfig, docs: Record<string, string>): string {
    return `# ${config.title} - API Reference

## Functions

[Auto-generated from JSDoc]

## Events

[Auto-generated from JSDoc]

## Types

[Auto-generated from contract]
`;
}

async function generateSummary() {
    let summary = "# Summary\n\n";
    summary += "## Examples\n\n";

    const exampleDirs = glob.sync("docs/examples/*/");

    for (const dir of exampleDirs) {
        const name = path.basename(dir);
        const formatted = name.replace(/-/g, " ").toUpperCase();

        summary += `* [${formatted}](./${dir}overview.md)\n`;
        summary += `  * [Usage](./${dir}usage.md)\n`;
        summary += `  * [API](./${dir}api.md)\n`;
    }

    fs.writeFileSync("docs/SUMMARY.md", summary);
    console.log("✓ Generated SUMMARY.md");
}

// Run if executed directly
const exampleName = process.argv[2];
generateDocumentation(exampleName).catch(console.error);

export default generateDocumentation;
```

### Generate GitBook Summary

```typescript
// scripts/generateGitBookSummary.ts
import fs from "fs";
import path from "path";

function generateSummary() {
    let summary = `# Summary

## Introduction
* [Home](../README.md)

## Getting Started
* [Quick Start](./getting-started.md)
* [Installation](./installation.md)

## Concepts
* [FHE Basics](./concepts/fhe-basics.md)
* [Encryption Binding](./concepts/encryption-binding.md)

## Examples
`;

    // Find all example directories
    const examplesDir = "docs/examples";
    const examples = fs.readdirSync(examplesDir);

    for (const example of examples) {
        const examplePath = path.join(examplesDir, example);

        if (fs.statSync(examplePath).isDirectory()) {
            const title = example.split("-").join(" ").toUpperCase();

            summary += `\n* [${title}](./${example}/overview.md)\n`;
            summary += `  * [Usage](./${example}/usage.md)\n`;
            summary += `  * [API](./${example}/api.md)\n`;
            summary += `  * [Security](./${example}/security.md)\n`;
        }
    }

    summary += `\n## Guides
* [Best Practices](./guides/best-practices.md)
* [Troubleshooting](./guides/troubleshooting.md)
`;

    fs.writeFileSync("docs/SUMMARY.md", summary);
    console.log("✓ Generated SUMMARY.md");
}

generateSummary();
```

## Automatic Documentation Updates

### Watch Mode

Generate docs automatically when files change:

```bash
npm run docs:watch
```

Watches for changes in:
- `contracts/**/*.sol`
- `test/**/*.test.ts`
- `docs/**/*.md`

### CI/CD Integration

```yaml
# .github/workflows/docs.yml
name: Generate Docs

on: [push]

jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run generate-docs
      - run: npm run docs:build
      - uses: actions/upload-artifact@v3
        with:
          name: docs
          path: docs/
```

## Documentation Best Practices

### 1. Write Clear JSDoc Comments

```solidity
/// @title Clear title
/// @notice What the function does
/// @dev Implementation details
/// @param paramName Description including type and constraints
/// @return description Description of return value
function example(uint256 paramName) external returns (uint256) {
    // Implementation
}
```

### 2. Include Examples

Every documented function should have usage example:

```markdown
## Example

```solidity
// Deploy
const contract = await MyContract.deploy();

// Call function
const result = await contract.myFunction(123);

// Result
console.log(result);
```
```

### 3. Document Errors

```solidity
/// @dev Reverts with "Invalid amount" if amount is zero
require(amount > 0, "Invalid amount");
```

### 4. Add Security Notes

```markdown
## Security Considerations

- **Risk**: Reentrancy if called with untrusted contract
- **Mitigation**: Uses checks-effects-interactions pattern

## Known Limitations

- Only supports up to 1000 voters
- Requires manual gas optimization for large datasets
```

## Viewing Generated Documentation

### Local Preview

```bash
# Install GitBook CLI
npm install -g gitbook-cli

# Serve locally
gitbook serve docs/

# Visit http://localhost:4000
```

### GitHub Pages

```bash
# Generate static site
gitbook build docs/ docs/_book

# Commit to gh-pages branch
git add docs/_book
git commit -m "Update docs"
git push origin gh-pages
```

## Documentation Quality Checklist

- [ ] All public functions documented
- [ ] All parameters described
- [ ] Return values explained
- [ ] Events documented
- [ ] Errors/reverts explained
- [ ] Examples provided
- [ ] Security notes included
- [ ] Links are valid
- [ ] Code examples tested
- [ ] Difficulty level noted

## Troubleshooting Documentation

### Missing Documentation

```bash
# Find undocumented functions
grep -n "^    function" contracts/*.sol | grep -v "///"
```

### Invalid Links

```bash
# Check for broken links in markdown
npm install -g markdown-link-check
markdown-link-check docs/**/*.md
```

### Formatting Issues

```bash
# Check markdown formatting
npm install -g markdownlint-cli
markdownlint docs/**/*.md
```

## Resources

### Documentation Tools
- JSDoc: https://jsdoc.app/
- GitBook: https://www.gitbook.com/
- Markdown Guide: https://www.markdownguide.org/

### Examples
- OpenZeppelin Docs: https://docs.openzeppelin.com/
- Hardhat Docs: https://hardhat.org/docs

---

**Good documentation makes your code accessible and valuable to the community!** 📚
