# Anonymous Esports - Examples Catalog

Complete catalog of example implementations and templates for the Anonymous Esports Competition Platform.

## Overview

This catalog describes all available examples organized by category, difficulty level, and use case.

## Category Structure

### Basic Examples (Foundational)

Building blocks for privacy-preserving voting.

#### 1. Simple Encrypted Vote

**Level**: Beginner
**File**: `contracts/examples/SimpleVote.sol`

**Demonstrates**:
- Basic FHE encryption
- Voting logic
- Permission handling
- Event emission

**Code Example**:
```solidity
contract SimpleVote {
    euint32 private encryptedVotes;

    function vote(externalEuint32 voteInput, bytes calldata proof) external {
        euint32 vote = FHE.fromExternal(voteInput, proof);
        encryptedVotes = FHE.add(encryptedVotes, vote);

        FHE.allowThis(encryptedVotes);
        FHE.allow(encryptedVotes, msg.sender);

        emit VoteCast(msg.sender);
    }
}
```

**Test Focus**:
- Valid vote acceptance
- Invalid vote rejection
- Encryption verification
- Permission validation

**Gas Cost**: ~150,000 gas

#### 2. Encrypt/Decrypt Examples

**Level**: Beginner
**Files**:
- `contracts/examples/EncryptSingleValue.sol`
- `contracts/examples/DecryptSingleValue.sol`

**Demonstrates**:
- Encryption binding
- Input proofs
- User decryption
- Handling encrypted values

#### 3. FHE Operations (Add, Sub, Compare)

**Level**: Beginner
**Files**:
- `contracts/examples/FHEAdd.sol`
- `contracts/examples/FHESub.sol`
- `contracts/examples/FHECompare.sol`

**Demonstrates**:
- Homomorphic addition
- Homomorphic subtraction
- Encrypted comparisons
- Result handling

### Intermediate Examples (Common Patterns)

Real-world voting patterns.

#### 1. Weighted Voting

**Level**: Intermediate
**File**: `contracts/examples/WeightedVoting.sol`

**Demonstrates**:
- Reputation system
- Weight multiplication
- Aggregated results
- Privacy preservation with weights

**Key Features**:
```solidity
function castWeightedVote(
    uint256 competitionId,
    euint32 vote,
    euint8 weight
) external {
    euint32 weightedVote = FHE.mul(vote, FHE.asEuint32(weight));
    // Aggregate weighted votes
}
```

**Gas Cost**: ~200,000 gas

**Test Coverage**:
- Weight application
- Vote aggregation
- Result accuracy
- Edge cases (zero weight, etc.)

#### 2. Multi-Round Tournament

**Level**: Intermediate
**File**: `contracts/examples/Tournament.sol`

**Demonstrates**:
- Round management
- State transitions
- Multiple competitions
- Result persistence

**Features**:
- Create rounds
- Track votes per round
- Advance winners
- Finalize tournament

#### 3. Access Control Patterns

**Level**: Intermediate
**File**: `contracts/examples/AccessControlled.sol`

**Demonstrates**:
- Role-based access
- Permission management
- Function guards
- Audit trails

**Implementation**:
```solidity
modifier onlyVoter() {
    require(hasRole(VOTER_ROLE, msg.sender), "Not a voter");
    _;
}

modifier onlyOrganizer() {
    require(hasRole(ORGANIZER_ROLE, msg.sender), "Not organizer");
    _;
}
```

### Advanced Examples (Complex Scenarios)

Enterprise-grade implementations.

#### 1. Blind Auction

**Level**: Advanced
**File**: `contracts/examples/BlindAuction.sol`

**Demonstrates**:
- Sealed bids with FHE
- Price discovery
- Winner determination
- Privacy preservation

**Workflow**:
1. Bidders submit encrypted bids
2. Auction period ends
3. Bids tallied (encrypted)
4. Winner announced
5. Losing bids remain private

**Gas Cost**: ~400,000 gas (deployment)

#### 2. Dutch Auction with Encryption

**Level**: Advanced
**File**: `contracts/examples/DutchAuction.sol`

**Demonstrates**:
- Price decay
- Encrypted comparisons
- Dynamic pricing
- Buyer confidentiality

#### 3. Confidential Token Operations

**Level**: Advanced
**File**: `contracts/examples/ConfidentialToken.sol`

