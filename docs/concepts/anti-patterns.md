# Anti-Patterns and Common Mistakes

## Overview

This guide documents common mistakes developers make when building FHEVM applications and provides correct alternatives.

## Table of Contents

1. [Permission Mistakes](#permission-mistakes)
2. [Input Proof Errors](#input-proof-errors)
3. [Type Confusion](#type-confusion)
4. [Decryption Errors](#decryption-errors)
5. [Operation Mistakes](#operation-mistakes)
6. [Gas Optimization Errors](#gas-optimization-errors)

---

## Permission Mistakes

### ❌ Anti-Pattern 1: Missing `allowThis`

**Wrong**:
```solidity
function storeValue(externalEuint32 input, bytes calldata proof) external {
    euint32 value = FHE.fromExternal(input, proof);
    storedValue = value;
    FHE.allow(value, msg.sender);
    // ❌ Missing: FHE.allowThis(value);
}

function useValue() external {
    // ❌ This will fail - contract has no permission!
    euint32 doubled = FHE.mul(storedValue, FHE.asEuint32(2));
}
```

**Correct**:
```solidity
function storeValue(externalEuint32 input, bytes calldata proof) external {
    euint32 value = FHE.fromExternal(input, proof);
    storedValue = value;
    FHE.allowThis(value);  // ✅ Grant contract permission
    FHE.allow(value, msg.sender);
}
```

**Why it matters**: Without `allowThis`, the contract cannot perform operations on the encrypted value in future function calls.

---

### ❌ Anti-Pattern 2: Forgetting Permissions on Computed Values

**Wrong**:
```solidity
function compute(euint32 a, euint32 b) external {
    euint32 sum = FHE.add(a, b);
    storedValue = sum;
    // ❌ Missing permissions on 'sum'
}

function useSum() external {
    // ❌ Will fail - no permission on computed value!
    euint32 doubled = FHE.mul(storedValue, FHE.asEuint32(2));
}
```

**Correct**:
```solidity
function compute(euint32 a, euint32 b) external {
    euint32 sum = FHE.add(a, b);
    storedValue = sum;
    FHE.allowThis(sum);  // ✅ New handle needs permission
    FHE.allow(sum, msg.sender);
}
```

**Why it matters**: Every operation creates a NEW handle that needs its own permissions.

---

## Input Proof Errors

### ❌ Anti-Pattern 3: Reusing Input Proofs

**Wrong**:
```solidity
function storeMultiple(
    externalEuint32 input1,
    externalEuint32 input2,
    bytes calldata proof  // ❌ Only one proof for two inputs!
) external {
    euint32 value1 = FHE.fromExternal(input1, proof);
    euint32 value2 = FHE.fromExternal(input2, proof);  // ❌ Will fail!
}
```

**Correct**:
```solidity
function storeMultiple(
    externalEuint32 input1,
    bytes calldata proof1,  // ✅ Separate proof
    externalEuint32 input2,
    bytes calldata proof2   // ✅ Separate proof
) external {
    euint32 value1 = FHE.fromExternal(input1, proof1);
    euint32 value2 = FHE.fromExternal(input2, proof2);
}
```

**Why it matters**: Each encrypted input has a unique proof. Reusing proofs will cause validation failure.

---

### ❌ Anti-Pattern 4: Missing Input Proofs

**Wrong**:
```solidity
function store(externalEuint32 input) external {  // ❌ Missing proof parameter
    euint32 value = FHE.fromExternal(input);  // ❌ Won't compile!
}
```

**Correct**:
```solidity
function store(
    externalEuint32 input,
    bytes calldata proof  // ✅ Proof parameter required
) external {
    euint32 value = FHE.fromExternal(input, proof);
}
```

**Why it matters**: Input proofs are mandatory for security. They validate that the encrypted value was created correctly.

---

## Type Confusion

### ❌ Anti-Pattern 5: Mixing Encrypted and Plaintext

**Wrong**:
```solidity
function compare(euint32 encrypted, uint32 plaintext) external {
    // ❌ Cannot compare encrypted with plaintext directly
    if (encrypted == plaintext) { }  // Won't compile!

    // ❌ Cannot cast encrypted to plaintext
    uint32 value = uint32(encrypted);  // Won't compile!
}
```

**Correct**:
```solidity
function compare(euint32 encrypted, uint32 plaintext) external returns (ebool) {
    // ✅ Encrypt plaintext first, then compare
    euint32 encryptedPlaintext = FHE.asEuint32(plaintext);
    ebool result = FHE.eq(encrypted, encryptedPlaintext);
    return result;
}
```

**Why it matters**: Encrypted and plaintext types are incompatible by design to prevent accidental information leakage.

---

### ❌ Anti-Pattern 6: Wrong Return Type in View Functions

**Wrong**:
```solidity
// ❌ Trying to return plaintext from encrypted value
function getValue() external view returns (uint32) {
    return uint32(encryptedValue);  // Won't compile!
}

// ❌ Trying to decrypt in view function
function getDecrypted() external view returns (uint32) {
    return FHE.decrypt(encryptedValue);  // Wrong usage!
}
```

**Correct**:
```solidity
// ✅ Return encrypted handle (user decrypts client-side)
function getValue() external view returns (euint32) {
    return encryptedValue;
}

// ✅ OR use Gateway for async decryption (not view)
function requestDecryption() external returns (uint256) {
    return FHE.decrypt(encryptedValue);  // Returns request ID
}
```

**Why it matters**: Cannot decrypt to plaintext in EVM. Use client-side decryption or Gateway.

---

## Decryption Errors

### ❌ Anti-Pattern 7: Trying to Decrypt in Contract

**Wrong**:
```solidity
function getPlaintext() external view returns (uint32) {
    // ❌ FHE.decrypt is for Gateway async decryption, not direct decryption
    uint32 plain = FHE.decrypt(encryptedValue);  // Wrong!
    return plain;
}
```

**Correct for Client-Side Decryption**:
```solidity
// Contract: Return encrypted handle
function getEncrypted() external view returns (euint32) {
    return encryptedValue;
}

// Client (TypeScript):
const encrypted = await contract.getEncrypted();
const plaintext = await instance.decrypt(contractAddress, encrypted);
```

**Correct for Gateway Decryption**:
```solidity
uint256 public requestId;
uint32 public decryptedValue;

function requestDecryption() external {
    requestId = FHE.decrypt(encryptedValue);  // Async request
}

// Gateway calls this callback
function fulfillDecryption(uint256 _requestId, uint32 plaintext) external {
    require(msg.sender == gateway, "Only gateway");
    decryptedValue = plaintext;
}
```

**Why it matters**: Decryption cannot happen synchronously in EVM. Must use client-side or Gateway.

---

## Operation Mistakes

### ❌ Anti-Pattern 8: Direct Boolean Operations

**Wrong**:
```solidity
function check(euint32 value) external {
    // ❌ Cannot use encrypted value in if statement
    if (value > 10) {  // Won't compile!
        // do something
    }
}
```

**Correct**:
```solidity
function check(euint32 value) external returns (euint32) {
    // ✅ Use FHE.select for conditional logic
    ebool condition = FHE.gt(value, FHE.asEuint32(10));
    euint32 result = FHE.select(
        condition,
        FHE.asEuint32(1),  // if true
        FHE.asEuint32(0)   // if false
    );
    return result;
}
```

**Why it matters**: Cannot use encrypted values in control flow. Use `FHE.select` for conditional operations.

---

### ❌ Anti-Pattern 9: Overflow/Underflow Assumptions

**Wrong**:
```solidity
function unsafeSubtract(euint32 a, euint32 b) external {
    // ❌ Assuming a > b (cannot check!)
    euint32 result = FHE.sub(a, b);  // May underflow!
}
```

**Correct**:
```solidity
function safeSubtract(euint32 a, euint32 b) external returns (euint32) {
    // ✅ Use conditional logic to prevent underflow
    ebool canSubtract = FHE.gte(a, b);
    euint32 result = FHE.select(
        canSubtract,
        FHE.sub(a, b),      // a >= b: do subtraction
        FHE.asEuint32(0)    // a < b: return 0
    );
    FHE.allowThis(result);
    return result;
}
```

**Why it matters**: Cannot check conditions before operations. Must handle all cases using FHE.select.

---

## Gas Optimization Errors

### ❌ Anti-Pattern 10: Unnecessary Encryption

**Wrong**:
```solidity
function addConstant(euint32 value) external {
    // ❌ Re-encrypting same constant every call
    euint32 ten = FHE.asEuint32(10);  // Costs gas!
    euint32 result = FHE.add(value, ten);
}
```

**Correct**:
```solidity
euint32 private constant TEN = FHE.asEuint32(10);  // ❌ Won't work - not constant

// ✅ Better: Encrypt once in constructor
euint32 private immutable TEN;

constructor() {
    TEN = FHE.asEuint32(10);  // Encrypt once
}

function addConstant(euint32 value) external {
    euint32 result = FHE.add(value, TEN);  // Reuse encrypted constant
}
```

**Why it matters**: Encrypting constants is expensive. Do it once and reuse.

---

### ❌ Anti-Pattern 11: Redundant Permission Grants

**Wrong**:
```solidity
function store(euint32 value) external {
    storedValue = value;
    FHE.allowThis(value);
    FHE.allow(value, msg.sender);

    // Later in same function...
    FHE.allowThis(value);  // ❌ Redundant!
    FHE.allow(value, msg.sender);  // ❌ Redundant!
}
```

**Correct**:
```solidity
function store(euint32 value) external {
    storedValue = value;
    FHE.allowThis(value);  // ✅ Once is enough
    FHE.allow(value, msg.sender);
}
```

**Why it matters**: Permission grants cost gas. Grant once per handle.

---

## Storage Patterns

### ❌ Anti-Pattern 12: Storing Temporary Values

**Wrong**:
```solidity
euint32 private temp1;  // ❌ Wasting storage for temporary
euint32 private temp2;

function compute(euint32 a, euint32 b) external {
    temp1 = FHE.add(a, b);
    temp2 = FHE.mul(temp1, a);
    finalResult = FHE.sub(temp2, b);
}
```

**Correct**:
```solidity
euint32 private finalResult;  // ✅ Only store final result

function compute(euint32 a, euint32 b) external {
    euint32 temp1 = FHE.add(a, b);      // Memory
    euint32 temp2 = FHE.mul(temp1, a);  // Memory
    finalResult = FHE.sub(temp2, b);    // Storage
    FHE.allowThis(finalResult);
}
```

**Why it matters**: Storage is expensive. Use memory for intermediate values.

---

## Security Mistakes

### ❌ Anti-Pattern 13: Missing Access Control

**Wrong**:
```solidity
euint32 private sensitiveData;

// ❌ Anyone can grant permissions!
function shareData(address user) external {
    FHE.allow(sensitiveData, user);
}
```

**Correct**:
```solidity
euint32 private sensitiveData;
address private owner;

constructor() {
    owner = msg.sender;
}

// ✅ Only owner can share
function shareData(address user) external {
    require(msg.sender == owner, "Not authorized");
    FHE.allow(sensitiveData, user);
}
```

**Why it matters**: Protect permission grants with access control.

---

### ❌ Anti-Pattern 14: Public Encrypted Data Without Purpose

**Wrong**:
```solidity
// ❌ Why encrypt if everyone can decrypt?
euint32 public fullyPublicValue;

function store(externalEuint32 input, bytes calldata proof) external {
    fullyPublicValue = FHE.fromExternal(input, proof);
    FHE.allowThis(fullyPublicValue);
    // Granting to everyone defeats encryption purpose
    FHE.allow(fullyPublicValue, address(0));  // Everyone
}
```

**Correct**:
```solidity
// ✅ Either use plaintext for public data
uint32 public publicValue;

// ✅ Or encrypt with controlled access
euint32 private privateValue;

function store(externalEuint32 input, bytes calldata proof) external {
    privateValue = FHE.fromExternal(input, proof);
    FHE.allowThis(privateValue);
    FHE.allow(privateValue, msg.sender);  // Only sender
}
```

**Why it matters**: Don't encrypt data that doesn't need privacy. Wastes gas and complexity.

---

## Testing Mistakes

### ❌ Anti-Pattern 15: Not Testing Permissions

**Wrong**:
```typescript
it("should store value", async () => {
    await contract.store(encrypted, proof);
    // ❌ Not testing if permissions were set correctly
});
```

**Correct**:
```typescript
it("should store value with correct permissions", async () => {
    await contract.store(encrypted, proof);

    // ✅ Test contract can use value
    await expect(contract.useValue()).to.not.be.reverted;

    // ✅ Test user can decrypt
    const value = await contract.getValue();
    const decrypted = await instance.decrypt(contractAddress, value);
    expect(decrypted).to.equal(42);
});
```

**Why it matters**: Permission bugs are common and hard to debug in production.

---

## Summary Checklist

### ✅ DO:
- Grant `allowThis` for contract operations
- Grant `allow` for user decryption
- Provide separate proof for each input
- Use FHE operations for all comparisons
- Set permissions on all computed values
- Use conditional logic with FHE.select
- Test permission flows thoroughly
- Add access control on sensitive functions

### ❌ DON'T:
- Forget `allowThis` permissions
- Reuse input proofs
- Mix encrypted and plaintext types
- Try to decrypt in contract code
- Use encrypted values in if statements
- Store unnecessary temporary values
- Grant permissions without access control
- Skip permission tests

---

**Related Resources**:
- [Anti-Patterns Contract](../../contracts/examples/AntiPatterns.sol)
- [Understanding Handles](./handles.md)
- [Security Checklist](../../SECURITY-CHECKLIST.md)
- [Testing Guide](../../TESTING-VALIDATION-CHECKLIST.md)
