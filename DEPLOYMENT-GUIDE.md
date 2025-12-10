# Anonymous Esports - Deployment Guide

Complete guide for deploying the Anonymous Esports platform to various networks.

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All tests pass: `npm run test`
- [ ] Code is linted: `npm run lint`
- [ ] Types check out: `npm run type-check`
- [ ] Contracts compile: `npm run compile`
- [ ] Environment variables are set (see `.env.example`)
- [ ] Private key is secure and not committed to git
- [ ] You have sufficient funds for gas fees
- [ ] You're on the correct network

## Environment Setup

### 1. Create `.env` File

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

**For Testnet (Sepolia)**:
```env
# Network RPC URL
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Wallet Configuration
PRIVATE_KEY=0x1234567890abcdef... # Account with testnet ETH

# Contract Configuration
DEPLOYMENT_NETWORK=sepolia

# Verification (optional)
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY
```

**For Mainnet**:
```env
# Network RPC URL
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Wallet Configuration
PRIVATE_KEY=0x1234567890abcdef... # Secure account with ETH

# Contract Configuration
DEPLOYMENT_NETWORK=mainnet

# Verification
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY
```

### 3. Get Required API Keys

#### Alchemy API Key
1. Visit https://www.alchemy.com/
2. Sign up for free account
3. Create application on Sepolia testnet
4. Copy API key
5. Add to `.env`: `SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/{KEY}`

#### Etherscan API Key
1. Visit https://etherscan.io/apis
2. Register account
3. Create API key
4. Add to `.env`: `ETHERSCAN_API_KEY=YOUR_KEY`

#### Private Key (Secure Method)
```bash
# Option 1: MetaMask Export
# 1. Open MetaMask
# 2. Account Menu > Account Details > Export Private Key
# 3. Copy (without 0x prefix if present)
# 4. Add to .env: PRIVATE_KEY=0x{key}

# Option 2: Create New Account
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 3: Use Hardhat Account
npx hardhat accounts
```

### 4. Fund Your Account (Testnet)

Get test ETH from faucets:
- **Sepolia**: https://sepoliafaucet.com/
- Alternative: https://www.infura.io/faucet/sepolia

Recommended: 1-2 ETH for testing

## Deployment to Sepolia Testnet

### Quick Deployment

```bash
npm run deploy:testnet
```

### Step-by-Step Deployment

#### 1. Compile Contracts

```bash
npm run compile
```

**Output Example**:
```
Compiled 6 Solidity files successfully
Artifact: artifacts/contracts/AnonymousEsports.sol/AnonymousEsports.json
```

#### 2. Run Deployment Script

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

**Expected Output**:
```
Deploying AnonymousEsports contract...
Waiting for confirmations...
Contract deployed to: 0x1234567890abcdefabcdefabcdefabcdefabcdef
Deployment gas used: 2,500,000
Transaction hash: 0xabcdef1234567890...
```

#### 3. Verify Deployment

```bash
# Check contract on block explorer
https://sepolia.etherscan.io/address/0x{CONTRACT_ADDRESS}

# Or verify programmatically
npx hardhat verify --network sepolia 0x{CONTRACT_ADDRESS} --constructor-args scripts/args.js
```

#### 4. Record Deployment Info

Create `deployment.json`:

```json
{
  "network": "sepolia",
  "chainId": 11155111,
  "timestamp": "2025-12-15T10:30:00Z",
  "contracts": {
    "AnonymousEsports": {
      "address": "0x1234567890abcdefabcdefabcdefabcdefabcdef",
      "transactionHash": "0xabcdef1234567890...",
      "blockNumber": 5123456,
      "gasUsed": 2500000,
      "deployerAddress": "0x..."
    }
  },
  "deploymentScript": "scripts/deploy.ts",
  "verified": true
}
```

## Deployment to Mainnet

### ⚠️ IMPORTANT SAFETY PRECAUTIONS

Before mainnet deployment:

1. **Test Thoroughly**
   ```bash
   # Run full test suite on testnet first
   npm run test

   # Test deployed contract on Sepolia
   npm run test:sepolia
   ```

2. **Code Review**
   - Have code reviewed by team members
   - Run security audit
   - Check for vulnerabilities

3. **Staging Deployment**
   - Deploy to staging environment first
   - Test all functionality on staging
   - Verify no issues

4. **Backup Credentials**
   - Safely store private key
   - Store deployment info securely
   - Keep ABI for future interactions

### Mainnet Deployment Process