**Demonstrates**:
- Encrypted balances
- Private transfers
- OpenZeppelin integration
- Advanced FHE operations

**Features**:
- ERC7984 standard
- Encrypted amounts
- Private transaction logs
- Wallet interactions

### Category: Access Control

Essential permission patterns.

#### 1. Simple Role-Based Access

```solidity
// contracts/examples/SimpleRBAC.sol
contract SimpleRBAC {
    mapping(address => bool) public voters;
    mapping(address => bool) public organizers;

    modifier onlyVoter() {
        require(voters[msg.sender], "Not voter");
        _;
    }

    function addVoter(address voter) external onlyOrganizer {
        voters[voter] = true;
    }
}
```

#### 2. Hierarchical Permissions

```solidity
// Roles: Admin > Organizer > Voter > Public
enum Role { NONE, VOTER, ORGANIZER, ADMIN }

mapping(address => Role) public userRoles;

modifier minRole(Role required) {
    require(userRoles[msg.sender] >= required, "Insufficient role");
    _;
}
```

#### 3. FHE-Specific Permissions

Critical: Both contract and user need permissions.

```solidity
function castVote(externalEuint32 vote, bytes calldata proof) external {
    // ✓ Both permissions required
    euint32 encryptedVote = FHE.fromExternal(vote, proof);

    FHE.allowThis(encryptedVote);      // Contract access
    FHE.allow(encryptedVote, msg.sender); // User access

    // Store or process
}
```

### Common Pitfalls (Anti-Patterns)

Learn what NOT to do.

#### Pitfall 1: Missing FHE.allowThis()

```solidity
// ❌ WRONG
function vote(externalEuint32 voteInput, bytes calldata proof) external {
    euint32 vote = FHE.fromExternal(voteInput, proof);
    totalVotes = FHE.add(totalVotes, vote);  // Will fail!
    FHE.allow(totalVotes, msg.sender);  // Too late
}

// ✓ CORRECT
function vote(externalEuint32 voteInput, bytes calldata proof) external {
    euint32 vote = FHE.fromExternal(voteInput, proof);
    totalVotes = FHE.add(totalVotes, vote);

    FHE.allowThis(totalVotes);         // First!
    FHE.allow(totalVotes, msg.sender); // Then user
}
```

#### Pitfall 2: Wrong Encryption Signer

```solidity
// ❌ WRONG
// Alice encrypts, Bob submits
const enc = await fhevm.createEncryptedInput(contract, alice);
enc.add32(100).encrypt();
// Then bob calls it - binding mismatch!

// ✓ CORRECT
// Same signer encrypts and submits
const enc = await fhevm.createEncryptedInput(contract, alice);
const encrypted = enc.add32(100).encrypt();
await contract.connect(alice).vote(encrypted.handles[0], encrypted.proof);
```

#### Pitfall 3: Viewing Encrypted Values

```solidity
// ❌ WRONG - Can't view in view functions
function getTotalVotes() public view returns (euint32) {
    return totalVotes;  // Error! euint32 not allowed in view returns
}

// ✓ CORRECT - Return after decryption
function getTotalVotes() external returns (uint32) {
    // Request decryption through relayer
    return requestDecryption(totalVotes);
}
```

#### Pitfall 4: State Modification in Loops

```solidity
// ❌ WRONG - Expensive!
for (uint i = 0; i < voters.length; i++) {
    totalVotes = FHE.add(totalVotes, votes[voters[i]]);  // Gas waste
    FHE.allowThis(totalVotes);  // Called repeatedly
}

// ✓ CORRECT - Batch operations
euint32 temp = FHE.asEuint32(0);
for (uint i = 0; i < voters.length; i++) {
    temp = FHE.add(temp, votes[voters[i]]);  // No state writes
}
totalVotes = temp;
FHE.allowThis(totalVotes);  // Once
```

## Example Template Structure

Each example follows this structure:

```
examples/
├── ContractName.sol              # Smart contract
├── ContractName.test.ts          # Tests
├── ContractName.deploy.ts        # Deployment
├── docs/
│   ├── overview.md               # What it does
│   ├── usage.md                  # How to use
│   ├── security.md               # Security notes
│   └── advanced.md               # Advanced topics
└── README.md                     # Quick start
```

## Difficulty Levels

