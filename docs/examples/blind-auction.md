# Blind Auction Example

## Overview

The Blind Auction is an advanced FHEVM example demonstrating a sealed-bid auction where all bids remain encrypted until the reveal phase, ensuring fairness and privacy.

**Difficulty**: Advanced
**Concepts**: Encrypted Bidding, Time-based Phases, FHE Comparisons, Winner Determination

## What This Example Demonstrates

- ✅ Encrypted bid submission and storage
- ✅ Time-based auction phases (bidding, reveal, ended)
- ✅ Encrypted bid comparisons using FHE.gt()
- ✅ Winner determination with FHE operations
- ✅ Permission management across phases
- ✅ Automated refund handling for non-winners
- ✅ Advanced state management

## Contract Overview

```solidity
contract BlindAuction is ZamaEthereumConfig {
    address public beneficiary;
    uint256 public biddingEnd;
    uint256 public revealEnd;
    bool public ended;

    euint64 private highestBid;
    address public highestBidder;

    mapping(address => Bid) public bids;
    address[] public bidders;
}
```

## Auction Phases

### Phase 1: Bidding (0 to T1)

Users submit encrypted bids:

```solidity
function bid(externalEuint64 encryptedAmount, bytes calldata proof) external {
    // Submit bid during bidding phase
    // Bid amount stays encrypted
}
```

**Features**:
- Bids are encrypted
- No one can see bid amounts
- Multiple bids allowed from different addresses
- One bid per address

### Phase 2: Reveal (T1 to T2)

Winner is determined by comparing encrypted bids:

```solidity
function reveal() external {
    // Compare all encrypted bids using FHE.gt()
    // Update highest bid
    // Determine winner
}
```

**Key Operations**:
```solidity
// Compare bids using FHE
ebool isHigher = FHE.gt(currentBid, highestBid);

// Select highest using encrypted boolean
euint64 newHighest = FHE.select(isHigher, currentBid, highestBid);
```

### Phase 3: Ended (After T2)

Auction is finalized, bids are processed:

```solidity
function endAuction() external {
    // Finalize winner
    // Allow withdrawals
}
```

**Outcomes**:
- Winner determined
- Winner cannot withdraw
- Non-winners can withdraw bids

## Key Concepts

### 1. Encrypted Bid Submission

```solidity
struct Bid {
    euint64 amount;      // Encrypted amount
    bool withdrawn;      // Withdrawal flag
    bool exists;         // Existence flag
}

mapping(address => Bid) public bids;
```

### 2. FHE-Based Comparison

```solidity
function reveal() external {
    for (uint256 i = 0; i < bidders.length; i++) {
        // Get current bid
        euint64 bidAmount = bids[bidders[i]].amount;

        // Compare with highest using FHE
        ebool isHigher = FHE.gt(bidAmount, highestBid);

        // Update if higher (without revealing to others)
        highestBid = FHE.select(isHigher, bidAmount, highestBid);
    }
}
```

### 3. Time-Based Phase Management

```solidity
// Check bidding phase
require(block.timestamp < biddingEnd, "Bidding ended");

// Check reveal phase
require(block.timestamp >= biddingEnd, "Bidding ongoing");
require(block.timestamp < revealEnd, "Reveal ended");

// Check ended phase
require(block.timestamp >= revealEnd, "Auction ongoing");
```

### 4. Winner Determination

```solidity
function _determineWinner() internal {
    address winner = address(0);
    euint64 winningBid = FHE.asEuint64(0);

    for (uint256 i = 0; i < bidders.length; i++) {
        // Compare and update winner
        ebool isHigher = FHE.gt(bids[bidders[i]].amount, winningBid);
        // ... update winner ...
    }

    highestBidder = winner;
    highestBid = winningBid;
}
```

## Benefits

### Privacy

- 🔐 All bids remain encrypted during bidding
- 👥 No one can see others' bids
- 🎯 Winner emerges from encrypted computation

### Fairness

- ⚖️ No bid manipulation
- 📊 Objective winner determination
- 🔒 No last-minute advantages

### Security

- 🛡️ FHE ensures bid privacy
- ✅ Automated winner selection
- 🚫 No possibility of tampering

## Usage Example

### Client-Side (TypeScript)

