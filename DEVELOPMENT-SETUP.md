# Anonymous Esports - Development Setup Guide

Complete guide for setting up your local development environment to contribute to the Anonymous Esports Competition Platform.

## System Requirements

### Minimum Requirements

- **Node.js**: 16.0.0 or higher (18+ recommended)
- **npm**: 8.0.0 or higher
- **Git**: 2.30.0 or higher
- **RAM**: 4GB minimum (8GB recommended)
- **Disk Space**: 2GB free space
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)

### Development Tools

- **Code Editor**: VS Code recommended
- **Git Client**: Command line or GitHub Desktop
- **Browser**: Chrome/Firefox with MetaMask extension
- **Terminal**: PowerShell (Windows), bash (macOS/Linux)

## Installation Steps

### 1. Verify Prerequisites

Check your system versions:

```bash
# Check Node.js version (should be 16+)
node --version

# Check npm version (should be 8+)
npm --version

# Check Git version
git --version
```

If versions are outdated, install the latest from:
- Node.js: https://nodejs.org/
- Git: https://git-scm.com/

### 2. Clone the Repository

```bash
# Clone using HTTPS (recommended)
git clone https://github.com/your-username/AnonymousEsports.git
cd AnonymousEsports

# Or clone using SSH if you have SSH keys configured
git clone git@github.com:your-username/AnonymousEsports.git
cd AnonymousEsports
```

### 3. Install Dependencies

```bash
# Install all project dependencies
npm install

# Verify installation succeeded
npm run compile
```

If you encounter any issues:

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### 4. Set Up Environment Variables

Create `.env` file in project root:

```bash
# Copy template
cp .env.example .env

# Edit with your configuration
# Use your favorite editor (VS Code, nano, etc.)
```

**Required Environment Variables**:

```env
# Network Configuration
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Wallet Configuration (for deployment)
PRIVATE_KEY=0x1234567890abcdef... # Do NOT share this!

# Contract Verification (optional)
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY

# Deployment Configuration
DEPLOYMENT_NETWORK=sepolia # or mainnet, hardhat, localhost

# Frontend Configuration
REACT_APP_CONTRACT_ADDRESS=0x...
REACT_APP_NETWORK_ID=11155111 # Sepolia testnet ID
```

**Getting API Keys**:

1. **Alchemy API Key**:
   - Visit: https://www.alchemy.com/
   - Sign up for free account
   - Create app on Sepolia testnet
   - Copy API key to `.env`

2. **Private Key (Testnet Only)**:
   - Open MetaMask
   - Click account menu → Details
   - Export private key
   - Add to `.env` (prefix with `0x`)
   - **NEVER commit this file to git**

3. **Etherscan API Key** (optional):
   - Visit: https://etherscan.io/apis
   - Register free account
   - Generate API key
   - Add to `.env`

### 5. Verify Setup

Run verification script:

```bash
npm run verify:setup
```

This checks:
- ✓ Node.js and npm versions
- ✓ Dependencies installed
- ✓ Environment variables configured
- ✓ Contracts compile
- ✓ Tests can run

## Development Workflow

### Smart Contract Development

#### 1. Write Your Contract

Create contract file in `contracts/`:

```solidity
// contracts/YourContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Your Contract Description
/// @notice Describe what your contract does
contract YourContract is ZamaEthereumConfig {
    // Implementation here
}
```

#### 2. Compile Contract

```bash
# Compile single file
npx hardhat compile contracts/YourContract.sol

# Compile all contracts
npm run compile

# Check compilation without writing artifacts
npx hardhat compile --no-save
```

#### 3. Write Tests

Create test file in `test/`:

```typescript
// test/YourContract.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";

describe("YourContract", () => {
  let contract: any;
  let owner: any;

  beforeEach(async () => {
    [owner] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("YourContract");
    contract = await Contract.deploy();
    await contract.waitForDeployment();
  });

  it("should have correct initial state", async () => {
    // Your test here
  });
});
```

#### 4. Run Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- test/YourContract.test.ts

# Run with verbose output
npm run test -- --reporter json

# Run with code coverage
npm run test:coverage
```

### Frontend Development

#### 1. Set Up Frontend Directory

```bash
# If not already present
mkdir src
cd src
```

#### 2. Create React Component

```jsx
// src/components/YourComponent.jsx
import React, { useState } from 'react';
import { ethers } from 'ethers';

export function YourComponent() {
  const [state, setState] = useState(null);

  const handleClick = async () => {
    // Your logic here
  };

  return (
    <div>
      {/* Your JSX here */}
    </div>
  );
}
```

#### 3. Build Frontend

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Testing Strategies

#### Unit Tests

Test individual functions:

```typescript
describe("YourFunction", () => {
  it("should handle valid input", async () => {
    // Test implementation
  });

  it("should reject invalid input", async () => {
    // Test validation
  });
});
```

#### Integration Tests

Test contract interactions:

```typescript
describe("Multi-contract Integration", () => {
  it("should transfer tokens correctly", async () => {
    // Test multi-contract workflow
  });
});
```

#### Gas Analysis Tests

```typescript
it("should use acceptable gas", async () => {
  const tx = await contract.expensiveOperation();
  const receipt = await tx.wait();
  expect(receipt.gasUsed).to.be.lessThan(1000000); // 1M gas limit
});
```

## Hardhat Configuration

### Network Configuration

Edit `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    hardhat: {
      // Local testing network
    },
  },
};

export default config;
```

### Task Configuration

Create custom Hardhat tasks in `tasks/`:

```typescript
// tasks/deploy.ts
import { task } from "hardhat/config";

task("deploy", "Deploys contract to network")
  .addParam("network", "Target network")
  .setAction(async (args, hre) => {
    // Deployment logic
  });
