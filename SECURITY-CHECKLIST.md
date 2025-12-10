# Anonymous Esports - Security Checklist

Comprehensive security checklist for smart contract and application development.

## Pre-Development Security Review

Before writing code, consider:

- [ ] What are the threat vectors?
- [ ] What data needs protection?
- [ ] What could cause financial loss?
- [ ] Who can access sensitive data?
- [ ] How can contracts be abused?

## Smart Contract Security

### Input Validation

- [ ] All external inputs are validated
- [ ] No unchecked external calls
- [ ] Function parameters have bounds checks
- [ ] Addresses are not zero address
- [ ] Array indices are within bounds

**Code Example**:
```solidity
function vote(uint256 competitionId, uint256 choice) external {
    // Validate inputs
    require(competitionId > 0, "Invalid competition");
    require(choice < maxChoices, "Invalid choice");
    require(msg.sender != address(0), "Invalid voter");

    // Process vote
}
```

### State Management

- [ ] State variables have correct visibility (private/public)
- [ ] State transitions are valid
- [ ] No uninitialized state
- [ ] Immutable values are marked as constant
- [ ] State changes are logged via events

**Code Example**:
```solidity
contract VotingContract {
    // ✓ CORRECT
    uint256 private constant MAX_VOTERS = 1000;
    euint32 private encryptedVotes;

    event VoteCast(indexed address voter, uint256 timestamp);

    function vote() external {
        // ... voting logic ...
        emit VoteCast(msg.sender, block.timestamp);
    }
}
```

### Access Control

- [ ] Functions have appropriate modifiers
- [ ] Owner-only functions are protected
- [ ] Role-based access is enforced
- [ ] No backdoors or bypass mechanisms
- [ ] Constructor only callable once

**Code Example**:
```solidity
modifier onlyVoter() {
    require(voters[msg.sender], "Not a voter");
    _;
}

modifier onlyOrganizer() {
    require(organizers[msg.sender], "Not organizer");
    _;
}

function registerVoter(address voter) external onlyOrganizer {
    voters[voter] = true;
}
```

### FHE-Specific Security

**Critical: Always use both permissions**

- [ ] FHE.allowThis() is called for contract access
- [ ] FHE.allow() is called for user access
- [ ] Permissions are called in correct order
- [ ] Input proofs are verified
- [ ] Encryption binding is correct

**Code Example**:
```solidity
// ✓ CORRECT
function vote(externalEuint32 voteInput, bytes calldata proof) external {
    euint32 vote = FHE.fromExternal(voteInput, proof);

    encryptedVotes = FHE.add(encryptedVotes, vote);

    // Must call allowThis first
    FHE.allowThis(encryptedVotes);

    // Then allow user
    FHE.allow(encryptedVotes, msg.sender);
}
```

**❌ Common Mistakes**:
- Missing FHE.allowThis()
- Missing FHE.allow()
- Wrong order (allow before allowThis)
- Not binding encryption to correct signer

### Arithmetic Security

- [ ] No integer overflow/underflow (use uint types properly)
- [ ] Safe math for critical calculations
- [ ] Division by zero checks
- [ ] Rounding is intentional
- [ ] Large number handling is correct

**Code Example**:
```solidity
// ✓ CORRECT - Solidity 0.8.x has overflow checks
function addVotes(uint256 a, uint256 b) external pure returns (uint256) {
    return a + b;  // Automatically reverts on overflow
}

// ✓ CORRECT - Explicit checks when needed
function safeMultiply(uint256 a, uint256 b) external pure returns (uint256) {
    require(a == 0 || b == 0 || (a * b) / a == b, "Overflow");
    return a * b;
}
```

### Reentrancy Prevention

- [ ] No external calls before state changes
- [ ] State changes before returning to caller
- [ ] No delegatecall to untrusted contracts
- [ ] Guard against call attacks

**Code Example**:
```solidity
// ✓ CORRECT - State change before external call
function vote() external {
    hasVoted[msg.sender] = true;  // Set first
    emit VoteCast(msg.sender);     // Then event
    // Safe even if someone calls back
}

// ❌ WRONG - External call before state change
function vote() external {
    notify(msg.sender);            // External call first
    hasVoted[msg.sender] = true;   // State change after
    // Attacker could call again
}
```

### Gas Limit Attacks

- [ ] Loops don't unbounded iterations
- [ ] State writes not in loops
- [ ] No expensive operations per voter
- [ ] Reasonable gas limits set

**Code Example**:
```solidity
// ✓ CORRECT - Batch state write
euint32 temp = FHE.asEuint32(0);
for (uint i = 0; i < voters.length; i++) {
    temp = FHE.add(temp, votes[voters[i]]);  // No state writes
}
totalVotes = temp;  // Single state write
FHE.allowThis(totalVotes);

// ❌ WRONG - State write in loop
for (uint i = 0; i < voters.length; i++) {
    totalVotes = FHE.add(totalVotes, votes[voters[i]]);  // Too expensive!
}
```

