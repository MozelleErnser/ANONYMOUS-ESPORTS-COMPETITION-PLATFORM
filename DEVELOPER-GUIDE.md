# Anonymous Esports - Developer Guide

Guide for developers who want to add new examples and enhance the platform.

## Contributing Overview

This guide helps you:
- Add new example contracts
- Create comprehensive tests
- Generate documentation
- Follow code standards
- Submit contributions

## Before You Start

### Setup Requirements

```bash
# Ensure you have the latest code
git clone https://github.com/anonymous-esports/AnonymousEsports.git
cd AnonymousEsports

# Install dependencies
npm install

# Verify setup
npm run verify:setup

# All tests should pass
npm run test
```

### Knowledge Requirements

To contribute effectively, you should understand:

1. **Solidity 0.8.24+**
   - State management
   - Access control
   - Events

2. **FHE Concepts**
   - Encryption binding
   - Homomorphic operations
   - Input proofs

3. **TypeScript/JavaScript**
   - Async/await
   - Testing frameworks
   - Hardhat plugins

4. **Git Workflow**
   - Branching
   - Committing
   - Pull requests

## Adding a New Example

### Step 1: Design Your Example

Before coding, plan your example:

**What will you demonstrate?**
- New FHE pattern?
- Common use case?
- Advanced technique?

**Target audience?**
- Beginners
- Intermediate developers
- Advanced users

**Complexity level?**
- 1-2 stars: Simple (1-2 hours)
- 3-4 stars: Medium (2-4 hours)
- 4-5 stars: Complex (4+ hours)

### Step 2: Create Contract File

Create contract in `contracts/examples/`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title YourExampleName
/// @notice Brief description of what this demonstrates
/// @dev Implementation notes and important considerations
contract YourExampleName is ZamaEthereumConfig {
    // State variables
    euint32 private state;

    // Events
    /// @notice Emitted when something happens
    event EventName(indexed address indexed user, uint256 value);

    // Functions
    /// @notice Brief description
    /// @param paramName Parameter description
    /// @return Return value description
    function yourFunction(
        externalEuint32 encryptedInput,
        bytes calldata inputProof
    ) external {
        // Implementation with detailed comments
    }
}
```

**Key Requirements**:
- [ ] SPDX license header (MIT or BSD-3-Clause-Clear)
- [ ] Pragma solidity ^0.8.24
- [ ] Extends ZamaEthereumConfig
- [ ] Comprehensive comments (/// style)
- [ ] Clear parameter descriptions
- [ ] Events for important state changes

### Step 3: Write Comprehensive Tests

Create test file in `test/examples/`:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { getSigners, initializeFhevm } from "hardhat-fhevm";

describe("YourExampleName", () => {
    let contract: any;
    let owner: any;
    let user: any;

    beforeEach(async () => {
        [owner, user] = await getSigners();
        await initializeFhevm();

        const Contract = await ethers.getContractFactory("YourExampleName");
        contract = await Contract.deploy();
        await contract.waitForDeployment();
    });

    describe("Initialization", () => {
        it("should deploy successfully", async () => {
            const address = await contract.getAddress();
            expect(address).to.properAddress;
        });
    });

    describe("Core Functionality", () => {
        it("should handle valid input correctly", async () => {
            // ✓ Positive case
            const input = await ethers.provider.createEncryptedInput(
                await contract.getAddress(),
                user.address
            );

            input.add32(100);
            const encrypted = await input.encrypt();

            const tx = await contract.connect(user).yourFunction(
                encrypted.handles[0],
                encrypted.inputProof
            );

            await expect(tx).to.emit(contract, "EventName");
        });

        it("should reject invalid input", async () => {
            // ✗ Negative case
            await expect(
                contract.connect(user).yourFunction(
                    "0x",
                    "0x"
                )
            ).to.be.reverted;
        });
    });

    describe("Access Control", () => {
        it("should restrict function to authorized users", async () => {
            // Permission test
        });

        it("should allow owner operations", async () => {
            // Owner test
        });
    });

    describe("Edge Cases", () => {
        it("should handle maximum value", async () => {
            // Boundary test
        });

        it("should handle minimum value", async () => {
            // Boundary test
        });
    });

    describe("Gas Optimization", () => {
        it("should use reasonable gas", async () => {
            // Gas test
            const tx = await contract.connect(user).yourFunction(
                // ...
            );
            const receipt = await tx.wait();

            expect(receipt.gasUsed).to.be.lessThan(500000);
        });
    });
});
```

**Test Checklist**:
- [ ] Unit tests for each function
- [ ] Positive test cases (valid input)
- [ ] Negative test cases (invalid input)
- [ ] Edge cases (boundaries)
- [ ] Access control tests
- [ ] Event emission tests
- [ ] Gas efficiency tests
- [ ] Integration tests (if multiple functions)

