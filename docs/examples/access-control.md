# Access Control with FHE

## Overview

Access control in FHEVM determines who can view and operate on encrypted data. This guide explains FHE-specific permission patterns: `FHE.allowThis()` and `FHE.allow()`.

**Concepts**: Permissions, Access Control, Authorization, Privacy

## Permission System

### Two Types of Permissions

#### 1. Contract Permission (allowThis)

```solidity
FHE.allowThis(encryptedValue);
```

**Purpose**: Allow the smart contract to perform operations on the encrypted value

**When to use**:
- Computing on encrypted data
- Updating encrypted state
- Any contract-level operation

#### 2. User Permission (allow)

```solidity
FHE.allow(encryptedValue, userAddress);
```

**Purpose**: Allow a user to decrypt the value client-side

**When to use**:
- User needs to view their data
- Sharing data with other users
- Enabling client-side decryption

## Permission Lifecycle

### Step 1: Create Encrypted Value

```solidity
euint32 value = FHE.fromExternal(input, proof);
```

**State**: Value created, no permissions yet

### Step 2: Grant Contract Permission

```solidity
FHE.allowThis(value);
```

**State**: Contract can now operate on value

### Step 3: Grant User Permission

```solidity
FHE.allow(value, msg.sender);
```

**State**: User can now decrypt value

### Complete Pattern

```solidity
function store(externalEuint32 input, bytes calldata proof) external {
    euint32 value = FHE.fromExternal(input, proof);

    // Step 1: Grant contract permission
    FHE.allowThis(value);

    // Step 2: Grant user permission
    FHE.allow(value, msg.sender);

    storedValue = value;
}
```

## Access Control Scenarios

### Scenario 1: Personal Data

Only the owner can view:

```solidity
function storeMyData(externalEuint32 input, bytes calldata proof) external {
    euint32 data = FHE.fromExternal(input, proof);

    FHE.allowThis(data);  // Contract can compute
    FHE.allow(data, msg.sender);  // Only sender can decrypt

    userData[msg.sender] = data;
}
```

### Scenario 2: Shared Data

Multiple users can access:

```solidity
function shareData(address recipient) external {
    euint32 sharedData = userData[msg.sender];

    // Grant recipient permission
    FHE.allow(sharedData, recipient);
}
```

### Scenario 3: Role-Based Access

Only authorized roles can access:

```solidity
function grantAccess(address authorized) external {
    require(hasRole(ADMIN_ROLE, msg.sender), "Not admin");

    euint32 restrictedData = sensitiveData[msg.sender];

    // Grant permission to authorized address
    FHE.allow(restrictedData, authorized);
}
```

### Scenario 4: Time-Limited Access

Access expires after duration:

```solidity
mapping(address => uint256) public accessExpiry;

function grantTemporaryAccess(address user, uint256 durationSeconds) external {
    euint32 data = userData[msg.sender];
    FHE.allow(data, user);

    accessExpiry[user] = block.timestamp + durationSeconds;
}

function revokeExpiredAccess(address user) external {
    require(block.timestamp > accessExpiry[user], "Still valid");
    // User must request new access
}
```

## FHE.allowTransient()

The transient variant allows temporary access:

```solidity
// Temporary access for this transaction only
FHE.allowTransient(value, recipient);
```

**Use Cases**:
- Single-use decryption
- Temporary computation sharing
- Flash loan-like patterns

## Permission Patterns

### Pattern 1: Owner-Only Access

```solidity
euint32 private mySecret;
address public owner;

function updateSecret(externalEuint32 input, bytes calldata proof) external {
    require(msg.sender == owner, "Only owner");

    euint32 newSecret = FHE.fromExternal(input, proof);
    mySecret = newSecret;

    FHE.allowThis(newSecret);
    FHE.allow(newSecret, owner);  // Only owner
}

function getSecret() external view returns (euint32) {
    require(msg.sender == owner, "Only owner");
    return mySecret;
}
```

### Pattern 2: Multi-User Access

```solidity
mapping(address => euint32) private balances;
mapping(address => mapping(address => bool)) private approved;

function approveUser(address user) external {
    approved[msg.sender][user] = true;
}

function checkBalance(address owner) external view returns (euint32) {
    require(
        msg.sender == owner || approved[owner][msg.sender],
        "Not authorized"
    );

    return balances[owner];
}
```

### Pattern 3: Conditional Access

```solidity
function grantAccessIf(
    address recipient,
    euint32 secretValue,
    uint32 threshold
) external {
    // Only grant if user meets condition
    // (In production, use FHE.select for encrypted conditions)

    FHE.allow(secretValue, recipient);
}
```

### Pattern 4: Graduated Access

```solidity
enum AccessLevel { NONE, READ, WRITE, ADMIN }

mapping(address => AccessLevel) public accessLevel;

function grantAccess(address user, AccessLevel level) external {
    require(msg.sender == owner, "Only owner");

    accessLevel[user] = level;

    if (level == AccessLevel.READ) {
        FHE.allow(secretData, user);
    }
    // WRITE and ADMIN might have different behaviors
}
```

## Best Practices

### ✅ DO

1. **Always call `allowThis`** before contract operations
2. **Grant minimal permissions** needed
3. **Document access rules** in comments
4. **Audit permission grants** in sensitive functions
5. **Use roles** for complex access patterns
6. **Test permission flows** thoroughly

