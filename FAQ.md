# Anonymous Esports - Frequently Asked Questions

## Competition Questions

### Q: What is the competition about?

**A:** The Anonymous Esports Competition Platform Challenge invites developers to enhance and extend a privacy-preserving voting platform built with Fully Homomorphic Encryption (FHE) technology. Participants can contribute smart contracts, frontend improvements, infrastructure, or educational content.

### Q: When does the competition start and end?

**A:**
- **Start**: December 1, 2025
- **Registration**: December 2-31, 2025
- **Submission Deadline**: December 31, 2025 (23:59 AoE)
- **Winner Announcement**: January 10, 2026

### Q: How much is the prize pool?

**A:** $50,000 total:
- Grand Prize: $15,000
- Category Winners: $8,000 each (×4)
- Community Favorite: $2,000
- Honorable Mentions: $1,500 each
- Bug Bounty: $3,000 pool

### Q: Can I participate as a team?

**A:** Yes! Teams of 1-5 members can participate. However:
- Team membership is exclusive per submission
- All team members will be credited
- Prize distribution must be agreed upon beforehand

### Q: Can I submit multiple entries?

**A:** Individuals can submit up to 2 entries. However:
- You cannot be a team member on multiple submissions
- Each submission must be distinct and significant
- All entries must meet quality standards

### Q: Do I need to have prior FHE experience?

**A:** No! The competition welcomes developers of all experience levels. We provide:
- Comprehensive documentation
- Example implementations
- Tutorial materials
- Community support

Start with the [Learning Resources](./COMPETITION-QUICK-START.md) section.

### Q: What if I find a bug in the provided code?

**A:** Please:
1. Report it on GitHub Issues
2. Or email: security@zama.ai
3. Include clear description and reproduction steps
4. You may be eligible for Bug Bounty reward

## Development Questions

### Q: What are the system requirements?

**A:** Minimum:
- Node.js 16.0.0 or higher
- npm 8.0.0 or higher
- 4GB RAM
- 2GB free disk space
- Git 2.30.0 or higher

We recommend Node 18+ and 8GB RAM for better performance.

### Q: How do I set up my development environment?

**A:** Follow the [DEVELOPMENT-SETUP.md](./DEVELOPMENT-SETUP.md) guide:

```bash
git clone https://github.com/your-username/AnonymousEsports.git
cd AnonymousEsports
npm install
npm run verify:setup
```

### Q: Do I need to use a specific IDE?

**A:** No, but we recommend VS Code with these extensions:
- Solidity (by Juan Blanco)
- Hardhat (by Nomic Foundation)
- TypeScript Vue Plugin
- ESLint
- Prettier

### Q: How do I get test ETH for Sepolia testnet?

**A:** Use these faucets:
- https://sepoliafaucet.com/ (primary)
- https://www.infura.io/faucet/sepolia (backup)

You'll need 1-2 ETH for testing deployment and transactions.

### Q: Can I deploy to mainnet for testing?

**A:** Not recommended during development. Test thoroughly on Sepolia testnet first. Only deploy to mainnet for final submission if:
- Fully tested on testnet
- Code has been reviewed
- You have sufficient ETH for gas
- You understand the costs (~1-5 ETH)

## Smart Contract Questions

### Q: What is FHE and why is it important?

**A:** Fully Homomorphic Encryption allows computation on encrypted data without decryption. For voting:
- Votes remain encrypted
- Results are computed while encrypted
- Individual votes never revealed
- Complete voter privacy

See [FHE Concepts](./docs/FHE-CONCEPTS.md) for detailed explanation.

### Q: What's the difference between FHE.allowThis() and FHE.allow()?

**A:** Both are required for FHE operations:

```solidity
// FHE.allowThis() grants contract access
FHE.allowThis(encryptedValue);

// FHE.allow() grants specific user access
FHE.allow(encryptedValue, msg.sender);
```

**Both must be called** or operations will fail.

### Q: Can I use OpenZeppelin contracts?

**A:** Yes! The platform supports OpenZeppelin, including:
- OpenZeppelin confidential contracts
- ERC7984 confidential tokens
- Access control libraries

See [EXAMPLES-CATALOG.md](./EXAMPLES-CATALOG.md) for integration details.

### Q: What's a good starting contract to build on?

**A:** Start with SimpleVote.sol example:
- Basic FHE operations
- Clear voting logic
- Comprehensive tests
- Well documented

Find it in `contracts/examples/SimpleVote.sol`

### Q: How do I test FHE operations?

**A:** Use the FHEVM testing utilities:

```typescript
import { initializeFhevm, getSigners } from "hardhat-fhevm";

beforeEach(async () => {
    await initializeFhevm();
    [owner, user] = await getSigners();
});

it("should encrypt and process", async () => {
    const input = await fhevm.createEncryptedInput(
        await contract.getAddress(),
        user.address
    );
    input.add32(100);
    const { handles, inputProof } = await input.encrypt();
    // Test...
});
```

