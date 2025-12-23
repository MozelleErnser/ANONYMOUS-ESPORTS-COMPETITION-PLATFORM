# Troubleshooting Guide

Complete guide for solving common issues when developing FHEVM applications.

---

## Table of Contents

1. [Setup Issues](#setup-issues)
2. [Compilation Errors](#compilation-errors)
3. [Test Failures](#test-failures)
4. [Deployment Problems](#deployment-problems)
5. [Permission Errors](#permission-errors)
6. [Encryption Issues](#encryption-issues)
7. [Gas Problems](#gas-problems)
8. [Network Issues](#network-issues)

---

## Setup Issues

### Issue: `npm install` fails

**Symptoms**:
```bash
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions**:

1. **Clear cache and retry**:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

2. **Use legacy peer deps**:
```bash
npm install --legacy-peer-deps
```

3. **Check Node.js version**:
```bash
node --version  # Should be >=18.0.0
npm --version   # Should be >=9.0.0
```

4. **Update npm**:
```bash
npm install -g npm@latest
```

---

### Issue: TypeScript errors after install

**Symptoms**:
```
Cannot find module '@nomicfoundation/hardhat-toolbox'
```

**Solution**:
```bash
npm install --save-dev @nomicfoundation/hardhat-toolbox
npm install --save-dev typescript ts-node
```

---

### Issue: Hardhat not found

**Symptoms**:
```bash
hardhat: command not found
```

**Solutions**:

1. **Install hardhat globally** (not recommended):
```bash
npm install -g hardhat
```

2. **Use npx** (recommended):
```bash
npx hardhat compile
```

3. **Use npm scripts**:
```bash
npm run compile
npm run test
```

---

## Compilation Errors

### Issue: "SPDX license identifier not provided"

**Symptoms**:
```
Warning: SPDX license identifier not provided in source file
```

**Solution**:
Add to top of Solidity file:
```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;
```

---

### Issue: FHE import not found

**Symptoms**:
```
Error: Cannot find module '@fhevm/solidity/lib/FHE.sol'
```

**Solutions**:

1. **Install @fhevm/solidity**:
```bash
npm install @fhevm/solidity@^0.9.1
```

2. **Check hardhat.config.ts**:
```typescript
import "@nomicfoundation/hardhat-toolbox";
// Make sure all imports are present
```

3. **Clean and recompile**:
```bash
npm run clean
npm run compile
```

---

### Issue: Wrong Solidity version

**Symptoms**:
```
Error: Source file requires different compiler version
```

**Solution**:
Update `hardhat.config.ts`:
```typescript
solidity: {
  version: "0.8.24",  // Match contract version
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
}
```

---

## Test Failures

### Issue: "Instance not initialized"

**Symptoms**:
```
TypeError: Cannot read property 'createEncryptedInput' of undefined
```

**Solution**:
Initialize fhevmjs instance in test:
```typescript
import { createInstance } from "fhevmjs";

let instance: any;

before(async function () {
  instance = await createInstance({
    chainId: 31337,
    networkUrl: "http://localhost:8545",
    gatewayUrl: "https://gateway.sepolia.zama.ai",
  });
});
```

---

### Issue: "Network connection failed"

**Symptoms**:
```
Error: could not detect network
```

**Solutions**:

1. **Start local node**:
```bash
npm run node
# In another terminal:
npm run test
```

2. **Check network config**:
```typescript
networks: {
  hardhat: {
    chainId: 31337,
  },
}
```

3. **Use hardhat network**:
```bash
npm run test --network hardhat
```

---

### Issue: Test timeout

**Symptoms**:
```
Error: Timeout of 2000ms exceeded
```

**Solutions**:

1. **Increase timeout**:
```typescript
describe("MyTest", function () {
  this.timeout(60000); // 60 seconds

  it("should work", async function () {
    // ...
  });
});
```

2. **Optimize test**:
```typescript
// Use Promise.all for parallel operations
await Promise.all([
  contract.function1(),
  contract.function2(),
]);
```

---

## Deployment Problems

### Issue: "Insufficient funds"

**Symptoms**:
```
Error: insufficient funds for intrinsic transaction cost
```

**Solutions**:

1. **Check balance**:
```typescript
const balance = await ethers.provider.getBalance(deployer.address);
console.log("Balance:", ethers.formatEther(balance));
```

2. **Get testnet tokens**:
- Sepolia: https://sepoliafaucet.com/
- Use faucets in Discord/Twitter

3. **Check gas price**:
```typescript
const gasPrice = await ethers.provider.getFeeData();
console.log("Gas price:", gasPrice);
```

---

### Issue: "Contract already deployed"

**Symptoms**:
```
Error: A contract has already been deployed at this address
```

**Solutions**:

1. **Clean artifacts**:
```bash
npm run clean
npm run compile
```

2. **Use different nonce**:
```typescript
const tx = await factory.deploy({ nonce: specificNonce });
```

3. **Deploy to different address**:
Use different deployer account or network

---

### Issue: "Gas estimation failed"

**Symptoms**:
```
Error: cannot estimate gas; transaction may fail
```

**Solutions**:

1. **Specify gas limit manually**:
```typescript
const tx = await contract.function({
  gasLimit: 3000000,
});
```

2. **Check function requirements**:
```solidity
// Make sure require statements can pass
require(condition, "Error message");
```

3. **Test function first**:
```typescript
// Call statically first to check for revert
await contract.function.staticCall();
// Then send transaction
await contract.function();
```

---

## Permission Errors

### Issue: "Permission denied" on FHE operations

**Symptoms**:
```
Error: Permission denied for encrypted value
```

**Solutions**:

1. **Add allowThis**:
```solidity
euint32 value = FHE.fromExternal(input, proof);
FHE.allowThis(value);  // ← Add this
```

2. **Grant user permission**:
```solidity
FHE.allow(value, msg.sender);  // For decryption
```

3. **Check permission on computed values**:
```solidity
euint32 result = FHE.add(a, b);
FHE.allowThis(result);  // ← New handle needs permission
```

---

### Issue: "Cannot decrypt value"

**Symptoms**:
User unable to decrypt in client

**Solutions**:

1. **Grant permission in contract**:
```solidity
FHE.allow(encryptedValue, userAddress);
```

2. **Check user has permission**:
```typescript
// Try decryption with fhevmjs
try {
  const decrypted = await instance.decrypt(
    contractAddress,
    encryptedHandle
  );
} catch (error) {
  console.error("Decryption failed:", error);
}
```

3. **Verify handle is correct**:
```typescript
const handle = await contract.getValue();
console.log("Handle:", handle);
```

---

## Encryption Issues

### Issue: "Invalid input proof"

**Symptoms**:
```
Error: Input proof verification failed
```

**Solutions**:

1. **Generate fresh proof**:
```typescript
const input = instance.createEncryptedInput(
  contractAddress,
  userAddress
);
input.add32(value);
const encrypted = await input.encrypt();
// Use encrypted.handles[0] and encrypted.inputProof
```

2. **Don't reuse proofs**:
```typescript
// WRONG:
const encrypted = await input.encrypt();
await contract.store1(encrypted.handles[0], encrypted.inputProof);
await contract.store2(encrypted.handles[0], encrypted.inputProof); // ❌

// CORRECT:
const enc1 = await input1.encrypt();
const enc2 = await input2.encrypt();
await contract.store1(enc1.handles[0], enc1.inputProof);
await contract.store2(enc2.handles[0], enc2.inputProof);
```

3. **Check proof format**:
```typescript
console.log("Proof length:", encrypted.inputProof.length);
// Should be non-empty hex string
```

---

### Issue: "Cannot encrypt value"

**Symptoms**:
```
Error: Encryption failed
```

**Solutions**:

1. **Check instance initialization**:
```typescript
const instance = await createInstance({
  chainId: 11155111,  // Correct chain ID
  networkUrl: RPC_URL,
  gatewayUrl: GATEWAY_URL,
});
```

2. **Verify value type**:
```typescript
// For euint32, use add32
input.add32(42);

// For euint64, use add64
input.add64(BigInt(100));

// For euint8, use add8
input.add8(10);
```

3. **Check network connectivity**:
```typescript
try {
  await ethers.provider.getBlockNumber();
} catch (error) {
  console.error("Network not reachable");
}
```

---

## Gas Problems

### Issue: "Transaction ran out of gas"

**Symptoms**:
```
Error: Transaction ran out of gas
```

**Solutions**:

1. **Increase gas limit**:
```typescript
const tx = await contract.function({
  gasLimit: 5000000,  // Increase as needed
});
```

2. **Optimize contract**:
```solidity
// Use memory for temporary values
euint32 temp = FHE.add(a, b);  // Memory
result = temp;  // Storage

// Don't store unnecessary values
```

3. **Batch operations**:
```solidity
// Instead of multiple transactions:
function batchUpdate(uint256[] calldata values) external {
  for (uint i = 0; i < values.length; i++) {
    // Process all in one tx
  }
}
```

---

### Issue: "Gas estimation too high"

**Symptoms**:
```
Warning: Gas estimation returned very high value
```

**Solutions**:

1. **Review FHE operations**:
```solidity
// FHE operations are expensive
// Minimize number of operations
euint32 result = FHE.add(FHE.mul(a, b), c);
// Better than three separate operations
```

2. **Use appropriate types**:
```solidity
// Use smallest type needed
euint8 small = FHE.asEuint8(10);   // Cheaper
euint256 large = FHE.asEuint256(10); // More expensive
```

3. **Profile gas usage**:
```bash
npm run gas-report
```

---

## Network Issues

### Issue: "Network request failed"

**Symptoms**:
```
Error: Network request failed with status 429
```

**Solutions**:

1. **Use different RPC**:
```typescript
// .env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
# Or use Infura, QuickNode, etc.
```

2. **Add retry logic**:
```typescript
async function deployWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await contract.deploy();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

3. **Check rate limits**:
```typescript
// Add delay between requests
await new Promise(r => setTimeout(r, 1000));
```

---

### Issue: "Nonce too low"

**Symptoms**:
```
Error: nonce has already been used
```

**Solutions**:

1. **Get latest nonce**:
```typescript
const nonce = await signer.getNonce();
const tx = await contract.function({ nonce });
```

2. **Reset local state**:
```bash
# If using Hardhat
npm run clean
npm run node
```

3. **Wait for pending tx**:
```typescript
const tx = await contract.function();
await tx.wait();  // Wait before next tx
```

---

## Common Error Messages

### "FHE.allowThis not called"

**Cause**: Contract doesn't have permission for encrypted value

**Fix**:
```solidity
FHE.allowThis(encryptedValue);
```

---

### "View functions cannot modify state"

**Cause**: Trying to call `allow()` in view function

**Fix**:
```solidity
// Don't use view
function getValue() external returns (euint32) {  // Not view
  FHE.allow(value, msg.sender);
  return value;
}
```

---

### "Cannot convert encrypted to plaintext"

**Cause**: Trying to cast encrypted to plaintext

**Fix**:
```solidity
// WRONG:
uint32 plain = uint32(encrypted);

// CORRECT:
// Use FHE.decrypt() for Gateway async decryption
// OR user decrypts client-side
```

---

### "Input proof verification failed"

**Cause**: Proof doesn't match ciphertext

**Fix**:
```typescript
// Generate new proof for each value
const enc1 = await encrypt(value1);  // Own proof
const enc2 = await encrypt(value2);  // Own proof
```

---

## Getting More Help

### Check Documentation
- [FAQ](./FAQ.md)
- [Security Checklist](./SECURITY-CHECKLIST.md)
- [Developer Guide](./DEVELOPER-GUIDE.md)

### Community Support
- **Discord**: [https://discord.com/invite/zama](https://discord.com/invite/zama)
- **Forum**: [https://www.zama.ai/community](https://www.zama.ai/community)
- **GitHub Issues**: Report bugs and request features

### Debug Tools

1. **Enable verbose logging**:
```typescript
// In hardhat.config.ts
networks: {
  hardhat: {
    loggingEnabled: true,
  },
}
```

2. **Use console.log in contracts**:
```solidity
import "hardhat/console.sol";

console.log("Value:", someValue);
```

3. **Run tests in debug mode**:
```bash
DEBUG=* npm run test
```

---

## Prevention Checklist

Before deploying:

- [ ] All tests pass
- [ ] No compilation warnings
- [ ] Gas costs reviewed
- [ ] Permissions set correctly
- [ ] Input proofs generated properly
- [ ] Error handling implemented
- [ ] Security checklist completed
- [ ] Documentation updated

---

**Need help?** Join our [Discord](https://discord.com/invite/zama) or check the [FAQ](./FAQ.md)!