### ❌ DON'T

1. **Forget `allowThis`** for contract operations
2. **Grant unnecessary permissions** to everyone
3. **Assume permissions transfer** to computed values
4. **Expose permission logic** in public functions unnecessarily
5. **Mix permission granting** with business logic
6. **Skip permission checks** in critical functions

## Testing Permissions

```typescript
describe("Access Control", () => {
  it("should grant contract permission", async () => {
    await contract.store(encrypted, proof);

    // Contract should be able to use value
    await expect(contract.compute())
      .to.not.be.reverted;
  });

  it("should grant user permission", async () => {
    await contract.connect(user).store(encrypted, proof);

    // User should be able to decrypt
    const encryptedValue = await contract.getMyData();
    const decrypted = await instance.decrypt(
      contractAddress,
      encryptedValue
    );
    expect(decrypted).to.equal(expectedValue);
  });

  it("should prevent unauthorized access", async () => {
    await contract.connect(user1).store(encrypted, proof);

    // User2 should not be able to decrypt
    const encryptedValue = await contract.connect(user1).getMyData();

    await expect(
      instance.decrypt(contractAddress, encryptedValue)
    ).to.be.reverted;
  });

  it("should handle permission grants", async () => {
    await contract.connect(user1).store(encrypted, proof);

    // Grant user2 permission
    await contract.connect(user1).shareWith(user2.address);

    // User2 should now be able to decrypt
    const encryptedValue = await contract.connect(user2).getSharedData(user1.address);
    const decrypted = await instance.decrypt(
      contractAddress,
      encryptedValue
    );
    expect(decrypted).to.equal(expectedValue);
  });
});
```

## Common Mistakes

### ❌ Mistake 1: Forgetting Contract Permission

```solidity
// WRONG
function processData(externalEuint32 input, bytes calldata proof) external {
    euint32 data = FHE.fromExternal(input, proof);
    FHE.allow(data, msg.sender);  // Only user permission
    // Missing: FHE.allowThis(data);

    euint32 result = FHE.add(data, FHE.asEuint32(10));  // ❌ Will fail!
}
```

### ❌ Mistake 2: Not Granting Permission on Computed Values

```solidity
// WRONG
function compute(euint32 a, euint32 b) external {
    euint32 sum = FHE.add(a, b);
    storedValue = sum;
    // Missing permissions on sum!
}

function useValue() external {
    // ❌ Will fail - no permission on sum
    euint32 doubled = FHE.mul(storedValue, FHE.asEuint32(2));
}
```

### ❌ Mistake 3: Over-Sharing

```solidity
// WRONG - Grants access to everyone
function getPublicData() external view returns (euint32) {
    euint32 data = secretData;
    FHE.allow(data, msg.sender);  // Anyone can call this
    return data;
}

// CORRECT - Check access first
function getPublicData() external view returns (euint32) {
    require(isAuthorized[msg.sender], "Not authorized");
    return secretData;
}
```

## Security Implications

### Privacy

Permissions are your primary privacy tool:
- Without correct permissions, data remains private
- Overly broad permissions reduce privacy
- Audit all permission grants

### Access Control

Permissions implement access control:
- Check authorization before granting
- Validate user identity
- Maintain permission logs

### Compliance

For regulated data:
- Document all permission grants
- Maintain audit trails
- Implement revocation mechanisms

## Advanced Patterns

### Multi-Signature Permission

```solidity
function grantMultiSigAccess(address user, bytes[] calldata signatures) external {
    // Verify M-of-N signatures
    require(verifySignatures(signatures), "Invalid signatures");

    // Grant permission only after verification
    FHE.allow(sensitiveData, user);
}
```

### Time-Locked Permissions

```solidity
struct PermissionLock {
    address user;
    uint256 unlockTime;
    bool executed;
}

function executeTimeLockedPermission(PermissionLock calldata lock) external {
    require(block.timestamp >= lock.unlockTime, "Not unlocked yet");
    require(!lock.executed, "Already executed");

    FHE.allow(sensitiveData, lock.user);
}
```

### Emergency Access Revocation

```solidity
function revokeAccessEmergency(address compromisedUser) external {
    require(msg.sender == emergencyAdmin, "Only emergency admin");

    // Create new encrypted value with different permissions
    euint32 newSecret = FHE.fromExternal(input, proof);
    FHE.allowThis(newSecret);

    // Compromised user no longer has access
    sensitiveData = newSecret;
}
```

## Summary

### Key Points

- 🔑 Two permission types: `allowThis()` and `allow()`
- 🎯 Always grant contract permission for operations
- 👥 Grant user permission for decryption
- 🆕 New handle = new permissions needed
- 🔒 Audit all permission grants
- 📋 Test permission flows thoroughly

### Checklist

- [ ] Grant `allowThis` for all contract operations
- [ ] Grant `allow` for user decryption
- [ ] Check permissions on all computed values
- [ ] Implement access control before permission grants
- [ ] Test unauthorized access prevention
- [ ] Document permission model
- [ ] Regular permission audits

---

**Related Resources**:
- [AccessControlExample Contract](../../contracts/examples/AccessControlExample.sol)
- [Anti-Patterns](./anti-patterns.md)
- [Understanding Handles](../../docs/concepts/handles.md)
- [Security Checklist](../../SECURITY-CHECKLIST.md)
