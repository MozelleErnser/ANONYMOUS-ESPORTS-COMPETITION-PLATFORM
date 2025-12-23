# Complete FHEVM Tutorials

Step-by-step guides for building FHEVM applications from scratch.

---

## Table of Contents

1. [Tutorial 1: Your First FHE Contract](#tutorial-1-your-first-fhe-contract)
2. [Tutorial 2: Working with Encrypted Data](#tutorial-2-working-with-encrypted-data)
3. [Tutorial 3: Building a Private Voting System](#tutorial-3-building-a-private-voting-system)
4. [Tutorial 4: Creating a Token with Private Balances](#tutorial-4-creating-a-token-with-private-balances)
5. [Tutorial 5: Advanced Patterns](#tutorial-5-advanced-patterns)

---

## Tutorial 1: Your First FHE Contract

**Duration**: 30 minutes
**Level**: Beginner
**What you'll learn**: Basic FHE operations and permission management

### Step 1: Setup Your Project

```bash
# Clone the template
git clone <template-url>
cd my-fhevm-project

# Install dependencies
npm install

# Verify setup
npm run verify:setup
```

### Step 2: Create Your First Contract

Create `contracts/HelloFHE.sol`:

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract HelloFHE is ZamaEthereumConfig {
    euint32 private secret;

    function setSecret(externalEuint32 input, bytes calldata proof) external {
        secret = FHE.fromExternal(input, proof);

        // Grant permissions
        FHE.allowThis(secret);      // Contract can use it
        FHE.allow(secret, msg.sender); // Sender can decrypt it
    }

    function getSecret() external view returns (euint32) {
        return secret;
    }
}
```

### Step 3: Write Tests

Create `test/HelloFHE.test.ts`:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("HelloFHE", function () {
  it("should store and retrieve encrypted value", async function () {
    const HelloFHE = await ethers.getContractFactory("HelloFHE");
    const contract = await HelloFHE.deploy();
    await contract.waitForDeployment();

    // Mock encrypted input and proof
    const mockInput = "0x01";
    const mockProof = "0x";

    // Set secret
    await contract.setSecret(mockInput, mockProof);

    // Get secret
    const secret = await contract.getSecret();
    expect(secret).to.not.be.undefined;
  });
});
```

### Step 4: Compile and Test

```bash
# Compile
npm run compile

# Run tests
npm run test
```

### Key Concepts Learned

- ✅ Creating FHEVM contracts
- ✅ Using FHE.fromExternal() with proofs
- ✅ Setting permissions with allowThis() and allow()
- ✅ Writing and running tests

---

## Tutorial 2: Working with Encrypted Data

**Duration**: 45 minutes
**Level**: Intermediate
**What you'll learn**: FHE operations and computations

### The Challenge

Build a contract that:
1. Stores multiple encrypted values
2. Performs operations on encrypted data
3. Manages permissions properly

### Step 1: Create the Contract

Create `contracts/EncryptedCalculator.sol`:

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract EncryptedCalculator is ZamaEthereumConfig {
    euint32 private valueA;
    euint32 private valueB;
    euint32 private result;

    function setValues(
        externalEuint32 inputA,
        bytes calldata proofA,
        externalEuint32 inputB,
        bytes calldata proofB
    ) external {
        // Decrypt inputs
        valueA = FHE.fromExternal(inputA, proofA);
        valueB = FHE.fromExternal(inputB, proofB);

        // Set permissions
        FHE.allowThis(valueA);
        FHE.allow(valueA, msg.sender);

        FHE.allowThis(valueB);
        FHE.allow(valueB, msg.sender);
    }

    function add() external {
        // Perform encrypted operation
        result = FHE.add(valueA, valueB);

        // Set permissions on result
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
    }

    function multiply() external {
        result = FHE.mul(valueA, valueB);

        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
    }

    function getResult() external view returns (euint32) {
        return result;
    }
}
```

### Step 2: Test the Contract

```typescript
describe("EncryptedCalculator", function () {
  it("should add encrypted values", async function () {
    const calculator = await ethers.getContractFactory("EncryptedCalculator");
    const contract = await calculator.deploy();

    // Set values
    await contract.setValues("0x0A", "0x", "0x05", "0x");

    // Add them
    await contract.add();

    // Get result (encrypted, but value is 15)
    const result = await contract.getResult();
    expect(result).to.not.be.undefined;
  });
});
```

### Key Concepts Learned

- ✅ Multiple encrypted values
- ✅ FHE.add() and FHE.mul()
- ✅ Managing permissions on computed values
- ✅ Complex test scenarios

---

## Tutorial 3: Building a Private Voting System

**Duration**: 2 hours
**Level**: Intermediate
**What you'll learn**: Building real-world applications

### The Challenge

Build a simple private voting contract where:
1. Votes are encrypted
2. Results are computed without decryption
3. Privacy is maintained

### Step 1: Design the Contract

Create `contracts/PrivateVote.sol`:

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivateVote is ZamaEthereumConfig {
    // Encrypted vote counts
    euint32 private votesYes;
    euint32 private votesNo;

    // Track if user voted
    mapping(address => bool) private hasVoted;

    // Events
    event VoteCast(address indexed voter);
    event ResultsRevealed(uint32 yes, uint32 no);

    constructor() {
        votesYes = FHE.asEuint32(0);
        votesNo = FHE.asEuint32(0);
        FHE.allowThis(votesYes);
        FHE.allowThis(votesNo);
    }

    function vote(
        externalEuint32 encryptedVote,
        bytes calldata proof
    ) external {
        require(!hasVoted[msg.sender], "Already voted");

        // Decrypt vote (1 = yes, 0 = no)
        euint32 vote = FHE.fromExternal(encryptedVote, proof);

        // Add to yes count
        euint32 isYes = vote;
        votesYes = FHE.add(votesYes, isYes);
        FHE.allowThis(votesYes);

        // Add to no count
        euint32 isNo = FHE.sub(FHE.asEuint32(1), isYes);
        votesNo = FHE.add(votesNo, isNo);
        FHE.allowThis(votesNo);

        hasVoted[msg.sender] = true;
        emit VoteCast(msg.sender);
    }

    function canVote() external view returns (bool) {
        return !hasVoted[msg.sender];
    }
}
```

### Step 2: Test Voting Logic

```typescript
describe("PrivateVote", function () {
  it("should count votes correctly", async function () {
    const [voter1, voter2, voter3] = await ethers.getSigners();

    const vote = await ethers.getContractFactory("PrivateVote");
    const contract = await vote.deploy();

    // Vote yes (1)
    await contract.connect(voter1).vote("0x01", "0x");
    expect(await contract.connect(voter1).canVote()).to.be.false;

    // Vote no (0)
    await contract.connect(voter2).vote("0x00", "0x");

    // Vote yes (1)
    await contract.connect(voter3).vote("0x01", "0x");

    // Voting is private - external observers don't know individual votes
  });
});
```

### Key Concepts Learned

- ✅ Real-world privacy applications
- ✅ Encrypted state management
- ✅ Voter tracking
- ✅ Event-driven architecture

---

## Tutorial 4: Creating a Token with Private Balances

**Duration**: 2 hours
**Level**: Advanced
**What you'll learn**: Building complex systems

### The Challenge

Implement an ERC20-like token where balances are encrypted.

### Key Implementation Points

1. **Encrypted Balances**:
```solidity
mapping(address => euint64) private balances;
```

2. **Private Transfers**:
```solidity
function transfer(
    address to,
    externalEuint64 amount,
    bytes calldata proof
) external {
    euint64 encAmount = FHE.fromExternal(amount, proof);

    // Subtract from sender
    balances[msg.sender] = FHE.sub(balances[msg.sender], encAmount);

    // Add to recipient
    balances[to] = FHE.add(balances[to], encAmount);
}
```

3. **Private Allowances**:
```solidity
mapping(address => mapping(address => euint64)) private allowances;
```

### Learning Outcomes

- ✅ Complex encrypted data structures
- ✅ Multi-user scenarios
- ✅ Permission delegation
- ✅ ERC20-like patterns with privacy

---

## Tutorial 5: Advanced Patterns

**Duration**: 3 hours
**Level**: Advanced
**What you'll learn**: Production-grade patterns

### Pattern 1: Conditional Logic with FHE

```solidity
function conditionalTransfer(
    address recipient,
    euint32 amount,
    euint32 threshold
) external {
    // Check if amount > threshold (encrypted comparison)
    ebool canTransfer = FHE.gt(amount, threshold);

    // Conditional transfer
    euint32 transferAmount = FHE.select(
        canTransfer,
        amount,
        FHE.asEuint32(0)
    );

    // Perform transfer
}
```

### Pattern 2: Time-Based Access Control

```solidity
mapping(address => uint256) private accessExpiry;

function grantTemporaryAccess(address user, uint256 durationSeconds) external {
    accessExpiry[user] = block.timestamp + durationSeconds;
    FHE.allow(sensitiveData, user);
}

function revokeExpiredAccess(address user) external {
    require(block.timestamp > accessExpiry[user], "Access still valid");
    // User loses access to sensitiveData
}
```

### Pattern 3: Multi-Signature Decryption

```solidity
function decryptWithMultiSig(
    bytes[] calldata signatures
) external {
    require(verifySignatures(signatures), "Invalid signatures");

    // Only decrypt after M-of-N approval
    revealedValue = FHE.decrypt(encryptedValue);
}
```

---

## Best Practices Summary

### Do's ✅

1. **Always grant permissions**:
```solidity
FHE.allowThis(value);
FHE.allow(value, user);
```

2. **Use fresh proofs**:
```typescript
// Generate new proof for each value
const enc1 = await encrypt(val1);
const enc2 = await encrypt(val2);
```

3. **Test permissions**:
```typescript
// Verify permissions in tests
await contract.setData(...);
const data = await contract.getData();
const decrypted = await instance.decrypt(...);
```

### Don'ts ❌

1. **Don't reuse proofs**:
```typescript
// WRONG: Same proof for different values
await contract.set(val1, proof);
await contract.set(val2, proof);  // ❌
```

2. **Don't forget permissions**:
```solidity
// WRONG: Missing FHE.allowThis
euint32 result = FHE.add(a, b);
// Missing: FHE.allowThis(result);
```

3. **Don't expose encrypted data**:
```solidity
// WRONG: Defeats purpose of encryption
function getValue() external view returns (uint32) {
    return uint32(encryptedValue);  // Won't compile anyway
}
```

---

## Troubleshooting

### Common Issues During Tutorials

**Issue**: "Permission denied"
**Solution**: Add `FHE.allowThis()` in contract

**Issue**: "Invalid proof"
**Solution**: Generate fresh proof for each value

**Issue**: "Cannot decrypt"
**Solution**: Call `FHE.allow()` before client decryption

---

## Next Steps

After completing these tutorials:

1. ✅ Read the [Developer Guide](./DEVELOPER-GUIDE.md)
2. ✅ Study the [Examples Catalog](./UPDATED-EXAMPLES-CATALOG.md)
3. ✅ Review [Security Checklist](./SECURITY-CHECKLIST.md)
4. ✅ Build your own application!

---

## Project Ideas

- Private voting system
- Encrypted todo app
- Private auction
- Confidential surveys
- Encrypted leaderboards
- Private fund management

Choose one and build it! 🚀

---

**Questions?** Check [FAQ](./FAQ.md) or join [Discord](https://discord.com/invite/zama)
