# Understanding Handles in FHEVM

## What Are Handles?

In FHEVM, a **handle** is a reference to an encrypted value stored in the FHE system. Think of it as a pointer or identifier for encrypted data, similar to how a memory address points to data in RAM.

```solidity
euint32 private encryptedValue;  // This is a handle to encrypted data
```

## Why Handles Exist

Handles exist because:

1. **Encrypted values are large**: FHE ciphertexts can be several KB
2. **Storage efficiency**: Storing full ciphertexts on-chain would be prohibitively expensive
3. **Computation abstraction**: Operations work on handles, not raw ciphertexts
4. **Permission management**: Handles are used to grant/revoke access

## Handle Structure

```
Handle (32 bytes)
├── Type Information (encrypted type: euint8, euint32, etc.)
├── Value Reference (points to actual ciphertext)
└── Metadata (permission flags, etc.)
```

### Example

```solidity
euint32 handle;  // 32-byte identifier
// Behind the scenes: points to large ciphertext in FHE coprocessor
```

## How Handles Are Generated

### 1. From External Input

```solidity
function storeValue(externalEuint32 input, bytes calldata proof) external {
    // FHE.fromExternal generates a new handle
    euint32 handle = FHE.fromExternal(input, proof);
    // 'handle' now references the encrypted value
}
```

**Process**:
```
Client Encrypts Value (42)
        ↓
Ciphertext + Proof
        ↓
Submit to Contract
        ↓
FHE.fromExternal()
        ↓
Handle Generated → points to ciphertext in FHE system
```

### 2. From Operations

```solidity
function add(euint32 a, euint32 b) public returns (euint32) {
    // FHE.add creates NEW handle pointing to result
    euint32 resultHandle = FHE.add(a, b);
    return resultHandle;  // Different from 'a' and 'b'
}
```

**Important**: Every operation creates a **new handle**!

```
Handle A (42) + Handle B (10)
        ↓
    FHE.add()
        ↓
Handle C (52)  ← New handle!
```

### 3. From Constants

```solidity
function createConstant() public {
    // FHE.asEuint32 converts plaintext to encrypted
    euint32 handle = FHE.asEuint32(100);
    // New handle created for encrypted constant
}
```

## Handle Lifecycle

### 1. Creation

```solidity
// Method 1: From user input
euint32 h1 = FHE.fromExternal(input, proof);

// Method 2: From operation
euint32 h2 = FHE.add(h1, FHE.asEuint32(5));

// Method 3: From constant
euint32 h3 = FHE.asEuint32(42);
```

### 2. Storage

```solidity
contract Storage {
    euint32 private storedHandle;  // Stored in contract storage

    function store(euint32 handle) external {
        storedHandle = handle;  // Handle stored (32 bytes)
    }
}
```

### 3. Operations

```solidity
function compute(euint32 a, euint32 b) public {
    euint32 sum = FHE.add(a, b);      // New handle
    euint32 product = FHE.mul(a, b);  // Another new handle
    euint32 max = FHE.max(a, b);      // Yet another new handle
}
```

### 4. Permission Management

```solidity
function grantPermissions(euint32 handle, address user) internal {
    FHE.allowThis(handle);  // Contract can use handle
    FHE.allow(handle, user);  // User can decrypt via handle
}
```

### 5. Decryption

```typescript
// Client-side: decrypt via handle
const handleValue = await contract.getHandle();
const plaintext = await instance.decrypt(contractAddress, handleValue);
```

## Handle Properties

### Immutability

Handles are **immutable references**:

```solidity
euint32 h1 = FHE.asEuint32(42);
euint32 h2 = FHE.add(h1, FHE.asEuint32(1));
// h1 still points to 42
// h2 is NEW handle pointing to 43
```

### Uniqueness

Every operation creates a unique handle:

```solidity
euint32 a = FHE.asEuint32(5);
euint32 b = FHE.asEuint32(5);
// a ≠ b (different handles, even if same value!)
```

### Type Safety

Handles are type-specific:

```solidity
euint8 small = FHE.asEuint8(5);
euint32 large = FHE.asEuint32(5);
// small and large are different types
// Cannot mix in operations without explicit casting
```

## Symbolic Execution

FHEVM uses **symbolic execution** for handle operations:

```solidity
function example() public {
    euint32 a = FHE.asEuint32(10);
    euint32 b = FHE.asEuint32(20);
    euint32 sum = FHE.add(a, b);

    // Behind the scenes:
    // 1. 'a' and 'b' are symbolic references
    // 2. FHE.add doesn't compute immediately
    // 3. Computation happens in FHE coprocessor
    // 4. 'sum' is symbolic handle to result
}
```

**Execution Flow**:

```
Contract Call
     ↓
Symbolic Handles Created
     ↓
Operations Recorded
     ↓
Sent to FHE Coprocessor
     ↓
Actual FHE Computation
     ↓
Result Handle Returned
```

## Handle Permissions

### Permission System

Every handle has an associated **permission list**:

```
Handle → Permission List
├── Contract Address (if FHE.allowThis called)
├── User Address 1 (if FHE.allow called)
├── User Address 2
└── ...
```