See [Testing Guide](./TESTING-VALIDATION-CHECKLIST.md) for more examples.

### Q: What's a reasonable gas cost for voting?

**A:** Typical costs:
- Cast vote: 150,000 - 200,000 gas
- Register voter: 50,000 - 100,000 gas
- Tally results: 100,000 - 500,000 gas
- Deployment: 2.5M - 3M gas

Optimize if costs exceed these ranges.

### Q: Can I upgrade my contract after deployment?

**A:** Yes, using proxy patterns:
- UUPS (Universal Upgradeable Proxy Standard)
- Transparent Proxy Pattern
- Beacon Proxy Pattern

See [Deployment Guide](./DEPLOYMENT-GUIDE.md) for upgrade instructions.

## Frontend Questions

### Q: What frontend frameworks should I use?

**A:** We support any framework, but recommend:
- **React** with Hooks
- **Vite** for build tool
- **Ethers.js v6** for Web3
- **MetaMask** for wallet integration

### Q: How do I connect MetaMask?

**A:** Use ethers.js:

```javascript
async function connectWallet() {
    const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
    });
    return accounts[0];
}
```

See [DEVELOPMENT-SETUP.md](./DEVELOPMENT-SETUP.md) for full example.

### Q: Do I need to handle mobile responsiveness?

**A:** Yes, best practices require:
- Mobile-friendly design (< 768px width)
- Touch-friendly buttons and inputs
- Responsive layouts
- Optimized performance for slower connections

### Q: How do I handle failed transactions?

**A:** Always implement error handling:

```javascript
try {
    const tx = await contract.vote(encrypted, proof);
    await tx.wait();
    console.log("Success!");
} catch (error) {
    console.error("Failed:", error.message);
    // Show user-friendly error
}
```

### Q: Should I store sensitive data in localStorage?

**A:** No! Security best practices:
- Never store private keys
- Never store seed phrases
- Keep sensitive data in memory only
- Use sessionStorage for temporary data
- Clear sensitive data on logout

## Testing Questions

### Q: What's the minimum test coverage required?

**A:**
- Smart Contracts: 80%+ (95%+ recommended)
- Frontend: 80%+ coverage
- Overall: 80%+ minimum

Aim higher for critical functions.

### Q: How do I generate a coverage report?

**A:**
```bash
npm run test:coverage
```

Coverage report will be in `coverage/` directory.

### Q: What testing framework should I use?

**A:** For smart contracts:
- **Chai** for assertions
- **Hardhat** for testing and compilation
- **hardhat-fhevm** for FHE operations

For frontend:
- **Jest** or **Vitest**
- **React Testing Library**
- **Cypress** for E2E tests

### Q: How do I test edge cases?

**A:** Include tests for:
- Minimum values (0, 1)
- Maximum values (type max)
- Boundary crossings
- Invalid inputs
- Overflow/underflow conditions
- Permission violations

Example:
```typescript
it("should reject invalid choice", async () => {
    await expect(
        contract.vote(999)  // Out of range
    ).to.be.reverted;
});
```

## Submission Questions

### Q: What do I need to submit?

**A:** Required:
- [ ] Working code in public GitHub repository
- [ ] Comprehensive tests (80%+ coverage)
- [ ] Complete documentation (README, API docs)
- [ ] Demonstration video (3-5 minutes)
- [ ] License file (MIT or Apache 2.0)

See [SUBMISSION-GUIDELINES.md](./SUBMISSION-GUIDELINES.md) for detailed requirements.

### Q: Can I submit code that I didn't write?

**A:** Only with proper attribution:
- Clearly credit original authors
- Include original license
- Document your modifications
- Ensure compatible licenses

Original work is valued more highly.

### Q: How do I create a demonstration video?

**A:**
1. **Record**: 720p minimum, 3-5 minutes
2. **Content**: Setup, features, code walkthrough, results
3. **Language**: English (subtitles if needed)
4. **Upload**: YouTube, Vimeo, Loom, or Google Drive
5. **Share**: Public or unlisted link

See [SUBMISSION-GUIDELINES.md](./SUBMISSION-GUIDELINES.md) for full requirements.

### Q: What if I miss the submission deadline?

**A:** Submissions received after 23:59 AoE on December 31, 2025 cannot be accepted. We recommend:
- Submitting 24 hours early to avoid issues
- Keeping local backup of submission
- Testing submission link before deadline

### Q: Can I update my submission after submitting?

**A:** Not recommended, but contact competitions@zama.ai if critical updates needed before review period starts.

## Security Questions

### Q: How do I ensure my code is secure?

**A:** Use the [SECURITY-CHECKLIST.md](./SECURITY-CHECKLIST.md):
- Input validation
- Access control checks
- FHE permission verification
- Reentrancy protection
- Overflow/underflow prevention
- Security audit checklist

