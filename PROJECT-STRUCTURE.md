# Anonymous Esports - Project Structure Guide

Understanding the project structure is essential for contributing effectively.

## Directory Organization

```
AnonymousEsports/
├��─ contracts/                   # Smart contract source files
├── test/                        # Contract test files
├── src/                         # Frontend source code (if applicable)
├── public/                      # Static assets
├── scripts/                     # Deployment and utility scripts
├── docs/                        # Documentation files
├── .github/                     # GitHub configuration
├── node_modules/               # Dependencies (generated)
├── dist/                        # Build output (generated)
├── coverage/                    # Test coverage reports (generated)
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── .eslintrc.json              # ESLint configuration
├── .prettierrc                  # Code formatter configuration
├── hardhat.config.ts           # Hardhat configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Project metadata and dependencies
├── package-lock.json           # Dependency lock file (generated)
├── README.md                   # Main documentation
├── COMPETITION-DESCRIPTION.md  # Competition overview
├── SUBMISSION-GUIDELINES.md    # How to submit
├── DEVELOPMENT-SETUP.md        # Development environment setup
├── TESTING-VALIDATION-CHECKLIST.md  # Testing checklist
├── PROJECT-STRUCTURE.md        # This file
├── LICENSE                     # License file
└── CONTRIBUTING.md             # Contributing guidelines
```

## Detailed Directory Descriptions

### `/contracts` - Smart Contracts

Contains all Solidity smart contracts for the platform.

```
contracts/
├── AnonymousEsports.sol          # Main voting contract
├── AnonymousEsportsFixed.sol     # Updated version
├── AnonymousEsportsCompatible.sol # Compatibility version
├── SimpleEsports.sol             # Simplified implementation
├── VotingMechanism.sol           # Voting logic (if separated)
├── AccessControl.sol             # Permission management
├── EventTracking.sol             # Event logging
├── libraries/
│   ├── FHEOperations.sol         # FHE helper functions
│   └── VotingUtils.sol           # Voting utilities
└── interfaces/
    ├── IVoting.sol               # Voting interface
    └── ICompetition.sol          # Competition interface
```

**Key Files**:

- **AnonymousEsports.sol**: Main contract implementing voting functionality
  - Manages competition creation
  - Handles encrypted voting
  - Tallies results while preserving privacy
  - Emits voting events

- **AccessControl.sol**: Controls permissions for contract operations
  - Role-based access (admin, voter, organizer)
  - Permission granting/revoking
  - Modifier enforcement

### `/test` - Test Files

Contains all test files for smart contracts.

```
test/
├── AnonymousEsports.test.ts      # Tests for main contract
├── VotingMechanism.test.ts       # Tests for voting logic
├── AccessControl.test.ts         # Tests for permissions
├── integration/
│   ├── voting-flow.test.ts       # End-to-end voting tests
│   └── competition-flow.test.ts  # Competition lifecycle tests
├── fixtures/
│   ├── contracts.ts              # Contract deployment fixtures
│   ├── accounts.ts               # Test account setup
│   └── constants.ts              # Test constants
└── mocks/
    ├── MockFHEVM.ts              # Mock FHEVM for testing
    └── MockOracleReed.ts          # Mock oracle for testing
```

**Test Organization**:

- **Unit tests**: Individual function behavior
- **Integration tests**: Multi-contract interactions
- **Fixtures**: Reusable test setup code

### `/src` - Frontend Code

Frontend application for user interaction.

```
src/
├── components/
│   ├── Voting.jsx               # Voting component
│   ├── Competition.jsx          # Competition display
│   ├── WalletConnect.jsx        # Wallet integration
│   ├── Results.jsx              # Results display
│   └── shared/
│       ├── Button.jsx
│       ├── Modal.jsx
│       └── LoadingSpinner.jsx
├── pages/
│   ├── Home.jsx                 # Landing page
│   ├── Competitions.jsx         # Competitions list
│   ├── Vote.jsx                 # Voting page
│   └── Admin.jsx                # Admin dashboard
├── hooks/
│   ├── useWeb3.js               # Web3 integration
│   ├── useVotingContract.js     # Contract interaction
│   └── useEthers.js             # Ethers.js utilities
├── services/
│   ├── web3Service.js           # Web3 utilities
│   ├── contractService.js       # Contract interaction
│   ├── fheService.js            # FHE encryption
│   └── apiService.js            # Backend API calls
├── styles/
│   ├── global.css               # Global styles
│   ├── components.css           # Component styles
│   └── variables.css            # CSS variables
├── utils/
│   ├── formatters.js            # Data formatting
│   ├── validators.js            # Input validation
│   └── errors.js                # Error handling
├── config/
│   ├── contracts.js             # Contract addresses
│   ├── networks.js              # Network configuration
│   └── constants.js             # App constants
├── App.jsx                      # Main app component
└── index.jsx                    # App entry point
```

### `/scripts` - Deployment & Utilities

Deployment and utility scripts for development.