#### 1. Prepare Mainnet Account

```bash
# Check balance
npx hardhat run scripts/check-balance.ts --network mainnet

# Expected: At least 5 ETH recommended
```

#### 2. Deploy with Confirmation

```bash
# Deploy to mainnet
npx hardhat run scripts/deploy.ts --network mainnet
```

**Safety Prompts**:
```
⚠️  MAINNET DEPLOYMENT
This will deploy to Mainnet (Ethereum).
Cost: ~3-5 ETH in gas fees
Continue? (yes/no)
```

#### 3. Monitor Transaction

```bash
# Get transaction status
npx hardhat run scripts/monitor-tx.ts --txhash 0x...

# Or check on Etherscan
https://etherscan.io/tx/0x...
```

#### 4. Verify Contract

```bash
# Verify source code on Etherscan
npx hardhat verify --network mainnet 0x{CONTRACT_ADDRESS}

# Provide constructor arguments if any
npx hardhat verify --network mainnet 0x{CONTRACT_ADDRESS} "arg1" "arg2"
```

#### 5. Post-Deployment

- [ ] Update frontend contract address
- [ ] Update documentation
- [ ] Announce deployment
- [ ] Monitor contract activity
- [ ] Set up monitoring alerts

## Deployment Script Reference

### Main Deploy Script (`scripts/deploy.ts`)

```typescript
import { ethers } from "hardhat";

async function main() {
    console.log("Starting deployment...");

    // Get signer
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying with account: ${deployer.address}`);

    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`Account balance: ${ethers.formatEther(balance)} ETH`);

    // Deploy AnonymousEsports contract
    console.log("Deploying AnonymousEsports...");
    const VotingFactory = await ethers.getContractFactory("AnonymousEsports");
    const voting = await VotingFactory.deploy();
    const votingAddress = await voting.getAddress();
    console.log(`Deployed to: ${votingAddress}`);

    // Wait for confirmations
    console.log("Waiting for block confirmations...");
    await voting.waitForDeployment();

    // Save deployment info
    const deployment = {
        network: (await ethers.provider.getNetwork()).name,
        timestamp: new Date().toISOString(),
        addresses: {
            voting: votingAddress,
        },
        deployer: deployer.address,
    };

    console.log("\nDeployment Summary:");
    console.log(JSON.stringify(deployment, null, 2));

    // Verify on block explorer (if applicable)
    if ((await ethers.provider.getNetwork()).chainId !== 31337) {
        console.log("\nVerifying on block explorer...");
        await verify(votingAddress, []);
    }
}

