# Understanding Input Proofs

## What Are Input Proofs?

Input proofs are cryptographic proofs that validate encrypted inputs to FHEVM smart contracts. They prove that:

1. The encrypted value was created correctly
2. The encryption follows the proper protocol
3. The ciphertext is valid and not malicious

## Why Are Input Proofs Required?

### Security

Without input proofs, malicious actors could:
- Submit malformed ciphertexts
- Break the FHE scheme
- Corrupt encrypted computations
- Leak sensitive information

### Correctness

Input proofs ensure:
- ✅ Encrypted values are well-formed
- ✅ Ciphertexts can be safely operated on
- ✅ Results will be correct after decryption
- ✅ Protocol security is maintained

## How Input Proofs Work

### 1. Client-Side Generation

```typescript
// User's plaintext value
const plainValue = 42;

// Create encrypted input with proof
const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add32(plainValue);

// Encrypt and generate proof
const { handles, inputProof } = await input.encrypt();

// handles[0] = encrypted value
// inputProof = cryptographic proof
```

### 2. On-Chain Validation

```solidity
function storeValue(
    externalEuint32 input,
    bytes calldata proof  // ← Input proof
) external {
    // This line validates the proof
    euint32 encrypted = FHE.fromExternal(input, proof);

    // If proof is invalid, transaction reverts
    // If valid, encrypted value can be safely used
}
```

### 3. Proof Verification Process

```
Plaintext Value (42)
        ↓
[Client Encryption]
        ↓
Ciphertext + Proof
        ↓
[Submit to Contract]
        ↓
FHE.fromExternal(ciphertext, proof)
        ↓
[Proof Verification]
        ↓
✅ Valid → Continue
❌ Invalid → Revert
```

## Using Input Proofs Correctly

### ✅ Correct Pattern: Single Value

```solidity
function storeValue(
    externalEuint32 input,
    bytes calldata proof
) external {
    euint32 value = FHE.fromExternal(input, proof);
    // proof validates 'input'
}
```

### ✅ Correct Pattern: Multiple Values

```solidity
function storeMultiple(
    externalEuint32 input1,
    bytes calldata proof1,  // ← Separate proof for input1
    externalEuint32 input2,
    bytes calldata proof2   // ← Separate proof for input2
) external {
    euint32 value1 = FHE.fromExternal(input1, proof1);
    euint32 value2 = FHE.fromExternal(input2, proof2);
    // Each input has its own proof
}
```

### ❌ Wrong Pattern: Reusing Proofs

```solidity
function storeWrong(
    externalEuint32 input1,
    externalEuint32 input2,
    bytes calldata proof  // ← Only one proof!
) external {
    euint32 value1 = FHE.fromExternal(input1, proof);  // OK
    euint32 value2 = FHE.fromExternal(input2, proof);  // ❌ WILL FAIL!
    // Proof is bound to specific ciphertext
}
```

### ❌ Wrong Pattern: Missing Proof

```solidity
function storeMissing(
    externalEuint32 input
    // Missing: bytes calldata proof
) external {
    euint32 value = FHE.fromExternal(input);  // ❌ Won't compile!
    // Proof parameter is required
}
```

## Client-Side Implementation

### Complete Example

```typescript
import { createInstance } from "fhevmjs";
import { ethers } from "ethers";

// 1. Setup
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(ADDRESS, ABI, signer);

// 2. Create FHEVM instance
const instance = await createInstance({
  chainId: 11155111,
  networkUrl: RPC_URL,
  gatewayUrl: GATEWAY_URL,
});

// 3. Encrypt single value
async function encryptSingleValue(plainValue: number) {
  const input = instance.createEncryptedInput(
    await contract.getAddress(),
    signer.address
  );

  input.add32(plainValue);

  const { handles, inputProof } = await input.encrypt();

  return {
    encryptedValue: handles[0],
    proof: inputProof,
  };
}

// 4. Encrypt multiple values
async function encryptMultipleValues(values: number[]) {
  const inputs = [];

  for (const value of values) {
    const input = instance.createEncryptedInput(
      await contract.getAddress(),
      signer.address
    );
    input.add32(value);
    const encrypted = await input.encrypt();

    inputs.push({
      handle: encrypted.handles[0],
      proof: encrypted.inputProof,
    });
  }

  return inputs;
}

// 5. Submit to contract
async function submitValue(plainValue: number) {
  const { encryptedValue, proof } = await encryptSingleValue(plainValue);

  const tx = await contract.storeValue(encryptedValue, proof);
  await tx.wait();

  console.log("Value stored with valid proof!");
}

// 6. Submit multiple values
async function submitMultiple(values: number[]) {
  const encrypted = await encryptMultipleValues(values);

  const tx = await contract.storeMultiple(
    encrypted[0].handle,
    encrypted[0].proof,
    encrypted[1].handle,
    encrypted[1].proof
  );
  await tx.wait();
}
```

## Input Proof Properties