### Granting Permissions

```solidity
function example(euint32 handle) external {
    // Grant contract permission
    FHE.allowThis(handle);
    // Contract can now use 'handle' in future operations

    // Grant user permission
    FHE.allow(handle, msg.sender);
    // User can now decrypt 'handle' client-side
}
```

### Permission Inheritance

**Important**: Permissions do NOT transfer to new handles!

```solidity
euint32 a = FHE.asEuint32(10);
FHE.allowThis(a);  // Permission on 'a'

euint32 b = FHE.add(a, FHE.asEuint32(5));
// 'b' has NO permissions yet!
// Must explicitly grant:
FHE.allowThis(b);
```

## Common Handle Patterns

### Pattern 1: Store and Retrieve

```solidity
euint32 private storedHandle;

function store(externalEuint32 input, bytes calldata proof) external {
    euint32 handle = FHE.fromExternal(input, proof);
    storedHandle = handle;
    FHE.allowThis(handle);
    FHE.allow(handle, msg.sender);
}

function retrieve() external view returns (euint32) {
    return storedHandle;
}
```

### Pattern 2: Compute and Update

```solidity
euint32 private value;

function increment(uint32 amount) external {
    euint32 newValue = FHE.add(value, FHE.asEuint32(amount));
    value = newValue;  // Update to new handle
    FHE.allowThis(newValue);  // New handle needs permissions!
}
```

### Pattern 3: Temporary Handles

```solidity
function complexComputation(euint32 a, euint32 b) public returns (euint32) {
    euint32 temp1 = FHE.add(a, b);        // Temporary handle
    euint32 temp2 = FHE.mul(temp1, a);    // Another temporary
    euint32 result = FHE.sub(temp2, b);   // Final result

    // Only final result needs permissions
    FHE.allowThis(result);
    return result;
}
```

### Pattern 4: Conditional Handles

```solidity
function conditional(euint32 condition, euint32 a, euint32 b)
    public returns (euint32) {
    // FHE.select returns handle to selected value
    euint32 result = FHE.select(
        FHE.gt(condition, FHE.asEuint32(0)),
        a,
        b
    );
    FHE.allowThis(result);
    return result;
}
```

## Handle Storage Costs

### On-Chain Storage

```solidity
euint32 private handle;  // 32 bytes = 1 slot
```

**Cost**: ~20,000 gas (SSTORE)

### Off-Chain Ciphertext

The actual encrypted data lives off-chain:
- Stored in FHE coprocessor
- Accessed via handle
- Much larger (KB)
- No direct gas cost

## Debugging Handles

### Checking Handle Value

```solidity
// In tests (with fhevmjs)
const handleValue = await contract.getHandle();
console.log("Handle:", handleValue);
// Output: 0x1234...abcd (32-byte hex)
```

### Tracing Handle Creation

```solidity
event HandleCreated(euint32 indexed handle);

function createHandle(uint32 value) external {
    euint32 handle = FHE.asEuint32(value);
    emit HandleCreated(handle);
    return handle;
}
```

## Common Mistakes

### ❌ Mistake 1: Forgetting New Handles

```solidity
// WRONG
euint32 value = FHE.asEuint32(10);
FHE.allowThis(value);

value = FHE.add(value, FHE.asEuint32(5));
// Forgot: FHE.allowThis(value);  ← New handle needs permission!
```

### ❌ Mistake 2: Reusing Old Permissions

```solidity
// WRONG
euint32 a = FHE.asEuint32(10);
FHE.allow(a, user);

euint32 b = FHE.mul(a, FHE.asEuint32(2));
// User can decrypt 'a' but NOT 'b'!
```

### ❌ Mistake 3: Comparing Handles Directly

```solidity
// WRONG
euint32 a = FHE.asEuint32(5);
euint32 b = FHE.asEuint32(5);
if (a == b) { }  // Won't compile! Different handles!

// CORRECT
ebool isEqual = FHE.eq(a, b);  // Compare encrypted values
```

## Best Practices

### ✅ DO

1. **Grant permissions immediately** after creating handles
2. **Remember new handles** from operations need new permissions
3. **Use FHE operations** for all handle comparisons
4. **Store handles efficiently** (32 bytes each)
5. **Document handle lifecycle** in your code

### ❌ DON'T

1. **Don't forget `allowThis`** for contract operations
2. **Don't assume permission transfer** to new handles
3. **Don't compare handles directly** (use FHE.eq)
4. **Don't try to decrypt handles** in contract code
5. **Don't modify handles** (they're references, not values)

## Summary

Handles are fundamental to FHEVM:

- 🔗 **References** to encrypted data
- 🆕 **New handle** created by every operation
- 🔒 **Permission-based** access control
- 💾 **Efficient storage** (32 bytes)
- 🎯 **Type-safe** and immutable
- 🔄 **Lifecycle** requires careful management

Understanding handles is crucial for building correct FHEVM applications!

---

**Related Documentation**:
- [FHE Counter Example](../examples/fhe-counter.md)
- [Access Control](./access-control.md)
- [Anti-Patterns](./anti-patterns.md)
