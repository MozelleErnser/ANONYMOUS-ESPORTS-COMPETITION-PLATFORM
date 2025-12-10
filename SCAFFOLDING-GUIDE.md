# FHEVM Scaffolding & Automation Guide

Complete guide to using the FHEVM example generation tools to create standalone projects and generate documentation.

## Overview

The Anonymous Esports platform includes three powerful automation scripts:

1. **create-fhevm-example.ts** - Generate individual example repositories
2. **create-fhevm-category.ts** - Generate category-based project repositories
3. **generate-docs.ts** - Auto-generate GitBook documentation

## Prerequisites

```bash
# Install dependencies
npm install

# Install TypeScript globally (optional)
npm install -g typescript ts-node
```

## Creating Individual Examples

### Use Case
Create a standalone repository for a single FHEVM concept.

### Syntax
```bash
npx ts-node scripts/create-fhevm-example.ts <example-name> <output-path>
```

### Available Examples

| Example | Title | Difficulty |
|---------|-------|-----------|
| fhe-counter | FHE Counter | Beginner |
| encrypt-single-value | Encrypt Single Value | Beginner |
| weighted-voting | Weighted Voting | Intermediate |
| access-control | Access Control | Intermediate |
| blind-auction | Blind Auction | Advanced |

### Examples

#### Create a Beginner Example
```bash
npx ts-node scripts/create-fhevm-example.ts fhe-counter ./my-fhe-counter
cd my-fhe-counter
npm install
npm run compile
npm run test
```

#### Create an Intermediate Example
```bash
npx ts-node scripts/create-fhevm-example.ts weighted-voting ./voting-example
cd voting-example
npm install
npm run test
```

## Generating Documentation

### Use Case
Auto-generate GitBook-compatible documentation from code.

### Syntax
```bash
npx ts-node scripts/generate-docs.ts [example-name|--all]
```

### Single Example
```bash
# Generate docs for one example
npx ts-node scripts/generate-docs.ts fhe-counter
```

### All Examples
```bash
# Generate docs for all examples
npx ts-node scripts/generate-docs.ts --all
```

## Creating Category Projects

### Use Case
Create a repository with multiple related examples in one category.

### Syntax
```bash
npx ts-node scripts/create-fhevm-category.ts <category> <output-path>
```

### Available Categories

| Category | Use Case |
|----------|----------|
| basic | Learn FHE fundamentals |
| advanced | Complex patterns |
| encryption | Deep FHE study |
| voting | Governance systems |

### Example

```bash
npx ts-node scripts/create-fhevm-category.ts basic ./fhevm-basics
cd fhevm-basics
npm install
npm run test
```

## Workflow Example

Complete workflow from generation to deployment:

```bash
# 1. Generate project
npx ts-node scripts/create-fhevm-example.ts fhe-counter ./counter-app

# 2. Enter project
cd counter-app

# 3. Install dependencies
npm install

# 4. Compile contracts
npm run compile

# 5. Run tests
npm test

# 6. Implement contract
# Edit contracts/Example.sol

# 7. Deploy to testnet
npm run deploy:testnet
```

## What Gets Created

### Individual Example Structure
```
my-example/
├── contracts/
│   └── Example.sol
├── test/
│   └── Example.test.ts
├── scripts/
│   └── deploy.ts
├── hardhat.config.ts
├── package.json
└── .env.example
```

### Category Project Structure
```
my-category/
├── contracts/examples/
│   ├── example1.sol
│   ├── example2.sol
│   └── example3.sol
├── test/examples/
│   ├── example1.test.ts
│   ├── example2.test.ts
│   └── example3.test.ts
└── scripts/deploy.ts
```

## Documentation Generated

For each example:
- **overview.md** - What it demonstrates
- **usage.md** - How to use it
- **api.md** - Function reference
- **security.md** - Security considerations

Plus:
- **SUMMARY.md** - GitBook index (auto-generated)

## Next Steps

1. Create your first example
2. Install dependencies
3. Implement the contract
4. Write tests
5. Generate documentation
6. Deploy to testnet

## Troubleshooting

**Script not found?**
```bash
npm install -g ts-node
npx ts-node scripts/create-fhevm-example.ts
```

**Example not found?**
```bash
# Check available examples
npx ts-node scripts/create-fhevm-example.ts
```

**Compilation errors?**
```bash
# Check Solidity version in hardhat.config.ts
npm run compile
```

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/)
- [Discord Community](https://discord.com/invite/zama)

---

**Ready to scaffold your FHEVM project?** 🚀

Start with an example today!
