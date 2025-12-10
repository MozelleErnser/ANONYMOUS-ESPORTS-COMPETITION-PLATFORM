# Anonymous Esports - Gas Optimization Guide

Guide to optimizing smart contract gas costs for the Anonymous Esports platform.

## Overview

Gas optimization reduces transaction costs, making the platform more accessible and cost-effective.

**Goal**: Keep function costs under acceptable limits
- Simple operations: <100,000 gas
- Complex operations: <500,000 gas
- Deployment: <3,000,000 gas

## Basic Gas Optimization Techniques

### 1. Use Appropriate Data Types

**Problem**: Solidity pads smaller types to 32 bytes anyway

**Solution**: Only use smaller types in structs to pack storage slots

```solidity
// ❌ WRONG - No gas savings
contract BadStorage {
    uint8 value1;        // 1 byte
    uint256 value2;      // 32 bytes - uses full slot anyway
    uint8 value3;        // 1 byte - uses full slot
}

// ✓ CORRECT - Pack same slot
contract GoodStorage {
    uint8 value1;        // 1 byte
    uint8 value3;        // 1 byte - same slot
    uint256 value2;      // 32 bytes - new slot
}

// ✓ BEST - Use struct packing
struct PackedData {
    uint8 value1;
    uint8 value3;
    uint256 value2;
}

contract BestStorage {
    PackedData data;     // 1 slot: value1, value3; 1 slot: value2
}
```

**Gas Savings**: ~2,000 gas per slot saved

### 2. Avoid Storing Redundant Data

**Problem**: Storing data that can be computed or is already logged

```solidity
// ❌ WRONG - Redundant storage
contract RedundantStorage {
    uint256 totalVotes;
    uint256 voteCount;      // Redundant - same as length of votes array

    function vote() external {
        totalVotes++;
        voteCount++;        // Unnecessary
    }
}

// ✓ CORRECT - Use mappings or computed values
contract EfficientStorage {
    mapping(address => bool) hasVoted;

    function getVoteCount() external view returns (uint256) {
        // Compute or count from events
        return VoteCast.length;  // From events
    }
}
```

**Gas Savings**: ~5,000 gas per redundant storage write

### 3. Minimize Storage Writes

**Problem**: Storage operations cost 20,000 gas each

```solidity
// ❌ WRONG - Multiple storage writes in loop
contract ExpensiveLoop {
    uint256 total;

    function tally(uint256[] memory votes) external {
        for (uint i = 0; i < votes.length; i++) {
            total += votes[i];      // Storage write: 20,000 gas × length
        }
    }
}

// ✓ CORRECT - Single storage write
contract EfficientLoop {
    uint256 total;

    function tally(uint256[] memory votes) external {
        uint256 temp = 0;
        for (uint i = 0; i < votes.length; i++) {
            temp += votes[i];       // Memory operation: ~3 gas × length
        }
        total = temp;               // Single storage write: 20,000 gas
    }
}
```

**Gas Savings**: ~19,000 gas per write saved

### 4. Cache State Variables in Memory

**Problem**: Each SLOAD costs 2,100 gas (cold) or 100 gas (warm)

```solidity
// ❌ WRONG - Multiple loads from storage
contract ExpensiveReads {
    uint256 counter;

    function processVotes(uint256 votes) external returns (uint256) {
        uint256 result = 0;

        for (uint i = 0; i < votes; i++) {
            counter++;                      // SLOAD: 2,100 gas first time
            result = counter * 2;           // SLOAD again
            counter++;                      // SLOAD again
        }

        return result;
    }
}

// ✓ CORRECT - Cache in memory
contract EfficientReads {
    uint256 counter;

    function processVotes(uint256 votes) external returns (uint256) {
        uint256 temp = counter;             // Single SLOAD: 2,100 gas
        uint256 result = 0;

        for (uint i = 0; i < votes; i++) {
            temp++;
            result = temp * 2;              // Use memory: ~3 gas
            temp++;
        }

        counter = temp;                     // Single SSTORE: 20,000 gas

        return result;
    }
}
```

**Gas Savings**: ~1,900 gas per read saved

### 5. Use Function Visibility Strategically

**Problem**: Public functions are more expensive than external