```typescript
import { createInstance } from "fhevmjs";

// 1. Setup
const instance = await createInstance({
  chainId: 11155111,
  networkUrl: RPC_URL,
  gatewayUrl: GATEWAY_URL,
});

// 2. Encrypt bid
const input = instance.createEncryptedInput(
  auctionAddress,
  userAddress
);
input.add64(BigInt(100)); // 100 tokens
const encrypted = await input.encrypt();

// 3. Place bid
const tx = await contract.bid(encrypted.handles[0], encrypted.inputProof);
await tx.wait();

// 4. Wait for bidding phase to end
// ... time passes ...

// 5. Reveal
await contract.reveal();

// 6. End auction
await contract.endAuction();

// 7. Check if winner
const winner = await contract.highestBidder();
if (winner === userAddress) {
  console.log("You won!");
} else {
  await contract.withdraw();
  console.log("Bid withdrawn");
}
```

## Testing

```bash
npm run test test/examples/BlindAuction.test.ts
```

### Test Scenarios

- ✅ Bid placement during bidding phase
- ✅ Multiple bidders
- ✅ Prevention of duplicate bids
- ✅ Reveal phase winner determination
- ✅ Non-winner withdrawals
- ✅ Phase transitions
- ✅ Time-based restrictions

## Gas Costs

Approximate gas on Sepolia:

| Operation | Gas |
|-----------|-----|
| Deploy | 3,000,000 |
| Bid | 200,000 |
| Reveal | 300,000 per bid |
| EndAuction | 100,000 |
| Withdraw | 50,000 |

## Security Considerations

### ✅ Safe Patterns

```solidity
// Always check phase before operations
require(block.timestamp < biddingEnd, "Phase check");

// Use encrypted comparisons
ebool isHigher = FHE.gt(a, b);
euint64 result = FHE.select(isHigher, a, b);

// Grant permissions properly
FHE.allowThis(amount);
FHE.allow(amount, beneficiary);
```

### ❌ Anti-Patterns

```solidity
// DON'T: Try to reveal individual bids
// They should stay encrypted

// DON'T: Compare encrypted values directly
if (bid > highestBid) { }  // Won't compile!

// DON'T: Forget to update permissions
euint64 newBid = FHE.select(...);
// Missing: FHE.allowThis(newBid);
```

## Real-World Applications

### 1. Art Auctions
- Hide bid amounts until reveal
- Fair price discovery
- Privacy for collectors

### 2. Company Acquisitions
- Sealed bids for confidentiality
- No information leakage
- Fair valuation process

### 3. Government Contracts
- Fair bidding process
- Prevent collusion
- Transparent winner selection

### 4. Spectrum Auctions
- FCC-style sealed-bid auctions
- Privacy for bidders
- Large-scale deployments

## Advanced Features (Production)

For production use, consider:

1. **Threshold Cryptography**
   - Multiple decryption servers
   - Threshold of K-out-of-N needed to reveal

2. **Verifiable Randomness**
   - Randomize reveal order
   - Prevent timing attacks

3. **Commitment Schemes**
   - Bidders commit to bids first
   - Reveal in second phase

4. **Dispute Resolution**
   - Prove bid amount if challenged
   - Handle edge cases

## Common Issues

### Issue: "Reveal during bidding phase"
**Solution**: Wait for `biddingEnd` timestamp

### Issue: "Cannot determine winner"
**Solution**: Ensure all bids have permissions set

### Issue: "Winner selection is wrong"
**Solution**: Check FHE comparison logic and bidder list

## Next Steps

After understanding this example:

1. Study **AccessControlExample** for permission patterns
2. Explore **PublicDecryption** for Gateway integration
3. Learn about **FHE.select()** for advanced comparisons

## Resources

- [FHE Comparisons](../../docs/examples/fhe-arithmetic.md)
- [Understanding Handles](../../docs/concepts/handles.md)
- [Anti-Patterns Guide](../../docs/concepts/anti-patterns.md)
- [Contract Code](../../contracts/examples/BlindAuction.sol)
- [Test Suite](../../test/examples/BlindAuction.test.ts)

## Summary

The Blind Auction demonstrates:

- Advanced FHE operations
- Time-based state machines
- Encrypted data handling at scale
- Real-world privacy-preserving application

This is a production-grade pattern for any sealed-bid process requiring privacy and fairness.

---

**Level**: Advanced
**Time to Complete**: 2-3 hours
**Prerequisites**: Understanding of FHE operations, Solidity state management
