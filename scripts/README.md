# FHEVM Automation Scripts

Powerful TypeScript scripts for generating FHEVM example repositories and documentation.

## Scripts Overview

### 1. create-fhevm-example.ts

**Purpose**: Generate a standalone FHEVM example repository

**Usage**:
```bash
npx ts-node scripts/create-fhevm-example.ts <example-name> <output-path>
```

**Features**:
- Creates complete Hardhat project structure
- Generates contract template
- Creates test boilerplate
- Sets up deployment scripts
- Configures package.json with FHEVM dependencies
- Adds environment configuration template

**Example**:
```bash
npx ts-node scripts/create-fhevm-example.ts fhe-counter ./my-counter
```

**Output Structure**:
```
my-counter/
├── contracts/
│   └── Example.sol
├── test/
│   └── Example.test.ts
├── scripts/
│   └── deploy.ts
├── hardhat.config.ts
├── package.json
├── tsconfig.json
├── .env.example
└── .gitignore
```

### 2. create-fhevm-category.ts

**Purpose**: Generate a category-based FHEVM project with multiple examples

**Usage**:
```bash
npx ts-node scripts/create-fhevm-category.ts <category> <output-path>
```

**Features**:
- Creates multi-example project
- Groups related examples by category
- Unified test suite
- Batch deployment script
- Category-specific documentation

**Categories**:
- `basic` - Foundational FHE concepts
- `advanced` - Complex patterns
- `encryption` - Encryption/decryption
- `voting` - Voting and governance

**Example**:
```bash
npx ts-node scripts/create-fhevm-category.ts basic ./basic-examples
```

**Output Structure**:
```
basic-examples/
├── contracts/examples/
│   ├── FHECounter.sol
│   ├── EncryptSingleValue.sol
│   └── AccessControl.sol
├── test/examples/
│   ├── FHECounter.test.ts
│   ├── EncryptSingleValue.test.ts
│   └── AccessControl.test.ts
├── scripts/
│   └── deploy.ts
└── README.md
```

### 3. generate-docs.ts

**Purpose**: Auto-generate GitBook documentation from code

**Usage**:
```bash
npx ts-node scripts/generate-docs.ts [example-name|--all]
```

**Features**:
- Extracts JSDoc/TSDoc comments
- Generates markdown documentation
- Creates GitBook SUMMARY.md
- Produces 4 docs per example:
  - overview.md
  - usage.md
  - api.md
  - security.md

**Examples**:
```bash
# Single example
npx ts-node scripts/generate-docs.ts fhe-counter

# All examples
npx ts-node scripts/generate-docs.ts --all
```

**Output**:
```
docs/
├── examples/
│   ├── fhe-counter/
│   │   ├── overview.md
│   │   ├── usage.md
│   │   ├── api.md
│   │   └── security.md
│   ├── weighted-voting/
│   │   └── ...
│   └── ...
└── SUMMARY.md
```

## Configuration

### Available Examples

Each example is configured in the script's EXAMPLES_MAP:

```typescript
{
    name: "example-id",
    title: "Example Title",
    description: "What this demonstrates",
    difficulty: "beginner" | "intermediate" | "advanced",
    files: {
        contract: "path/to/contract.sol",
        test: "path/to/test.ts",
        docs: "path/to/docs/"
    },
    tags: ["tag1", "tag2"]
}
```

### Available Categories

Categories group related examples:

```typescript
{
    name: "category-id",
    title: "Category Title",
    description: "Category description",
    examples: ["example1", "example2", ...]
}
```

## Advanced Usage

### Custom Examples

To add a new example:

1. Create the contract and test files
2. Add configuration to EXAMPLES_MAP:
```typescript
"my-example": {
    name: "my-example",
    title: "My Example",
    description: "Description",
    difficulty: "intermediate",
    files: {
        contract: "contracts/examples/MyExample.sol",
        test: "test/examples/MyExample.test.ts",
        docs: "docs/examples/my-example/"
    },
    tags: ["tag1", "tag2"]
}
```
3. Generate project:
```bash
npx ts-node scripts/create-fhevm-example.ts my-example ./output
```

### Batch Generation

Create multiple examples:

```bash
#!/bin/bash
for example in "fhe-counter" "encrypt-single-value" "weighted-voting"; do
    npx ts-node scripts/create-fhevm-example.ts $example ./examples/$example
done
```