```solidity
// ❌ WRONG - Unnecessary public
contract ExpensiveVisibility {
    uint256 total;

    // Called only externally - should be external
    public function calculateTotal(uint256[] memory values) {
        for (uint i = 0; i < values.length; i++) {
            total += values[i];
        }
    }
}

// ✓ CORRECT - Use appropriate visibility
contract EfficientVisibility {
    uint256 total;

    // Called only externally
    external function calculateTotal(uint256[] memory values) {
        // ...
    }

    // Called internally
    internal function _calculateInternal(uint256[] memory values) {
        // ...
    }
}
```

**Gas Savings**: ~100-500 gas per call

## FHE-Specific Optimization

### 1. Batch FHE Operations

**Problem**: Each FHE operation costs gas

```solidity
// ❌ WRONG - Individual permissions
function vote(externalEuint32 votes) external {
    euint32 v1 = FHE.fromExternal(votes, proof1);
    euint32 v2 = FHE.fromExternal(votes, proof2);
    euint32 v3 = FHE.fromExternal(votes, proof3);

    totalVotes = FHE.add(totalVotes, v1);
    FHE.allowThis(totalVotes);          // Called 3 times
    FHE.allow(totalVotes, msg.sender);

    totalVotes = FHE.add(totalVotes, v2);
    FHE.allowThis(totalVotes);          // Repeated

    totalVotes = FHE.add(totalVotes, v3);
    FHE.allowThis(totalVotes);          // Repeated
}

// ✓ CORRECT - Batch operations
function vote(externalEuint32[] calldata votes, bytes[] calldata proofs) external {
    euint32 temp = FHE.asEuint32(0);

    for (uint i = 0; i < votes.length; i++) {
        euint32 v = FHE.fromExternal(votes[i], proofs[i]);
        temp = FHE.add(temp, v);
    }

    totalVotes = FHE.add(totalVotes, temp);
    FHE.allowThis(totalVotes);          // Called once
    FHE.allow(totalVotes, msg.sender);  // Called once
}
```

**Gas Savings**: ~1,000 gas per batched operation

### 2. Optimize FHE Operation Types

**Problem**: Different FHE operations have different costs

```solidity
// Relative gas costs
FHE.add()      // ~500 gas
FHE.sub()      // ~500 gas
FHE.mul()      // ~1,000 gas (expensive!)
FHE.eq()       // ~300 gas (cheap!)
FHE.lt()       // ~400 gas
FHE.lte()      // ~400 gas

// ✓ OPTIMIZATION: Avoid multiplication when possible
function weightedVote(euint32 vote, euint8 weight) external {
    // ❌ Expensive: FHE.mul (1,000 gas)
    // euint32 weighted = FHE.mul(vote, FHE.asEuint32(weight));

    // ✓ Cheaper: Use addition for small weights
    if (weight == 2) {
        return FHE.add(vote, vote);    // 500 gas instead of 1,000
    }
}
```

## Advanced Gas Optimization

### 1. Use Events Instead of Storage

**Problem**: Events are cheaper than storage for historical data

```solidity
// ❌ WRONG - Store all votes
contract ExpensiveVoting {
    Vote[] public votes;                // ~20,000 gas per vote

    function recordVote(Vote memory vote) external {
        votes.push(vote);               // Expensive!
    }
}

// ✓ CORRECT - Use events for history
contract EfficientVoting {
    event VoteRecorded(indexed address voter, uint256 choice, uint256 timestamp);

    function recordVote(uint256 choice) external {
        emit VoteRecorded(msg.sender, choice, block.timestamp);  // ~375 gas
    }

    // Query events if needed
    function getVotes() external returns (uint256) {
        // Query from events using logs
    }
}
```

**Gas Savings**: ~19,600 gas per record (events vs storage)

### 2. Use Immutable Variables

**Problem**: Each read of regular variables costs gas

```solidity
// ❌ WRONG - Regular variable
contract ExpensiveConfig {
    address owner;                      // ~2,100 gas first read, 100 gas warm

    function checkOwner() external view returns (bool) {
        return msg.sender == owner;     // SLOAD: expensive
    }
}

// ✓ CORRECT - Immutable variable
contract EfficientConfig {
    address immutable OWNER;            // ~3 gas read (constant)

    constructor(address _owner) {
        OWNER = _owner;
    }

    function checkOwner() external view returns (bool) {
        return msg.sender == OWNER;     // No SLOAD needed
    }
}
```

