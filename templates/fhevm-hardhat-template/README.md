# FHEVM Hardhat Template

This is a template for creating FHEVM (Fully Homomorphic Encryption Virtual Machine) smart contract projects using Hardhat.

## Quick Start

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to local network
npm run deploy:local

# Deploy to testnet
npm run deploy:testnet
```

## Project Structure

```
.
├── contracts/          # Solidity contracts
│   └── Example.sol    # Your main contract
├── test/              # Test files
│   └── Example.test.ts
├── scripts/           # Deployment scripts
│   └── deploy.ts
├── hardhat.config.ts  # Hardhat configuration
├── package.json       # NPM dependencies
└── .env.example       # Environment variable template
```

## Development

### Writing Contracts

FHEVM contracts use encrypted data types from the `@fhevm/solidity` library:

```solidity
import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract Example is ZamaEthereumConfig {
    euint32 private encryptedValue;

    function store(externalEuint32 calldata value, bytes calldata proof) external {
        euint32 val = FHE.fromExternal(value, proof);
        encryptedValue = val;
        FHE.allowThis(encryptedValue);
        FHE.allow(encryptedValue, msg.sender);
    }
}
```

### Testing Contracts

Tests use Hardhat and Chai:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Example", function () {
    it("should deploy successfully", async function () {
        const Example = await ethers.getContractFactory("Example");
        const example = await Example.deploy();
        await example.waitForDeployment();

        expect(await example.getAddress()).to.be.properAddress;
    });
});
```

### Deploying Contracts

1. Copy `.env.example` to `.env`
2. Fill in your private key and RPC URLs
3. Run deployment script:

```bash
npm run deploy:testnet
```

## Configuration

### Environment Variables

Create a `.env` file with:

```
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Network Configuration

Networks are configured in `hardhat.config.ts`:

- **Local**: Hardhat network for development
- **Sepolia**: Ethereum testnet
- **Mainnet**: Ethereum mainnet (use with caution)

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm/)
- [Hardhat Documentation](https://hardhat.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)

## License

MIT