### Automated Pipeline

```bash
#!/bin/bash

EXAMPLE=$1
OUTPUT=$2

# Generate
npx ts-node scripts/create-fhevm-example.ts $EXAMPLE $OUTPUT

cd $OUTPUT

# Setup
npm install
npm run compile

# Test
npm run test

# Generate docs
npx ts-node ../scripts/generate-docs.ts $EXAMPLE

# Deploy
npm run deploy:testnet
```

## Dependencies

Scripts require:
- Node.js 16+
- npm 8+
- TypeScript 5+

```bash
npm install --save-dev typescript ts-node
npm install @types/node glob
```

## Output Files

### Generated Contracts

Template with placeholders:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract Example is ZamaEthereumConfig {
    // TODO: Add state variables
    // TODO: Add functions
}
```

### Generated Tests

Basic test structure:
```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Example", () => {
    let contract: any;
    let owner: any;

    beforeEach(async () => {
        [owner] = await ethers.getSigners();
        const Factory = await ethers.getContractFactory("Example");
        contract = await Factory.deploy();
        await contract.waitForDeployment();
    });

    describe("Deployment", () => {
        it("should deploy successfully", async () => {
            const address = await contract.getAddress();
            expect(address).to.be.properAddress;
        });
    });
});
```

### Generated Configuration

hardhat.config.ts includes:
- Sepolia and Mainnet networks
- Solidity 0.8.24 compiler
- Gas reporting setup
- Etherscan verification

package.json includes:
- FHEVM dependencies
- Testing frameworks
- Development tools

## Troubleshooting

### Script Errors

**Error: Cannot find module**
```bash
npm install
npm install --save-dev typescript ts-node @types/node
```

**Error: Example not found**
```bash
# List available examples
npx ts-node scripts/create-fhevm-example.ts
```

**Error: Command not found**
```bash
# Use npm to run
npm exec ts-node -- scripts/create-fhevm-example.ts ...
```

### Generated Project Issues

**Compilation fails**
- Check hardhat.config.ts solidity version
- Run `npm install` to get dependencies
- Verify contract syntax

**Tests fail**
- Tests are templates, implement contract first
- Check test setup matches contract
- Verify FHEVM environment

**Deployment fails**
- Configure .env with RPC URLs
- Ensure account has testnet ETH
- Check private key format

## Best Practices

1. **Start Simple**
   - Begin with a beginner example
   - Understand the structure
   - Modify incrementally

2. **Use Categories for Learning**
   - Groups related concepts
   - Natural progression
   - Comprehensive coverage

3. **Generate Documentation Early**
   - Clarifies thinking
   - Easier to update early
   - Helps users understand

4. **Version Control**
   - Commit generated structure
   - Track modifications
   - Keep clean history

5. **Test Thoroughly**
   - Write comprehensive tests
   - Check edge cases
   - Verify gas costs

## Performance

Script execution times (approximate):
- Individual example: 2-5 seconds
- Category project: 5-10 seconds
- Documentation generation: 3-7 seconds

For large batches, use background execution:
```bash
npx ts-node scripts/create-fhevm-example.ts ... > /dev/null 2>&1 &
```

## Integration

### With CI/CD

Generate examples in pipeline:
```yaml
- name: Generate Examples
  run: npx ts-node scripts/create-fhevm-example.ts fhe-counter ./example
```

### With Build Tools

```json
{
  "scripts": {
    "scaffold:example": "ts-node scripts/create-fhevm-example.ts",
    "scaffold:category": "ts-node scripts/create-fhevm-category.ts",
    "docs:generate": "ts-node scripts/generate-docs.ts --all"
  }
}
```

## Contributing

To improve scripts:

1. Fork the repository
2. Create feature branch
3. Modify script functionality
4. Add test cases
5. Submit pull request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## Resources

- [Hardhat Documentation](https://hardhat.org/)
- [FHEVM Documentation](https://docs.zama.ai/fhevm/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [GitBook Documentation](https://docs.gitbook.com/)

## Support

- Discord: https://discord.com/invite/zama
- Forum: https://www.zama.ai/community
- GitHub Issues: Report bugs

## License

MIT - See LICENSE file

---

**Need help? Check [SCAFFOLDING-GUIDE.md](../SCAFFOLDING-GUIDE.md) for detailed tutorials.** 📚
