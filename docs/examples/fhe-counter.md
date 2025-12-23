# FHE Counter Example

## Overview

The FHE Counter demonstrates the most basic FHEVM operations: encrypting integers and performing arithmetic operations (add/subtract) while keeping the values encrypted.

**Difficulty**: Beginner
**Concepts**: Encryption, FHE Operations, Permissions

## What This Example Demonstrates

- ✅ Basic encrypted integer storage (euint32)
- ✅ FHE arithmetic operations (add, subtract)
- ✅ Input proof validation
- ✅ Permission management (allowThis, allow)
- ✅ Encrypted state management

## Contract Overview

```solidity
contract FHECounter is ZamaEthereumConfig {
    euint32 private _count;

    function increment(externalEuint32 value, bytes calldata proof) external;
    function decrement(externalEuint32 value, bytes calldata proof) external;
    function getCount() external view returns (euint32);
}
```

## Key Concepts

### 1. Encrypted Types

```solidity
euint32 private _count;  // Encrypted 32-bit unsigned integer
```

- `euint32` is an encrypted uint32
- Stored and computed while encrypted
- Never exposed as plaintext on-chain

### 2. Input Proofs

```solidity
function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
    euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);
    // ...
}
```

- Every encrypted input requires a proof
- Proves the encryption was done correctly
- Generated client-side with fhevmjs

### 3. FHE Operations

```solidity
_count = FHE.add(_count, encryptedEuint32);  // Addition
_count = FHE.sub(_count, encryptedEuint32);  // Subtraction
```

- Operations on encrypted values
- Result stays encrypted
- No plaintext exposure

### 4. Permission Management

```solidity
FHE.allowThis(_count);      // Contract can use value
FHE.allow(_count, msg.sender);  // User can decrypt value
```

- `allowThis`: Contract needs permission to operate on encrypted values
- `allow`: Grant user permission to decrypt
- Must be called after every operation that creates new encrypted value

## Usage Example

### Client-Side (TypeScript with fhevmjs)

```typescript
import { createInstance } from "fhevmjs";

// 1. Initialize FHEVM instance
const instance = await createInstance({
  chainId: 11155111,
  networkUrl: "https://sepolia.infura.io/v3/YOUR_KEY",
  gatewayUrl: "https://gateway.sepolia.zama.ai",
});

// 2. Create encrypted input
const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add32(5); // Increment by 5

// 3. Encrypt and get proof
const encryptedInput = await input.encrypt();
const { handles, inputProof } = encryptedInput;

// 4. Call contract
await contract.increment(handles[0], inputProof);

// 5. Get encrypted count
const encryptedCount = await contract.getCount();

// 6. Request decryption
const decryptedCount = await instance.decrypt(contractAddress, encryptedCount);
console.log("Count:", decryptedCount);
```

## Testing

```bash
npm run test test/examples/FHECounter.test.ts
```

### Test Coverage

- ✅ Deployment
- ✅ Increment operation
- ✅ Decrement operation
- ✅ Permission management
- ✅ Multiple operations
- ✅ Error cases

## Gas Costs

Approximate gas costs on Sepolia:

- Deploy: ~2,000,000 gas
- Increment: ~150,000 gas
- Decrement: ~150,000 gas
- GetCount: ~30,000 gas (view)

## Security Considerations

### ✅ Safe Patterns

```solidity
// Always set permissions after operations
_count = FHE.add(_count, value);
FHE.allowThis(_count);
FHE.allow(_count, msg.sender);
```

### ❌ Anti-Patterns

```solidity
// DON'T: Forget permissions
_count = FHE.add(_count, value);
// Missing: FHE.allowThis(_count);

// DON'T: Try to convert to plaintext
uint32 plainCount = uint32(_count);  // Won't compile!

// DON'T: Compare with plaintext directly
if (_count == 10) { }  // Won't compile!
```

## Common Issues

### Issue: "Permission denied" error
**Solution**: Always call `FHE.allowThis()` after operations

### Issue: "Invalid input proof"
**Solution**: Generate fresh proof for each encrypted input

### Issue: Cannot decrypt value
**Solution**: Ensure `FHE.allow(value, address)` was called

## Next Steps

After understanding this example, try:

1. **EncryptSingleValue** - Learn more about encryption patterns
2. **FHEArithmetic** - Explore all arithmetic operations
3. **AccessControlExample** - Add role-based access control

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [fhevmjs Library](https://github.com/zama-ai/fhevmjs)
- [Solidity Source](../../contracts/examples/FHECounter.sol)
- [Test Suite](../../test/examples/FHECounter.test.ts)

## Summary

The FHE Counter is your starting point for FHEVM development. It demonstrates:

- Basic encrypted types
- Simple arithmetic operations
- Permission management
- Client-side encryption/decryption

Master this example before moving to more complex patterns.

---

**Level**: Beginner
**Time to Complete**: 30 minutes
**Prerequisites**: Basic Solidity, TypeScript knowledge