### Encoding/Decoding Security

- [ ] Input data is properly validated
- [ ] Encoded data is trusted source
- [ ] Decoding errors are handled
- [ ] No assumptions about data format

**Code Example**:
```solidity
// ✓ CORRECT - Validate decoded data
bytes memory encodedData = abi.encode(value);
(uint256 decoded) = abi.decode(encodedData, (uint256));
require(decoded < MAX_VALUE, "Invalid decoded value");
```

## Frontend Security

### Authentication & Authorization

- [ ] Users are properly authenticated
- [ ] Permissions are verified before actions
- [ ] Session tokens are securely stored
- [ ] Token expiration is handled
- [ ] Logout properly clears session

**Code Example**:
```javascript
// ✓ CORRECT - Verify user before sensitive action
async function castVote(competitionId, vote) {
    // Verify user is authenticated
    if (!user || !user.authenticated) {
        throw new Error("User not authenticated");
    }

    // Check user has permission
    if (!user.permissions.includes("vote")) {
        throw new Error("User cannot vote");
    }

    // Proceed with vote
    return await submitVote(competitionId, vote);
}
```

### Input Validation

- [ ] User input is validated client-side
- [ ] Data types are checked
- [ ] Lengths are bounded
- [ ] Special characters are escaped
- [ ] No eval() or dynamic code execution

**Code Example**:
```javascript
// ✓ CORRECT - Validate input
function validateVoteChoice(choice) {
    // Type check
    if (typeof choice !== "number") {
        throw new Error("Choice must be number");
    }

    // Range check
    if (choice < 0 || choice >= maxChoices) {
        throw new Error("Invalid choice");
    }

    return true;
}
```

### Wallet Security

- [ ] Private keys never stored locally
- [ ] MetaMask/wallet integration is correct
- [ ] Seed phrases not requested
- [ ] Users understand transaction details
- [ ] Failed transactions are handled

**Code Example**:
```javascript
// ✓ CORRECT - Secure wallet usage
async function connectWallet() {
    try {
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });

        // Verify returned account is valid
        if (!ethers.isAddress(accounts[0])) {
            throw new Error("Invalid account returned");
        }

        return accounts[0];
    } catch (error) {
        console.error("Connection failed:", error);
        // Show user-friendly error
    }
}
```

### Data Storage

- [ ] No sensitive data in localStorage
- [ ] Encrypted data for sensitive info
- [ ] Session storage for temporary data
- [ ] Clear sensitive data on logout
- [ ] No data in URL parameters

**Code Example**:
```javascript
// ✓ CORRECT - Secure data storage
function storeUserData(user) {
    // Store only public data
    localStorage.setItem("userAddress", user.address);

    // Keep sensitive data in memory only
    window.currentUser = {
        address: user.address,
        permissions: user.permissions,
        // NOT: privateKey, etc.
    };
}

// Clear on logout
function logout() {
    localStorage.clear();
    window.currentUser = null;
}
```

### API Security

- [ ] API endpoints use HTTPS
- [ ] CORS is properly configured
- [ ] API keys are not exposed
- [ ] Rate limiting is implemented
- [ ] Input to APIs is validated