**Target Coverage**: 80%+ statement coverage

### Step 4: Create Documentation

Create documentation in `docs/examples/`:

#### Overview Document (`overview.md`)

```markdown
# YourExampleName

## What Does This Demonstrate?

Brief explanation of the FHE concept or pattern.

## Why Is This Important?

Explain the real-world use case.

## Key Concepts

- Concept 1
- Concept 2
- Concept 3

## Architecture

[Diagram or ASCII art showing the flow]

## Code Structure

- Main contract: `YourExampleName.sol`
- Tests: `YourExampleName.test.ts`
- Deployment: `YourExampleName.deploy.ts`
```

#### Usage Document (`usage.md`)

```markdown
# How to Use YourExampleName

## Installation

```bash
npm install
npm run compile
```

## Quick Start

```solidity
// Deploy
const contract = await YourExampleName.deploy();

// Use
const result = await contract.yourFunction(encrypted, proof);
```

## API Reference

### Functions

#### yourFunction

```solidity
function yourFunction(
    externalEuint32 encryptedInput,
    bytes calldata inputProof
) external
```

**Parameters**:
- `encryptedInput`: Encrypted input value
- `inputProof`: Zero-knowledge proof

**Returns**: Transaction receipt

**Events**: Emits `EventName`

**Gas**: ~150,000 gas

### Events

#### EventName

```solidity
event EventName(indexed address indexed user, uint256 value)
```

Emitted when something significant happens.
```

#### Security Document (`security.md`)

```markdown
# Security Considerations

## What Could Go Wrong?

- Risk 1
- Risk 2
- Risk 3

## How We Mitigate

- Mitigation 1
- Mitigation 2
- Mitigation 3

## Testing

Security tests verify:
- Access control
- Input validation
- Overflow/underflow prevention
- Permission enforcement

## Audit Checklist

- [ ] All inputs validated
- [ ] All permissions checked
- [ ] No reentrancy issues
- [ ] Gas efficient
- [ ] Events properly logged
```

#### Advanced Document (`advanced.md`)

```markdown
# Advanced Topics

## Extensions

How to extend this example:

1. Feature 1
2. Feature 2
3. Feature 3

## Performance Optimization

Tips for gas optimization:

- Use uint8 instead of uint256 when possible
- Batch operations
- Cache frequently accessed values

## Integration

How to integrate with other contracts:

```solidity
contract IntegratedContract {
    YourExampleName public example;

    constructor(address exampleAddr) {
        example = YourExampleName(exampleAddr);
    }
}
```
```

### Step 5: Set Up Deployment Script

Create deployment script in `scripts/examples/`:

```typescript
// scripts/examples/deployYourExample.ts
import { ethers } from "hardhat";

async function main() {
    console.log("Deploying YourExampleName...");

    const YourExample = await ethers.getContractFactory("YourExampleName");
    const contract = await YourExample.deploy();

    await contract.waitForDeployment();
    const address = await contract.getAddress();

    console.log(`Deployed to: ${address}`);

    // Optionally verify on Etherscan
    if (process.env.ETHERSCAN_API_KEY) {
        console.log("Verifying contract...");
        await verify(address);
    }
}

async function verify(address: string) {
    try {
        await ethers.provider.waitForTransaction(address);
        console.log("Verified on Etherscan");
    } catch (error) {
        console.log("Verification skipped");
    }
}

main().catch(console.error);
```

### Step 6: Update Configuration Files

#### Update `package.json` (add script)

```json
{
  "scripts": {
    "deploy:your-example": "hardhat run scripts/examples/deployYourExample.ts --network sepolia"
  }
}
```

#### Update `hardhat.config.ts` (if needed)

```typescript
// If your contract requires special compilation settings
const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.8.24",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000,
                    },
                },
            },
        ],
    },
};
```

### Step 7: Generate Documentation

Automatically generate GitBook documentation:

```bash
npm run generate-docs your-example-name
```

This creates:
- `docs/SUMMARY.md` (updated)
- `docs/your-example-name.md`

### Step 8: Test Everything

Before submitting:

```bash
# Compile
npm run compile

# Run tests
npm run test

# Generate coverage
npm run test:coverage

# Lint
npm run lint

# Type check
npm run type-check

# Deploy to testnet (with test private key)
npm run deploy:your-example
```

### Step 9: Submit Your Contribution

#### Create Feature Branch

```bash
git checkout -b feature/your-example-name
```

#### Commit Changes

```bash
git add contracts/examples/YourExample.sol
git add test/examples/YourExample.test.ts
git add docs/examples/your-example/
git add scripts/examples/deployYourExample.ts

git commit -m "Add YourExampleName example

- Implements [concept]
- Includes comprehensive tests (95% coverage)
- Complete documentation
- Deployment script
- Security audit checklist completed"
```

#### Push and Create Pull Request

