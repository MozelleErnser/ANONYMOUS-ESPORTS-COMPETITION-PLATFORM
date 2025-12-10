# Anonymous Esports - Contributing Guidelines

Thank you for your interest in contributing to the Anonymous Esports Competition Platform! This document provides guidance for all types of contributions.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment.

- **Be Respectful**: Treat all contributors with respect
- **Be Professional**: Use professional language and behavior
- **Be Inclusive**: Welcome diverse perspectives and backgrounds
- **Be Constructive**: Provide helpful feedback
- **Report Issues**: Report violations to conduct@zama.ai

## How to Contribute

### Types of Contributions

1. **Bug Reports**: Report issues you find
2. **Feature Requests**: Suggest new functionality
3. **Code Improvements**: Submit pull requests
4. **Documentation**: Improve guides and examples
5. **Tests**: Improve test coverage
6. **Security**: Report vulnerabilities responsibly

### Getting Started

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/AnonymousEsports.git
   cd AnonymousEsports
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow code standards
   - Write tests
   - Update documentation

4. **Commit with Clear Messages**
   ```bash
   git commit -m "Type: Brief description

   Detailed explanation if needed.
   - Point 1
   - Point 2"
   ```

5. **Push and Create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass locally
- [ ] Test coverage is adequate (80%+)
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] No merge conflicts
- [ ] No sensitive data in code

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Test improvement

## Related Issues
Fixes #issue-number

## Testing
Describe testing done:
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manual testing done

## Gas Impact
- Estimated gas change: +/- X%
- Functions affected: function1, function2

## Documentation
- [ ] README updated
- [ ] Comments added
- [ ] API docs updated
- [ ] Examples provided

## Checklist
- [ ] Code follows style guide
- [ ] Tests pass locally
- [ ] No breaking changes
- [ ] Commit messages are clear
```

## Contribution Areas

### Smart Contracts

**What to contribute**:
- New voting mechanisms
- Access control improvements
- FHE operation examples
- Gas optimizations

**Requirements**:
- Follow Solidity style guide
- Comprehensive tests (95%+ coverage)
- Security audit checklist completed
- Clear documentation

**Files to modify**:
- `contracts/examples/YourName.sol`
- `test/examples/YourName.test.ts`
- `docs/examples/your-name/overview.md`

### Frontend

**What to contribute**:
- UI improvements
- New components
- Better user experience
- Mobile responsiveness

**Requirements**:
- React best practices
- Accessibility (WCAG)
- Mobile responsive
- Component tests

**Files to modify**:
- `src/components/YourComponent.jsx`
- `src/hooks/useYourHook.js`
- `src/styles/your-component.css`

### Documentation

**What to contribute**:
- Improve existing docs
- Add examples
- Fix errors
- Add tutorials

**Requirements**:
- Clear and accurate
- Complete examples
- Proper formatting
- Links validated

**Files to modify**:
- `docs/**/*.md`
- `README.md`
- Example comments

### Tests

**What to contribute**:
- Improve test coverage
- Add edge case tests
- Security tests
- Performance tests

**Requirements**:
- Follow test patterns
- Clear descriptions
- Good assertions
- Isolated tests

### Security

**What to contribute**:
- Report vulnerabilities
- Suggest improvements
- Add security tests
- Review security docs

**Requirements**:
- Responsible disclosure
- Clear description
- Proof of concept (if possible)
- Suggested fix (if possible)

## Code Standards

### Solidity

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Clear contract name
/// @notice What this contract does
/// @dev Implementation notes
contract FollowsStandards is ZamaEthereumConfig {
    // State variables: clear names, proper visibility
    euint32 private _encryptedValue;
    uint256 public constant MAX_VALUE = 1000;

    // Events: indexed parameters, clear names
    /// @notice Emitted when something happens
    event ActionPerformed(indexed address actor, uint256 timestamp);

    // Functions: public, external, internal, private order
    /// @notice What this function does
    /// @param paramName Parameter description
    /// @return Return value description
    function doSomething(uint256 param) external {
        // Implementation with comments
    }
}
```

### TypeScript/JavaScript

```typescript
// Use meaningful names
const userVotes: Map<string, number> = new Map();

// Use async/await for clarity
async function fetchResults(competitionId: number): Promise<Results> {
    try {
        const response = await fetch(`/api/competitions/${competitionId}`);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch results:", error);
        throw error;
    }
}

// Use JSDoc comments for functions
/**
 * Calculates weighted vote
 * @param {number} vote - The vote value
 * @param {number} weight - The weight factor
 * @returns {number} Weighted vote
 */
function calculateWeighted(vote: number, weight: number): number {
    return vote * weight;
}
```

### Documentation

```markdown
# Use H1 for Title

Brief paragraph describing the topic.

## Section Heading

More detailed content.

### Subsection

- Use lists
- For clarity

**Bold** for emphasis

`code` for inline code

\`\`\`solidity
// Code block with language
\`\`\`

**See Also**: [Related Document](./related.md)
```

## Testing Standards

### Test Structure