### 1. Uniqueness
- Each encrypted value has a unique proof
- Cannot reuse proofs for different ciphertexts
- Proofs bind to specific encrypted data

### 2. Non-Transferability
- Proof for value A cannot validate value B
- Must generate new proof for each encryption
- Attempting to reuse fails validation

### 3. Time Independence
- Proofs don't expire
- Valid indefinitely once generated
- Can be resubmitted if transaction fails

### 4. Size
- Proofs are typically 200-500 bytes
- Size depends on encrypted type
- Transmitted as calldata (gas cost consideration)

## Proof Generation Types

### Type 1: Single Value Proof

```typescript
// For storing single encrypted value
const input = instance.createEncryptedInput(contract, user);
input.add32(value);
const { handles, inputProof } = await input.encrypt();
```

### Type 2: Batch Proof

```typescript
// For multiple values of same type
const input = instance.createEncryptedInput(contract, user);
input.add32(value1);
input.add32(value2);
input.add32(value3);
const { handles, inputProof } = await input.encrypt();
// handles[0], handles[1], handles[2] with one proof
```

### Type 3: Mixed Type Proof

```typescript
// For different encrypted types
const input = instance.createEncryptedInput(contract, user);
input.add8(smallValue);   // euint8
input.add32(mediumValue); // euint32
input.add64(largeValue);  // euint64
const { handles, inputProof } = await input.encrypt();
// handles[0] = euint8, handles[1] = euint32, handles[2] = euint64
```

## Common Errors and Solutions

### Error 1: "Invalid input proof"

**Cause**: Proof doesn't match ciphertext

```typescript
// ❌ Wrong
const encrypted1 = await encryptValue(42);
const encrypted2 = await encryptValue(100);
await contract.store(encrypted2.handle, encrypted1.proof); // Mismatch!

// ✅ Correct
const encrypted = await encryptValue(42);
await contract.store(encrypted.handle, encrypted.proof); // Match!
```

### Error 2: "Proof verification failed"

**Cause**: Malformed or corrupted proof

```typescript
// ❌ Wrong
const proof = "0x"; // Empty proof
await contract.store(handle, proof);

// ✅ Correct
const { handles, inputProof } = await input.encrypt();
await contract.store(handles[0], inputProof);
```

### Error 3: "Cannot reuse proof"

**Cause**: Attempting to use same proof for multiple values

```typescript
// ❌ Wrong
const { handles, inputProof } = await input.encrypt();
await contract.store(handles[0], inputProof); // OK
await contract.store(handles[1], inputProof); // ❌ Fails!

// ✅ Correct
// Generate separate proof for each value
const enc1 = await encryptValue(42);
const enc2 = await encryptValue(100);
await contract.store(enc1.handle, enc1.proof);
await contract.store(enc2.handle, enc2.proof);
```

## Best Practices

### ✅ DO

1. **Generate fresh proofs** for each encrypted input
2. **Validate proof size** before submission (should be non-empty)
3. **Handle proof errors** gracefully in client code
4. **Store proofs** temporarily if transaction might be resubmitted
5. **Test proof validation** in your test suite

### ❌ DON'T

1. **Reuse proofs** across different encrypted values
2. **Submit empty proofs** (will always fail)
3. **Modify proofs** after generation (will invalidate)
4. **Generate proofs** on backend (client-side only)
5. **Skip proof parameters** in contract functions

## Testing Input Proofs

```typescript
describe("Input Proof Validation", () => {
  it("should accept valid proof", async () => {
    const { handle, proof } = await encryptValue(42);
    await expect(contract.store(handle, proof))
      .to.not.be.reverted;
  });

  it("should reject invalid proof", async () => {
    const { handle } = await encryptValue(42);
    const invalidProof = "0xinvalid";
    await expect(contract.store(handle, invalidProof))
      .to.be.reverted;
  });

  it("should reject proof mismatch", async () => {
    const enc1 = await encryptValue(42);
    const enc2 = await encryptValue(100);
    await expect(contract.store(enc1.handle, enc2.proof))
      .to.be.reverted;
  });

  it("should handle multiple proofs correctly", async () => {
    const enc1 = await encryptValue(42);
    const enc2 = await encryptValue(100);
    await expect(
      contract.storeMultiple(
        enc1.handle, enc1.proof,
        enc2.handle, enc2.proof
      )
    ).to.not.be.reverted;
  });
});
```

## Summary

Input proofs are essential for FHEVM security:

- 🔐 **Security**: Prevent malicious ciphertexts
- ✅ **Validation**: Ensure correct encryption
- 🔗 **Binding**: Tie proofs to specific ciphertexts
- 📝 **Required**: Every encrypted input needs a proof
- 🚫 **Unique**: Cannot reuse proofs

Always generate and validate input proofs correctly to ensure the security and correctness of your FHEVM applications.

---

**Related Examples**:
- [Input Proof Example Contract](../../contracts/examples/InputProofExample.sol)
- [Encrypt Single Value](./encrypt-single-value.md)
- [Encrypt Multiple Values](./encrypt-multiple-values.md)