```
scripts/
├── deploy.ts                    # Main deployment script
├── deployToTestnet.ts           # Testnet deployment
├── deployToMainnet.ts           # Mainnet deployment
├── verify.ts                    # Etherscan verification
├── generateABI.ts               # Generate contract ABI
├── generateDocs.ts              # Generate documentation
├── migrate.ts                   # Contract migration
├── setup.ts                     # Initial setup script
└── utilities/
    ├── logger.ts                # Logging utilities
    ├── config.ts                # Configuration loader
    └── blockchain.ts            # Blockchain utilities
```

**Script Purposes**:

- **deploy.ts**: Deploys all contracts to specified network
- **verify.ts**: Verifies contract source on Etherscan
- **generateABI.ts**: Creates ABI JSON files
- **generateDocs.ts**: Generates documentation from code

### `/docs` - Documentation

Comprehensive documentation for the project.

```
docs/
├── ARCHITECTURE.md              # System architecture
├── API.md                       # API documentation
├── CONTRACT-GUIDE.md            # Smart contract guide
├── DEPLOYMENT.md                # Deployment instructions
├── DEVELOPMENT.md               # Development practices
├── FHE-CONCEPTS.md             # FHE explanation
├── VOTING-MECHANISM.md          # Voting logic details
├── SECURITY.md                  # Security documentation
├── TROUBLESHOOTING.md           # Common issues
├── images/
│   ├── architecture.png         # Architecture diagram
│   ├── voting-flow.png          # Voting flow diagram
│   └── deployment-process.png   # Deployment diagram
└── examples/
    ├── voting-example.md        # Voting example
    ├── contract-example.md      # Contract example
    └── frontend-example.md      # Frontend example
```

### `/public` - Static Assets

Static files served to users.

```
public/
├── index.html                   # Main HTML file
├── favicon.ico                  # Website icon
├── manifest.json                # PWA manifest
├── images/
│   ├── logo.png                 # Platform logo
│   ├── esports-hero.jpg         # Hero image
│   └── game-icons/              # Game title icons
└── data/
    ├── games.json               # Supported games list
    └── regions.json             # Supported regions
```

### `/.github` - GitHub Configuration

GitHub-specific configuration files.

```
.github/
├── workflows/
│   ├── test.yml                 # Automated testing
│   ├── lint.yml                 # Code linting
│   ├── security.yml             # Security checks
│   └── deploy.yml               # Automatic deployment
├── ISSUE_TEMPLATE/
│   ├── bug_report.md            # Bug report template
│   └── feature_request.md       # Feature request template
├── PULL_REQUEST_TEMPLATE.md     # PR template
└── dependabot.yml               # Dependency updates
```

## Configuration Files

### `hardhat.config.ts`

Hardhat configuration for smart contract development.

**Key Sections**:
- Solidity compiler settings
- Network configurations (hardhat, sepolia, mainnet)
- Plugin configurations
- Task definitions

### `tsconfig.json`

TypeScript configuration.

**Key Settings**:
- Compilation target (ES2020)
- Module system (commonjs)
- Strict mode enabled
- Source maps enabled

### `package.json`

Project metadata and dependencies.

**Key Sections**:
```json
{
  "name": "anonymous-esports-platform",
  "version": "1.0.0",
  "description": "Anonymous Esports Competition Platform",
  "scripts": {
    "compile": "hardhat compile",
    "test": "hardhat test",
    "deploy:testnet": "hardhat run scripts/deploy.ts --network sepolia",
    "deploy:mainnet": "hardhat run scripts/deploy.ts --network mainnet"
  },
  "dependencies": {
    "@fhevm/solidity": "^0.9.1",
    "ethers": "^6.0.0",
    "hardhat": "^2.17.0"
  }
}
```

### `.env.example`

Template for environment variables.

**Required Variables**:
```env
# Network RPC URLs
SEPOLIA_RPC_URL=
MAINNET_RPC_URL=

# Wallet Configuration
PRIVATE_KEY=

# Contract Configuration
CONTRACT_ADDRESS=

# API Keys
ETHERSCAN_API_KEY=
ALCHEMY_API_KEY=

# Frontend Configuration
REACT_APP_CONTRACT_ADDRESS=
REACT_APP_NETWORK_ID=
```

## File Naming Conventions

### Smart Contracts

- **Main contracts**: PascalCase (e.g., `VotingMechanism.sol`)
- **Interfaces**: `IContractName.sol`
- **Libraries**: `LibraryName.sol`
- **Abstract**: `AbstractContractName.sol`

### TypeScript/JavaScript

- **Files**: camelCase (e.g., `votingService.ts`)
- **Components**: PascalCase (e.g., `VotingComponent.jsx`)
- **Classes**: PascalCase (e.g., `VotingManager.ts`)
- **Interfaces**: IPascalCase (e.g., `IVotingContract.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_VOTES.ts`)

### Tests

- **Test files**: `[FileName].test.ts`
- **Test suites**: Describe what's being tested
- **Test cases**: Use "should" prefix

**Example**:
```typescript
describe("VotingContract", () => {
  describe("vote", () => {
    it("should accept valid votes", () => { ... });
    it("should reject invalid votes", () => { ... });
  });
});
```

### Documentation