### Q: Should I have a professional security audit?

**A:** Not required, but helpful. We provide:
- Self-audit checklist
- Community peer review
- Best practices guide

Professional audits (OpenZeppelin, Trail of Bits) are optional but impressive.

### Q: What if I find a vulnerability in my code?

**A:** Before submitting:
1. Fix the vulnerability
2. Add test case
3. Document the fix in commit message
4. Update security documentation

Don't submit vulnerable code.

### Q: How do I report security issues responsibly?

**A:**
1. Email: security@zama.ai
2. Include: Detailed description, proof of concept, suggested fix
3. Allow time for patch before public disclosure
4. May be eligible for Bug Bounty ($3,000 pool)

## Judging Questions

### Q: How will submissions be evaluated?

**A:** Judging criteria (100 points total):
- **Code Quality**: 25 points
- **Innovation**: 20 points
- **Documentation**: 20 points
- **Testing & Reliability**: 20 points
- **Community Impact**: 15 points

See [COMPETITION-DESCRIPTION.md](./COMPETITION-DESCRIPTION.md) for details.

### Q: Who are the judges?

**A:** Judging panel includes:
- Zama team members
- Community experts
- Smart contract auditors
- Business development leads

### Q: How can the community vote for "Community Favorite"?

**A:** Details will be announced after submissions close. Community voting:
- Open to anyone
- Weighted equally with judges
- $2,000 prize for winner
- Announced January 10, 2026

### Q: When will I hear results?

**A:** Timeline:
- Jan 1-5: Final judging
- Jan 6-10: Final scoring and coordination
- Jan 10: Public announcement

## Help & Support Questions

### Q: Where can I get help?

**A:** Multiple support channels:
- **Discord**: https://discord.com/invite/zama (real-time chat)
- **Forum**: https://www.zama.ai/community (detailed discussions)
- **GitHub Issues**: Bug reports and feature requests
- **Email**: competitions@zama.ai (official inquiries)

### Q: Are there office hours?

**A:** Yes! Weekly office hours:
- **Time**: Every Thursday, 3:00 PM UTC
- **Format**: Live Q&A session
- **Link**: Posted on Discord
- **Topics**: Development, security, deployment

### Q: How do I get mentorship?

**A:** Request mentorship:
1. Email: community@zama.ai
2. Include: Your project idea, background
3. Zama team will match you with a mentor
4. Mentors available for guidance only (not coding)

### Q: What if I'm stuck on a technical issue?

**A:**
1. Check relevant documentation:
   - [DEVELOPMENT-SETUP.md](./DEVELOPMENT-SETUP.md)
   - [TESTING-VALIDATION-CHECKLIST.md](./TESTING-VALIDATION-CHECKLIST.md)
   - [Troubleshooting sections](./DEPLOYMENT-GUIDE.md)

2. Search community forum for similar issues

3. Ask on Discord with:
   - Clear problem description
   - Error messages
   - Code snippet
   - Steps to reproduce

4. Post GitHub issue with detailed information

### Q: How do I report a bug in the platform?

**A:**
1. GitHub Issues (preferred): https://github.com/anonymous-esports/AnonymousEsports/issues
2. Discord: #bugs channel
3. Email: support@zama.ai (urgent issues)

Include:
- Clear title
- Description
- Steps to reproduce
- Expected vs actual behavior

## General Questions

### Q: What's the code of conduct?

**A:** All participants agree to:
- Be respectful and inclusive
- Use professional language
- Refrain from harassment
- Follow project guidelines
- Report violations to conduct@zama.ai

### Q: Can I fork the repository?

**A:** Yes! You should fork to create your contribution:
1. Fork the repository
2. Create feature branch
3. Make changes
4. Submit pull request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

### Q: What license should I use?

**A:** Your contribution must use:
- **MIT License** (recommended)
- **Apache 2.0 License**
- **BSD-3-Clause-Clear** (for Solidity)

All must be compatible with existing project licenses.

### Q: Will my contribution be public?

**A:** Yes! All submissions must be:
- Open source
- Publicly visible
- Under appropriate license
- Community accessible

We may use submissions to improve the platform.

### Q: Can I use this for my portfolio?

**A:** Absolutely! You can:
- Link to your GitHub repository
- Mention the competition on your resume
- Include in portfolio projects
- Write blog post about it

Great for demonstrating skills to employers!

## Still Have Questions?

If your question isn't answered here:

1. **Search**: Check documentation and forum
2. **Ask Community**: Discord or forum
3. **Email**: competitions@zama.ai
4. **Office Hours**: Join weekly Thursday sessions

---

**Thank you for your interest! We're excited to see what you build!** 🚀

*For more information, see [COMPETITION-QUICK-START.md](./COMPETITION-QUICK-START.md)*