**Code Example**:
```javascript
// ✓ CORRECT - Secure API calls
const API_ENDPOINT = process.env.REACT_APP_API_URL;  // Environment variable

async function fetchResults(competitionId) {
    // Validate input
    if (!Number.isInteger(competitionId)) {
        throw new Error("Invalid competition ID");
    }

    // Use HTTPS only
    if (!API_ENDPOINT.startsWith("https://")) {
        throw new Error("API must use HTTPS");
    }

    const response = await fetch(
        `${API_ENDPOINT}/competitions/${competitionId}/results`,
        {
            headers: {
                "Content-Type": "application/json",
                // API key in header, never in URL
                "Authorization": `Bearer ${await getToken()}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
}
```

## Testing Security

### Test Coverage

- [ ] Security-critical functions have tests
- [ ] Attack vectors are tested
- [ ] Boundary conditions are tested
- [ ] Failure cases are tested
- [ ] Gas limits are tested

### Security Test Examples

```typescript
describe("Security Tests", () => {
    describe("Access Control", () => {
        it("should prevent non-voters from voting", async () => {
            const nonVoter = accounts[1];
            await expect(
                contract.connect(nonVoter).vote(...)
            ).to.be.revertedWith("Not a voter");
        });

        it("should prevent double voting", async () => {
            const voter = accounts[0];
            await contract.connect(voter).vote(...);
            await expect(
                contract.connect(voter).vote(...)
            ).to.be.revertedWith("Already voted");
        });
    });

    describe("Input Validation", () => {
        it("should reject invalid competition ID", async () => {
            await expect(
                contract.vote(0, 1)  // Invalid: ID = 0
            ).to.be.reverted;
        });

        it("should reject out-of-range choice", async () => {
            await expect(
                contract.vote(1, 999)  // Invalid: choice >= max
            ).to.be.reverted;
        });
    });

    describe("FHE Security", () => {
        it("should properly set FHE permissions", async () => {
            const { handles, inputProof } = await encrypt(100);
            await contract.vote(handles[0], inputProof);

            // Verify permissions were set
            const hasPermission = await fhevm.hasPermission(
                await contract.getAddress()
            );
            expect(hasPermission).to.be.true;
        });
    });
});
```

## Deployment Security

### Pre-Deployment

- [ ] Code has been reviewed
- [ ] All tests pass
- [ ] Security audit completed
- [ ] Gas costs analyzed
- [ ] Testnet deployment successful

### Deployment Verification

- [ ] Correct contract version deployed
- [ ] Constructor parameters are correct
- [ ] Contract is verified on block explorer
- [ ] No private keys in deployed code
- [ ] No test code in production

### Post-Deployment

- [ ] Contract works as expected
- [ ] All functions callable
- [ ] Events are emitted correctly
- [ ] Access control enforced
- [ ] No obvious vulnerabilities

**Code Example**:
```typescript
// Verify after deployment
async function verifyDeployment(contractAddress: string) {
    const contract = await ethers.getContractAt("AnonymousEsports", contractAddress);

    console.log("Verifying deployment...");

    // Check contract is working
    const isInitialized = await contract.initialized();
    if (!isInitialized) {
        throw new Error("Contract not properly initialized");
    }

    // Check access control
    const owner = await contract.owner();
    console.log(`Owner: ${owner}`);

    // Verify no test functions
    try {
        await contract.testFunction();
        throw new Error("Test function still exists!");
    } catch (error) {
        if (error.message.includes("test")) {
            console.log("✓ Test function removed");
        }
    }

    console.log("✓ Deployment verified");
}
```

## Ongoing Security

### Monitoring

- [ ] Contract events are monitored
- [ ] Unusual activity is detected
- [ ] Failed transactions are logged
- [ ] Access logs are maintained
- [ ] Regular security reviews

### Updates & Patches

- [ ] Security updates are applied
- [ ] Dependencies are updated
- [ ] Vulnerabilities are patched
- [ ] Changes are tested before deployment
- [ ] Update notifications are sent

### Incident Response

- [ ] Incident response plan exists
- [ ] Emergency contacts are documented
- [ ] Pause mechanism exists
- [ ] Rollback procedure documented
- [ ] Post-incident analysis is done

**Emergency Procedures**:
```typescript
// Emergency pause function
modifier onlyEmergency() {
    require(emergency.isPaused || msg.sender == owner, "Not emergency");
    _;
}

function emergencyPause() external onlyOwner {
    emergency.isPaused = true;
    emit EmergencyPause(msg.sender, block.timestamp);
}

function resume() external onlyOwner {
    emergency.isPaused = false;
    emit Resumed(msg.sender, block.timestamp);
}
```

## Security Audit Checklist

### Before Submission

Complete before submitting for competition:

- [ ] **Code Quality**
  - [ ] No hardcoded values
  - [ ] No debug code
  - [ ] Clear error messages
  - [ ] Proper naming conventions

- [ ] **Functionality**
  - [ ] All features work correctly
  - [ ] Handles edge cases
  - [ ] Proper error handling
  - [ ] Events logged

- [ ] **Testing**
  - [ ] ≥80% code coverage
  - [ ] Security tests included
  - [ ] All tests passing
  - [ ] No flaky tests

- [ ] **Documentation**
  - [ ] Security notes included
  - [ ] Known limitations documented
  - [ ] Deployment instructions clear
  - [ ] API well documented

- [ ] **Deployment**
  - [ ] Private keys not exposed
  - [ ] Environment variables used
  - [ ] Verified on block explorer
  - [ ] Working on testnet

## Common Vulnerabilities Reference

| Vulnerability | Risk | Prevention |
|---------------|------|-----------|
| Reentrancy | HIGH | Check-Effects-Interact pattern |
| Access Control | HIGH | Proper modifiers, role-based |
| Overflow/Underflow | MEDIUM | Use uint types, Solidity 0.8.x |
| Front-running | MEDIUM | Encrypt data, commit-reveal |
| Timestamp Dependence | MEDIUM | Don't rely on block.timestamp |
| Delegatecall | CRITICAL | Never delegatecall to untrusted |
| Unchecked Call | MEDIUM | Always check return values |
| Gas Limit | MEDIUM | Avoid unbounded loops |
| Logic Bugs | HIGH | Thorough testing |

## Resources

### Security Audits
- OpenZeppelin Audit: https://audit.openzeppelin.com/
- Trail of Bits: https://www.trailofbits.com/
- Certora: https://www.certora.com/

### Learning Resources
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Solidity Security: https://docs.soliditylang.org/en/latest/security-considerations.html
- SWC Registry: https://swcregistry.io/

### Community
- Discord: https://discord.com/invite/zama
- Forum: https://www.zama.ai/community
- Security: security@zama.ai

---

**Security is everyone's responsibility. Take it seriously and help keep the platform safe!** 🛡️