```typescript
describe("Feature Name", () => {
    let contract: Contract;
    let owner: Signer;

    beforeEach(async () => {
        // Setup
    });

    describe("positive cases", () => {
        it("should do X when condition Y", async () => {
            // Arrange
            const input = 100;

            // Act
            const result = await contract.function(input);

            // Assert
            expect(result).to.equal(expectedOutput);
        });
    });

    describe("negative cases", () => {
        it("should revert with message when invalid", async () => {
            await expect(contract.function(invalidInput)).to.be.revertedWith(
                "Error message"
            );
        });
    });

    describe("edge cases", () => {
        it("should handle boundary values", async () => {
            // Edge case tests
        });
    });
});
```

### Coverage Requirements

| Component | Minimum Coverage |
|-----------|------------------|
| Smart Contracts | 95% |
| Frontend | 80% |
| Backend | 85% |
| Overall | 80% |

## Documentation Standards

### README Requirements

Every contribution should update documentation:

- [ ] Updated README.md with changes
- [ ] API documentation for new functions
- [ ] Usage examples
- [ ] Security considerations
- [ ] Known limitations
- [ ] Performance notes

### Comment Standards

```solidity
/// @title Contract title
/// @notice What contract does
/// @dev Implementation details

/// @notice Function description
/// @param paramName Parameter description
/// @return Return value description
function yourFunction(uint256 paramName) external returns (uint256) {
    // Single-line comments for clarity
    // Multi-line comments for complex logic

    // Explain the "why", not just the "what"
    // Because we need to validate before processing
    require(paramName > 0, "Parameter must be positive");

    return paramName * 2;
}
```

## Review Process

### What Reviewers Will Check

1. **Code Quality**: Style, clarity, correctness
2. **Functionality**: Does it work as described?
3. **Tests**: Adequate coverage and quality?
4. **Documentation**: Clear and complete?
5. **Security**: Any vulnerabilities?
6. **Performance**: Gas efficient? Scalable?
7. **Consistency**: Follows project patterns?

### Responding to Feedback

- [ ] Read feedback carefully
- [ ] Ask clarifying questions if needed
- [ ] Make requested changes
- [ ] Push new commits to same branch
- [ ] Mark conversations as resolved
- [ ] Request re-review when done

### Handling Disagreement

If you disagree with feedback:

1. Explain your perspective clearly
2. Provide evidence (benchmarks, examples)
3. Be open to compromise
4. Escalate to maintainers if unresolved

## Commit Message Standards

### Format

```
Type: Brief description (50 chars max)

Detailed explanation (wrap at 72 chars)
- Point 1
- Point 2
- Point 3

Fixes #issue-number
Related: #other-issue
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, missing semicolons, etc)
- `refactor`: Code change without feature/fix
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Build, dependencies, etc

### Examples

```
feat: Add weighted voting mechanism

Implements reputation-based vote weighting
- Users with higher reputation get more voting power
- Weights are encrypted using FHE
- Tests verify correct calculation

Fixes #123

---

fix: Prevent double voting

- Add check for existing vote
- Return clear error message
- Add test case

---

docs: Add security considerations to README

- Document FHE permission requirements
- Add common pitfalls section
- Update API documentation
```

## Review Timelines

### Expected Response Times

- **Comment Review**: 1-2 days
- **Code Review**: 3-5 days
- **Approval**: 5-7 days
- **Merge**: 1-2 days after approval

Times may vary based on complexity and maintainer availability.

## Licensing

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT or Apache 2.0).

You must ensure:
- Code is original or properly attributed
- No proprietary or restricted code
- All dependencies have compatible licenses

## Recognition

Contributors will be:
- Added to CONTRIBUTORS.md
- Credited in release notes
- Acknowledged in documentation
- Eligible for bounty programs

## Issue Guidelines

### Reporting Bugs

Provide:
- [ ] Clear title
- [ ] Detailed description
- [ ] Steps to reproduce
- [ ] Expected behavior
- [ ] Actual behavior
- [ ] Environment info (Node version, OS, etc)
- [ ] Code example (if applicable)

### Requesting Features

Include:
- [ ] Clear title
- [ ] Feature description
- [ ] Use case / motivation
- [ ] Proposed implementation (if any)
- [ ] Alternative approaches

### Security Issues

**Do NOT** open public issues for security vulnerabilities.

Instead:
1. Email security@zama.ai
2. Include detailed description
3. Provide proof of concept if possible
4. Suggest remediation if possible
5. Allow time for patch before disclosure

## Resources

### Documentation
- [Code Style Guide](./STYLE-GUIDE.md)
- [Security Checklist](./SECURITY-CHECKLIST.md)
- [Testing Guide](./TESTING-VALIDATION-CHECKLIST.md)
- [Deployment Guide](./DEPLOYMENT-GUIDE.md)

### Learning
- [FHEVM Docs](https://docs.zama.ai/fhevm)
- [Hardhat Docs](https://hardhat.org/)
- [Solidity Best Practices](https://docs.soliditylang.org/)

### Community
- [Discord](https://discord.com/invite/zama)
- [Forum](https://www.zama.ai/community)
- [GitHub Issues](https://github.com/anonymous-esports/AnonymousEsports/issues)

## Contact

- **Questions**: Ask on Discord or Forum
- **Issues**: Use GitHub Issues
- **Security**: security@zama.ai
- **General**: info@zama.ai

---

**Thank you for making the Anonymous Esports platform better!** 🙏

Your contributions help build the future of privacy-preserving Web3 applications.