### Beginner (1-3 stars)
- Simple FHE operations
- Basic voting logic
- Single encryption/decryption
- Estimated time: 1-2 hours

### Intermediate (3-4 stars)
- Multiple FHE operations
- Complex voting patterns
- Access control
- Estimated time: 2-4 hours

### Advanced (4-5 stars)
- Multiple contracts
- Complex workflows
- Production-ready code
- Estimated time: 4+ hours

## Learning Path

### Recommended Learning Order

1. **Start Here**
   - SimpleVote.sol
   - EncryptSingleValue.sol
   - DecryptSingleValue.sol

2. **Learn FHE Operations**
   - FHEAdd.sol
   - FHESub.sol
   - FHECompare.sol

3. **Explore Access Control**
   - SimpleRBAC.sol
   - AccessControlled.sol

4. **Advanced Patterns**
   - WeightedVoting.sol
   - Tournament.sol

5. **Enterprise Features**
   - BlindAuction.sol
   - ConfidentialToken.sol

## Creating New Examples

### Template for New Example

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title NewExample
/// @notice Demonstrates [concept]
/// @dev [Implementation notes]
contract NewExample is ZamaEthereumConfig {
    /// @notice Emitted when [event]
    event EventName(indexed address indexed, uint256 value);

    /// @notice State variable description
    euint32 private state;

    /// @notice Main function
    /// @param inputData Encrypted input
    /// @param proof Input proof
    function mainFunction(
        externalEuint32 inputData,
        bytes calldata proof
    ) external {
        // Implementation
    }
}
```

### Test Template

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("NewExample", () => {
    let contract: any;
    let owner: any;
    let user: any;

    beforeEach(async () => {
        [owner, user] = await ethers.getSigners();
        const Contract = await ethers.getContractFactory("NewExample");
        contract = await Contract.deploy();
        await contract.waitForDeployment();
    });

    describe("main function", () => {
        it("should handle valid input", async () => {
            // Test implementation
        });

        it("should reject invalid input", async () => {
            // Test implementation
        });
    });
});
```

## Gas Cost Reference

| Operation | Cost | Notes |
|-----------|------|-------|
| FHE.add() | 500 gas | Encrypted addition |
| FHE.sub() | 500 gas | Encrypted subtraction |
| FHE.mul() | 1,000 gas | Encrypted multiplication |
| FHE.eq() | 300 gas | Encrypted comparison |
| FHE.fromExternal() | 1,000 gas | Decrypt input |
| FHE.allowThis() | 1,000 gas | Grant contract access |
| FHE.allow() | 1,000 gas | Grant user access |

**Total contract deployment**: ~2.5M - 3M gas

## Integration with OpenZeppelin

Available confidential contracts:

- **ERC7984**: Confidential token standard
- **ConfidentialVault**: Secure value storage
- **ConfidentialSwap**: Private token swaps

See `OPENZEPPELIN-INTEGRATION.md` for details.

## Testing Best Practices

### Test Categories

1. **Unit Tests**: Individual functions
2. **Integration Tests**: Multiple components
3. **Security Tests**: Access control, bounds
4. **Gas Tests**: Optimization verification

### Example Test Structure

```typescript
describe("Category: Feature", () => {
    describe("✓ Positive Cases", () => {
        it("should succeed with valid input", () => { });
    });

    describe("✗ Negative Cases", () => {
        it("should fail with invalid input", () => { });
    });

    describe("Edge Cases", () => {
        it("should handle boundary values", () => { });
    });
});
```

## Documentation for Each Example

Each example should include:

1. **What** - What does it demonstrate?
2. **Why** - Why is this pattern important?
3. **How** - How does it work?
4. **Code** - Working code example
5. **Tests** - Test cases
6. **Gas** - Gas cost analysis
7. **Security** - Security considerations
8. **Advanced** - Extensions and variations

## Resources for Examples

### FHEVM Documentation
- https://docs.zama.ai/fhevm

### Solidity Best Practices
- https://docs.soliditylang.org/

### Gas Optimization
- https://github.com/tcp-stud/gas-optimization-tips

### OpenZeppelin Examples
- https://github.com/OpenZeppelin/openzeppelin-confidential-contracts

---

**Ready to explore examples? Start with SimpleVote.sol and build from there!** 📚

For questions about specific examples, see FAQ.md or join the community.