- **Main docs**: UPPER_CASE with hyphens (e.g., `ARCHITECTURE.md`)
- **Subdirectory docs**: lowercase with hyphens (e.g., `voting-guide.md`)

## Code Organization Principles

### Smart Contracts

1. **License and Pragma**
   ```solidity
   // SPDX-License-Identifier: MIT
   pragma solidity ^0.8.24;
   ```

2. **Imports**
   ```solidity
   import { FHE } from "@fhevm/solidity/lib/FHE.sol";
   ```

3. **Contract Declaration**
   ```solidity
   contract VotingContract is AccessControl {
   ```

4. **Type Declarations**
   ```solidity
   enum VoteStatus { Active, Closed, Tallied }
   struct Vote { ... }
   ```

5. **State Variables**
   ```solidity
   euint32 private _encryptedVotes;
   mapping(address => bool) public hasVoted;
   ```

6. **Events**
   ```solidity
   event VoteCast(indexed voter, uint256 competitionId);
   ```

7. **Modifiers**
   ```solidity
   modifier onlyVoter() { ... }
   ```

8. **Functions** (ordered by visibility: public, external, internal, private)
   ```solidity
   function vote(...) external onlyVoter { ... }
   function tally() public onlyOwner { ... }
   ```

### Frontend Components

1. **Imports**
2. **Type Definitions** (if any)
3. **Component Function**
4. **Hooks**
5. **Event Handlers**
6. **Render Logic**
7. **Styles** (if inline)

## Dependency Management

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @fhevm/solidity | ^0.9.1 | FHE encryption |
| @fhevm/hardhat-plugin | ^0.3.0 | Hardhat integration |
| ethers | ^6.0.0 | Web3 interaction |
| hardhat | ^2.17.0 | Development framework |
| typescript | ^5.0.0 | Type safety |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @types/node | ^18.0.0 | Node.js types |
| @typescript-eslint/eslint-plugin | ^6.0.0 | Linting |
| chai | ^4.3.0 | Assertions |
| prettier | ^3.0.0 | Code formatting |
| solhint | ^4.0.0 | Solidity linting |

### Optional Dependencies

| Package | Purpose |
|---------|---------|
| hardhat-gas-reporter | Gas analysis |
| hardhat-coverage | Test coverage |
| hardhat-deploy | Deployment management |
| @openzeppelin/hardhat-upgrades | Contract upgrades |

## Build Artifacts

Generated files (not committed to git):

```
dist/                # Compiled JavaScript
build/               # Compiled contracts
coverage/            # Test coverage reports
artifacts/           # Contract artifacts (ABI, bytecode)
node_modules/        # Dependencies
.hardhat/            # Hardhat cache
.cache/              # Various caches
```

## Key Files for Contributors

### Must Read Before Contributing

1. **README.md** - Project overview and quick start
2. **CONTRIBUTING.md** - Contribution guidelines
3. **DEVELOPMENT-SETUP.md** - Development environment setup
4. **PROJECT-STRUCTURE.md** - This file

### Documentation to Understand

1. **docs/ARCHITECTURE.md** - System design
2. **docs/CONTRACT-GUIDE.md** - Smart contract details
3. **docs/FHE-CONCEPTS.md** - FHE explanation

### Code Examples

1. **contracts/AnonymousEsports.sol** - Main contract
2. **test/AnonymousEsports.test.ts** - Contract tests
3. **src/components/Voting.jsx** - Frontend component

## Adding New Files

### New Smart Contract

1. Create in `contracts/`:
   ```solidity
   // SPDX-License-Identifier: MIT
   pragma solidity ^0.8.24;

   /// @title Description
   contract NewContract {
       // Implementation
   }
   ```

2. Create test in `test/NewContract.test.ts`

3. Add to `hardhat.config.ts` if custom compilation needed

### New Frontend Component

1. Create in `src/components/`:
   ```jsx
   export function NewComponent() {
       return (
           <div>
               {/* Component JSX */}
           </div>
       );
   }
   ```

2. Create tests in same directory with `.test.jsx`

3. Export from `src/components/index.js`

### New Script

1. Create in `scripts/`:
   ```typescript
   import { hardhat } from "hardhat";

   async function main() {
       // Script implementation
   }

   main().catch(console.error);
   ```

2. Add to `package.json` scripts if needed

### New Documentation

1. Create in `docs/` with descriptive name
2. Add link to `docs/README.md` or relevant index
3. Use consistent formatting with existing docs

## Git Workflow Integration

### Branch Naming

- Feature: `feature/voting-improvement`
- Fix: `fix/security-issue`
- Docs: `docs/update-readme`
- Refactor: `refactor/optimize-gas`

### Commit Message Structure

```
Type: Brief description (max 50 chars)

Detailed explanation if needed.
- Point 1
- Point 2

Refs: #123 (if applicable)
```

### PR Structure

- Link to issue
- Describe changes
- List modified files
- Include testing notes
- Reference documentation changes

---

**Understanding this structure will help you contribute effectively and maintain code quality.**

For questions, see CONTRIBUTING.md or join the community Discord.