```

## Git Workflow

### Create Feature Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Example branch names:
# feature/add-voting-mechanism
# fix/security-vulnerability
# refactor/optimize-gas
# docs/update-readme
```

### Commit Changes

```bash
# Stage changes
git add .

# Or stage specific files
git add contracts/YourContract.sol test/YourContract.test.ts

# Commit with descriptive message
git commit -m "Add encrypted voting mechanism with FHE

- Implement new voting contract using FHE encryption
- Add comprehensive test coverage (95%)
- Optimize gas usage for bulk operations
- Update documentation with usage examples"
```

### Push and Create Pull Request

```bash
# Push to remote
git push origin feature/your-feature-name

# Then create PR on GitHub
# - Use template
# - Link issues
# - Describe changes
```

## Common Commands Reference

### Compilation & Testing

```bash
npm run compile          # Compile all contracts
npm run test            # Run full test suite
npm run test:coverage   # Generate coverage report
npm run lint            # Run linter
npm run format          # Auto-format code
npm run type-check      # Check TypeScript types
```

### Development

```bash
npm run dev             # Start dev server
npm run build           # Build project
npm run clean           # Clean build artifacts
npm run verify:setup    # Verify development setup
```

### Deployment & Verification

```bash
npm run deploy:testnet  # Deploy to Sepolia
npm run deploy:mainnet  # Deploy to Mainnet
npm run verify:contract # Verify on Etherscan
```

### Gas & Analysis

```bash
npm run gas-report      # Generate gas usage report
npm run analyze         # Analyze contract structure
```

## Troubleshooting

### Node.js Module Issues

**Problem**: `Cannot find module '@fhevm/solidity'`

**Solution**:
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Compilation Errors

**Problem**: `SyntaxError in contract`

**Solution**:
```bash
# Check Solidity version
npm run compile

# View detailed error
npx hardhat compile --verbose
```

### Test Failures

**Problem**: Tests fail after environment changes

**Solution**:
```bash
# Reset test environment
npm run clean
npm run compile
npm run test -- --no-cache
```

### Gas Estimation Issues

**Problem**: Transaction reverts due to gas

**Solution**:
```bash
# Increase gas limit in hardhat.config.ts
// blockGasLimit: 30000000

# Or in test
const tx = await contract.operation({ gasLimit: 2000000 });
```

### Private Key Errors

**Problem**: Cannot decrypt private key

**Solution**:
```bash
# Check .env format
# Private key should be: 0x1234567890abcdef...
# NOT: 1234567890abcdef...
# NOT: {"encrypted": "..."}

# Check not in quotes
PRIVATE_KEY=0xabc123  # Correct
PRIVATE_KEY="0xabc123" # Wrong
```

### Port Already in Use

**Problem**: Address already in use when running dev server

**Solution**:
```bash
# Find and kill process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :3000
kill -9 <PID>

# Or use different port
npm run dev -- --port 3001
```

## IDE Setup

### VS Code Extensions (Recommended)

Install these extensions for better development experience:

1. **Solidity** (by Juan Blanco)
   - Smart contract syntax highlighting
   - Compilation support

2. **Hardhat** (by Nomic Foundation)
   - Hardhat configuration support

3. **TypeScript Vue Plugin** (by Vue)
   - TypeScript support in Vue/Vite

4. **ESLint** (by Microsoft)
   - Real-time linting

5. **Prettier** (by Prettier)
   - Code formatting

6. **REST Client** (by Huachao Mao)
   - Test API endpoints

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[solidity]": {
    "editor.defaultFormatter": "JuanBlanco.solidity"
  },
  "solidity.compileUsingRemoteVersion": "v0.8.24",
  "search.exclude": {
    "node_modules": true,
    ".hardhat": true
  }
}
```

## Testing with MetaMask

### Set Up Test Wallet

1. Install MetaMask extension
2. Create test wallet (or import existing)
3. Switch to Sepolia testnet
4. Get test ETH from faucet: https://sepoliafaucet.com/

### Connect to Local Testing

```bash
# Start local hardhat node
npx hardhat node

# In MetaMask:
# 1. Add custom RPC network
# 2. RPC URL: http://localhost:8545
# 3. Chain ID: 31337
# 4. Import test account (private key from hardhat output)
```

## Performance Optimization

### Compilation Optimization

```typescript
// In hardhat.config.ts
solidity: {
  version: "0.8.24",
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000, // Higher = more optimization
    },
  },
}
```

### Test Optimization

```bash
# Run tests in parallel
npm run test -- --parallel

# Skip coverage for faster feedback
npm run test -- --no-coverage
```

## Next Steps

1. **Read Documentation**
   - FHEVM Docs: https://docs.zama.ai/fhevm
   - Hardhat Docs: https://hardhat.org/

2. **Explore Examples**
   - Check `contracts/` for existing examples
   - Study `test/` for testing patterns

3. **Start Development**
   - Create feature branch
   - Make your contribution
   - Write tests
   - Follow git workflow

4. **Get Help**
   - Community Discord: https://discord.com/invite/zama
   - Forum: https://www.zama.ai/community
   - Weekly office hours (Thursdays)

## Additional Resources

### Documentation Links

- FHEVM: https://docs.zama.ai/fhevm
- Hardhat: https://hardhat.org/docs
- Ethers.js: https://docs.ethers.org/
- Solidity: https://docs.soliditylang.org/

### Community & Support

- Discord: https://discord.com/invite/zama
- Forum: https://www.zama.ai/community
- GitHub Issues: Report bugs and request features
- Email: support@zama.ai

---

**You're all set! Happy coding! 🚀**

For issues or questions, reach out to the community on Discord.