async function verify(address: string, args: any[]) {
    try {
        await ethers.provider.waitForTransaction(address);
        console.log(`Verified at: https://etherscan.io/address/${address}`);
    } catch (error) {
        console.log("Verification skipped - please verify manually");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```

## Contract Verification

### Etherscan Verification

#### Automated Verification

```bash
npx hardhat verify --network sepolia 0x{ADDRESS}
```

#### Manual Verification

1. Visit Etherscan for your contract
2. Click "Contract" tab
3. Click "Verify and Publish"
4. Choose: Single File (flattened)
5. Select Solidity version: 0.8.24
6. Select Optimization: Yes (200)
7. Paste contract code
8. Submit

### Block Explorer Checks

After verification, check:

- [ ] Contract source visible
- [ ] ABI available
- [ ] Read functions work
- [ ] Write functions accessible (with signing)

## Upgrade & Maintenance

### Contract Upgrades

For upgradeable contracts using proxies:

```bash
# Deploy new implementation
npm run deploy:upgrade

# Upgrade proxy to new implementation
npx hardhat run scripts/upgrade.ts --network {network}
```

### Parameter Updates

Update immutable parameters:

```bash
# Update contract configuration
npx hardhat run scripts/update-config.ts --network {network}
```

## Monitoring Post-Deployment

### Contract Activity Monitoring

```bash
# Watch contract events
npx hardhat run scripts/watch-events.ts --network sepolia --contract 0x...

# Get transaction history
npx hardhat run scripts/get-history.ts --contract 0x... --limit 10
```

### Gas Usage Tracking

```bash
# Analyze deployment gas
npm run gas-report

# Review expensive operations
npx hardhat run scripts/analyze-gas.ts
```

## Rollback Procedures

### If Deployment Fails

1. **Check Error Message**
   ```bash
   # Review transaction details
   npx hardhat run scripts/check-tx.ts --txhash 0x...
   ```

2. **Common Failures**

   | Error | Cause | Solution |
   |-------|-------|----------|
   | `insufficient funds` | Not enough ETH | Fund account more |
   | `nonce too low` | Previous tx pending | Wait for confirmation |
   | `contract revert` | Contract code error | Fix and redeploy |
   | `network error` | RPC issue | Try different RPC |

3. **Fix & Redeploy**
   ```bash
   # Fix contract if needed
   # Increment version
   npm run compile

   # Redeploy
   npm run deploy:{network}
   ```

### If Contract Has Issues

1. **Pause Operations** (if pause function exists)
   ```typescript
   await contract.pause();
   ```

2. **Deploy Patch**
   - Fix bug
   - Deploy new contract
   - Migrate state if needed

3. **Communicate Issue**
   - Announce to users
   - Provide update timeline
   - Update documentation

## Security Considerations

### Private Key Security

```bash
# ✅ DO: Use environment variables
PRIVATE_KEY=0x...  # In .env (git-ignored)

# ❌ DON'T: Commit to git
# ❌ DON'T: Hardcode in scripts
# ❌ DON'T: Share in messages/calls
```

### Deployment Best Practices

1. **Test First**: Always test on testnet
2. **Verify Later**: Verify on block explorer
3. **Secure Keys**: Never share private keys
4. **Monitor Closely**: Watch contract activity
5. **Document Everything**: Keep records

### Gas Optimization Tips

```bash
# Check gas costs before deploying
npm run gas-report

# Deploy during low-gas times (generally off-peak hours)
# Mainnet: ~3am-8am UTC typically cheaper

# Consider using Flash Bots for priority
# Reference: https://docs.flashbots.net/
```

## Deployment Checklist

### Pre-Deployment
- [ ] All tests pass
- [ ] Code is clean and linted
- [ ] Environment variables set
- [ ] Private key is secure
- [ ] Account has sufficient funds
- [ ] Network is correct

### Deployment
- [ ] Contracts compile successfully
- [ ] Deployment script runs
- [ ] Contract addresses recorded
- [ ] Transactions confirmed
- [ ] Contracts functional

### Post-Deployment
- [ ] Verified on block explorer
- [ ] Frontend updated
- [ ] Documentation updated
- [ ] Users notified
- [ ] Monitoring enabled
- [ ] Backup created

## Troubleshooting

### Common Issues

**Issue**: `Error: ENOENT: no such file or directory, open '.env'`

**Solution**:
```bash
cp .env.example .env
# Fill in required values
```

**Issue**: `Error: insufficient funds for gas * price + value`

**Solution**:
```bash
# Check balance
npx hardhat run scripts/check-balance.ts

# Get more testnet ETH from faucet
# https://sepoliafaucet.com/
```

**Issue**: `Error: invalid private key`

**Solution**:
```bash
# Ensure format is correct
# PRIVATE_KEY=0x{32-byte-hex}
# NO quotes, NO additional prefix
```

**Issue**: `Error: Contract verification failed`

**Solution**:
```bash
# Wait a few blocks for indexing
# Check contract bytecode matches on Etherscan
# Try verification manually on Etherscan UI
```

## Deployment Costs

### Estimated Gas Costs

| Network | Operation | Gas | Cost (in ETH) |
|---------|-----------|-----|---------------|
| Sepolia | Deploy contract | 2.5M | 0.05-0.1 |
| Sepolia | Simple function call | 50K | 0.001-0.002 |
| Mainnet | Deploy contract | 2.5M | 1-5 (varies) |
| Mainnet | Simple function call | 50K | 0.001-0.05 (varies) |

### Cost Reduction Tips

1. **Deploy During Low Gas**: Off-peak hours
2. **Optimize Code**: Reduce deployment size
3. **Test on Testnet**: Avoid mainnet mistakes
4. **Batch Operations**: Combine transactions

## Support & Resources

### Documentation
- Hardhat: https://hardhat.org/docs
- Ethers.js: https://docs.ethers.org/
- Etherscan: https://etherscan.io/apis

### Community Help
- Discord: https://discord.com/invite/zama
- Forum: https://www.zama.ai/community
- GitHub Issues: Report problems

### Emergency Contacts
- Technical Issues: support@zama.ai
- Security Issues: security@zama.ai
- General Questions: info@zama.ai

---

**Deployment successful? Congratulations! Your contract is now live! 🎉**

For issues or questions, see the troubleshooting section or contact community support.