```bash
git push origin feature/your-example-name
```

Then on GitHub:
1. Create Pull Request
2. Link related issue
3. Describe changes
4. Reference documentation

## Code Review Process

### Self-Review Checklist

Before submitting, review:

- [ ] **Code Quality**
  - [ ] Follows style guide
  - [ ] Clear variable names
  - [ ] Proper comments
  - [ ] No dead code

- [ ] **Functionality**
  - [ ] All features work
  - [ ] Handles edge cases
  - [ ] Proper error handling
  - [ ] Events logged

- [ ] **Testing**
  - [ ] All tests pass
  - [ ] Coverage ≥80%
  - [ ] Tests are meaningful
  - [ ] No flaky tests

- [ ] **Documentation**
  - [ ] README is clear
  - [ ] API documented
  - [ ] Examples provided
  - [ ] Security notes included

- [ ] **Performance**
  - [ ] Gas efficient
  - [ ] No obvious bottlenecks
  - [ ] Optimization analysis done
  - [ ] Benchmarks recorded

### Reviewer Feedback

Reviewers will check:

1. **Design**: Is the pattern valid and useful?
2. **Security**: Are there vulnerabilities?
3. **Quality**: Is the code maintainable?
4. **Tests**: Is coverage adequate?
5. **Docs**: Are they clear and complete?

### Responding to Feedback

1. Create a new commit addressing feedback
2. Push to same branch
3. Mark conversations as resolved
4. Reply with explanations if needed

## Style Guide

### Solidity Style

```solidity
// 1. SPDX and pragma
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// 2. Imports
import { FHE } from "@fhevm/solidity/lib/FHE.sol";

// 3. Contract declaration
contract ContractName is ZamaEthereumConfig {
    // 4. Type definitions
    enum Status { Active, Paused }

    // 5. State variables
    uint256 public count;

    // 6. Events
    event CountIncremented(uint256 newCount);

    // 7. Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    // 8. Functions (public/external, then internal/private)
    function increment() external {
        count++;
        emit CountIncremented(count);
    }
}
```

### TypeScript/JavaScript Style

```typescript
// Use async/await
async function deploy() {
    const contract = await ethers.getContractFactory("Name");
    return await contract.deploy();
}

// Use meaningful names
const deploymentAddress = await contract.getAddress();

// Add comments for complex logic
// Calculate weighted vote with FHE operations
const weighted = FHE.mul(vote, weight);

// Use destructuring
const [owner, user] = await ethers.getSigners();

// Use consistent spacing
const result = {
    name: "Value",
    value: 123,
};
```

### Documentation Style

```markdown
# Use H1 for main title

## Use H2 for sections

### Use H3 for subsections

**Bold** for emphasis

`code` for inline code

## Code Examples

```solidity
// Code block with language
```

## Lists

- Item 1
- Item 2
  - Nested item
```

## Common Mistakes to Avoid

### ❌ Missing FHE Permissions

```solidity
// WRONG
totalVotes = FHE.add(totalVotes, vote);
FHE.allow(totalVotes, msg.sender);  // Missing allowThis()
```

### ❌ Wrong Encryption Signer

```typescript
// WRONG
const enc = await fhevm.createEncryptedInput(contract, alice);
enc.add32(100).encrypt();
await contract.connect(bob).function(...);  // Different signer
```

### ❌ Inefficient Loops

```solidity
// WRONG
for (uint i = 0; i < n; i++) {
    state = FHE.add(state, values[i]);  // State write in loop
    FHE.allowThis(state);  // Called repeatedly
}
```

### ❌ Incomplete Documentation

```solidity
// WRONG
function vote() external {
    // Missing: parameter description, return value, purpose
}
```

## Resources

### FHEVM Learning
- [FHEVM Docs](https://docs.zama.ai/fhevm)
- [FHE Concepts](./FHE-CONCEPTS.md)
- [Example Catalog](./EXAMPLES-CATALOG.md)

### Development Tools
- [Hardhat Docs](https://hardhat.org/)
- [Ethers.js Docs](https://docs.ethers.org/)
- [Solidity Docs](https://docs.soliditylang.org/)

### Community
- [Discord](https://discord.com/invite/zama)
- [Forum](https://www.zama.ai/community)
- [GitHub Issues](https://github.com/anonymous-esports/AnonymousEsports/issues)

## Getting Help

### During Development

- Check [EXAMPLES-CATALOG.md](./EXAMPLES-CATALOG.md) for patterns
- Review existing examples for reference
- Ask questions on Discord

### Before Submission

- Run full test suite
- Check code against style guide
- Verify all documentation
- Get peer review if possible

### After Submission

- Respond to reviewer feedback
- Update code if requested
- Make sure CI passes
- Merge when approved

---

**Thank you for contributing to the Anonymous Esports platform! Your examples help developers learn and build better privacy-preserving applications.** 🙏