**Gas Savings**: ~2,000 gas per read of immutable

### 3. Implement Lazy Evaluation

**Problem**: Computing values not always needed

```solidity
// ❌ WRONG - Always compute
function vote(euint32 vote) external {
    euint32 totalVotes = calculateTotal();  // Computed even if not needed
    totalVotes = FHE.add(totalVotes, vote);
}

// ✓ CORRECT - Lazy evaluation
function vote(euint32 vote) external {
    // Only compute if necessary
    if (needsUpdate) {
        totalVotes = FHE.add(getTotalVotes(), vote);
    }
}
```

## Gas Analysis Tools

### 1. Gas Reporter

```bash
# Install
npm install hardhat-gas-reporter

# Use in hardhat.config.ts
import "hardhat-gas-reporter";

export default {
    gasReporter: {
        enabled: true,
        currency: "USD",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    },
};

# Run tests with gas report
REPORT_GAS=true npm test
```

### 2. Coverage Report

```bash
npm run test:coverage
```

Reviews code paths and identifies optimization opportunities.

### 3. Manual Gas Analysis

```typescript
// Analyze gas costs
async function analyzeGas() {
    const tx = await contract.expensiveFunction();
    const receipt = await tx.wait();

    console.log(`Gas used: ${receipt.gasUsed}`);
    console.log(`Gas price: ${ethers.formatUnits(receipt.gasPrice, 'gwei')} gwei`);
    console.log(`Total cost: ${ethers.formatEther(receipt.gasUsed * receipt.gasPrice)} ETH`);
}
```

## Gas Optimization Checklist

### Before Deployment

- [ ] Storage variables are packed
- [ ] No redundant state variables
- [ ] Loops use memory variables
- [ ] State variables are cached
- [ ] Function visibility is appropriate
- [ ] Events used for history
- [ ] Immutable variables used for constants
- [ ] FHE operations are batched
- [ ] No expensive operations in loops
- [ ] Gas costs analyzed and acceptable

### Testing

- [ ] Gas report generated
- [ ] Costs are reasonable
- [ ] No unexpected expensive operations
- [ ] Batch operations tested
- [ ] Edge cases analyzed for gas

## Expected Gas Costs

### Voting Operations

| Operation | Gas Cost |
|-----------|----------|
| Cast vote | 150,000 - 200,000 |
| Tally votes | 100,000 - 500,000 |
| Register voter | 50,000 - 100,000 |
| End competition | 75,000 - 150,000 |

### FHE Operations

| Operation | Gas Cost |
|-----------|----------|
| FHE.add | ~500 |
| FHE.sub | ~500 |
| FHE.mul | ~1,000 |
| FHE.eq | ~300 |
| Permission grant | ~1,000 |

### Deployment

| Network | Estimated Cost |
|---------|----------------|
| Sepolia | 0.1 - 0.2 ETH |
| Mainnet | 1 - 5 ETH (varies) |

## Common Optimization Patterns

### Pattern 1: Batch Processing

```solidity
function batchProcess(uint256[] memory items) external {
    uint256 temp = 0;

    // Process in memory
    for (uint i = 0; i < items.length; i++) {
        temp += items[i];
    }

    // Single storage write
    result = temp;
}
```

### Pattern 2: State Caching

```solidity
function complexCalculation(uint256[] memory inputs) external {
    uint256 cached = state;  // Cache once

    // Use cached value
    for (uint i = 0; i < inputs.length; i++) {
        cached = cached + inputs[i];
    }

    state = cached;          // Single write
}
```

### Pattern 3: Lazy Computation

```solidity
function lazyCompute() external {
    if (!computed) {
        result = expensiveComputation();
        computed = true;
    }
    return result;
}
```

## Resources

### Tools
- Hardhat Gas Reporter: https://github.com/cgewecke/hardhat-gas-reporter
- Solidity Optimizer: https://docs.soliditylang.org/en/latest/ir-breaking-changes.html

### Learning
- Solidity Gas Optimization: https://docs.soliditylang.org/en/latest/gas-optimization.html
- Gas Optimization Techniques: https://github.com/tcp-stud/gas-optimization-tips

### Community
- Zama Discord: https://discord.com/invite/zama
- Optimization Discussions: https://www.zama.ai/community

---

**Efficient code makes the platform accessible and affordable for everyone! Optimize responsibly.** ⚡
