// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Public Decryption Example
/// @notice Demonstrates asynchronous public decryption in FHEVM
/// @dev This example teaches:
///      - Using Gateway for threshold decryption
///      - Async callback pattern for decryption results
///      - When to use public vs private decryption
///      - Security considerations for revealing values
contract PublicDecryption is ZamaEthereumConfig {
    /// @notice Gateway contract address for threshold decryption
    /// @dev In production, this would be the actual Gateway address
    address public gateway;

    /// @notice Encrypted auction bid
    euint32 private _encryptedBid;

    /// @notice Decrypted bid (available after reveal)
    uint32 public decryptedBid;

    /// @notice Whether the bid has been revealed
    bool public isRevealed;

    /// @notice Auction winner address
    address public winner;

    /// @notice Emitted when a bid is placed
    event BidPlaced(address indexed bidder);

    /// @notice Emitted when decryption is requested
    event DecryptionRequested(uint256 requestId);

    /// @notice Emitted when bid is revealed
    event BidRevealed(address indexed bidder, uint32 amount);

    constructor(address _gateway) {
        require(_gateway != address(0), "Invalid gateway address");
        gateway = _gateway;
    }

    /// @notice Places an encrypted bid
    /// @param encryptedAmount The encrypted bid amount
    /// @param inputProof The input proof
    /// @dev Bid remains private until explicitly revealed
    function placeBid(externalEuint32 calldata encryptedAmount, bytes calldata inputProof) external {
        require(!isRevealed, "Auction already revealed");

        euint32 amount = FHE.fromExternal(encryptedAmount, inputProof);

        _encryptedBid = amount;
        winner = msg.sender;

        // Grant permissions
        FHE.allowThis(_encryptedBid);
        FHE.allow(_encryptedBid, msg.sender);

        emit BidPlaced(msg.sender);
    }

    /// @notice Requests public decryption of the bid
    /// @dev This initiates asynchronous threshold decryption
    ///      The Gateway will process the request and call back
    /// @return requestId The ID for tracking this decryption request
    function revealBid() external returns (uint256 requestId) {
        require(!isRevealed, "Already revealed");
        require(winner == msg.sender, "Only winner can reveal");

        // ✅ Request public decryption via Gateway
        // The Gateway performs threshold decryption
        // Multiple validators decrypt shares and combine them
        // This is async - result comes via callback

        // In real implementation:
        // requestId = Gateway.requestDecryption(
        //     _encryptedBid,
        //     this.decryptionCallback.selector
        // );

        // For this example, we simulate the pattern:
        requestId = uint256(keccak256(abi.encode(_encryptedBid, block.timestamp)));

        emit DecryptionRequested(requestId);

        return requestId;
    }

    /// @notice Callback function for Gateway to provide decryption result
    /// @param requestId The decryption request ID
    /// @param decryptedValue The decrypted plaintext value
    /// @dev Only the Gateway can call this function
    ///      This is the async callback pattern for public decryption
    function decryptionCallback(uint256 requestId, uint32 decryptedValue) external {
        // ✅ CRITICAL: Verify caller is Gateway
        require(msg.sender == gateway, "Only Gateway can callback");

        // Store the decrypted value
        decryptedBid = decryptedValue;
        isRevealed = true;

        emit BidRevealed(winner, decryptedValue);
    }

    /// @notice Gets the current encrypted bid
    /// @return The encrypted bid (private)
    function getEncryptedBid() external view returns (euint32) {
        return _encryptedBid;
    }

    /// @notice Example: Comparing bids without revealing
    /// @param challengerBid Encrypted challenger bid
    /// @param proofChallenger Proof for challenger bid
    /// @return True if challenger bid is higher (encrypted)
    /// @dev Shows computation on encrypted data without decryption
    function isChallengerHigher(
        externalEuint32 calldata challengerBid,
        bytes calldata proofChallenger
    ) external view returns (bool) {
        euint32 challenger = FHE.fromExternal(challengerBid, proofChallenger);

        // Compare encrypted values
        // Note: This returns ebool (encrypted boolean)
        // To use the result in Solidity, would need to decrypt
        // For demonstration, we simplified to bool return
        // In practice: return FHE.gt(challenger, _encryptedBid);

        return false; // Placeholder
    }

    /// @title When to Use Public Decryption
    /// @dev Use cases for public decryption:
    ///
    /// 1. ✅ Auction reveals
    ///    - Bids stay private during auction
    ///    - Winner revealed at end
    ///
    /// 2. ✅ Voting results
    ///    - Votes encrypted during voting period
    ///    - Tally revealed after voting closes
    ///
    /// 3. ✅ Fair random number generation
    ///    - Commitments encrypted
    ///    - Reveal after commitment phase
    ///
    /// 4. ✅ Escrow release conditions
    ///    - Conditions evaluated on encrypted data
    ///    - Result decrypted to trigger release
    ///
    /// 5. ✅ Tournament brackets
    ///    - Scores encrypted during matches
    ///    - Winners revealed progressively

    /// @title Public Decryption Process Flow
    /// @dev Understanding the async pattern:
    ///
    /// Step 1: Contract requests decryption
    /// ```solidity
    /// uint256 requestId = Gateway.requestDecryption(
    ///     encryptedValue,
    ///     this.myCallback.selector
    /// );
    /// ```
    ///
    /// Step 2: Gateway validators perform threshold decryption
    /// - Multiple validators each decrypt a share
    /// - Shares are combined to recover plaintext
    /// - No single validator knows the full plaintext
    ///
    /// Step 3: Gateway calls back with result
    /// ```solidity
    /// function myCallback(uint256 requestId, uint32 plaintext) external {
    ///     require(msg.sender == gateway);
    ///     // Use decrypted value
    /// }
    /// ```
    ///
    /// Step 4: Contract processes plaintext
    /// - Now you can use standard Solidity logic
    /// - Value is public on-chain

    /// @title Security Considerations
    /// @dev IMPORTANT security notes:
    ///
    /// 1. ⚠️  Only Gateway should call callback
    ///    - Always check msg.sender == gateway
    ///    - Otherwise, attacker can fake decryption results
    ///
    /// 2. ⚠️  Decryption is irreversible
    ///    - Once public, cannot make private again
    ///    - Only decrypt when necessary
    ///
    /// 3. ⚠️  Timing considerations
    ///    - Decryption is async, takes multiple blocks
    ///    - Don't assume immediate results
    ///    - Plan UX around async nature
    ///
    /// 4. ⚠️  Gas costs
    ///    - Public decryption is expensive (~200k+ gas)
    ///    - Plan for callback transaction costs
    ///
    /// 5. ⚠️  Request ID validation
    ///    - Track request IDs to prevent replay
    ///    - Ensure one callback per request

    /// @title Comparison: Public vs Private Decryption
    /// @dev Choose the right approach:
    ///
    /// PUBLIC DECRYPTION (via Gateway):
    /// - Result visible to everyone on-chain
    /// - Uses threshold decryption (secure)
    /// - Async callback pattern
    /// - Higher gas cost (~200k+)
    /// - Use when: Result needs to be publicly verifiable
    ///
    /// PRIVATE DECRYPTION (client-side):
    /// - Result only visible to authorized user
    /// - User decrypts with their private key
    /// - Synchronous (client-side)
    /// - Lower gas cost (just FHE.allow)
    /// - Use when: Result is personal/private

    /// @title Common Mistakes
    /*
    /// ❌ MISTAKE 1: Not checking callback sender
    function decryptionCallbackWrong(uint256 requestId, uint32 decryptedValue) external {
        // ERROR: No sender verification
        // Attacker can call with fake values
        decryptedBid = decryptedValue;
    }

    /// ❌ MISTAKE 2: Assuming synchronous decryption
    function revealBidWrong() external returns (uint32) {
        Gateway.requestDecryption(_encryptedBid, this.decryptionCallback.selector);
        // ERROR: Trying to return decrypted value immediately
        return decryptedBid; // Will be old value, not newly decrypted
    }

    /// ❌ MISTAKE 3: Not tracking request IDs
    function decryptionCallbackWrong2(uint256 requestId, uint32 decryptedValue) external {
        require(msg.sender == gateway);
        // ERROR: Not tracking which requests are pending
        // Vulnerable to replay attacks
        decryptedBid = decryptedValue;
    }

    /// ❌ MISTAKE 4: Decrypting unnecessarily
    function getPlaintextBidWrong() external returns (uint256) {
        // ERROR: Decrypting for simple query
        // Should use client-side decryption instead
        return Gateway.requestDecryption(_encryptedBid, this.decryptionCallback.selector);
    }
    */

    /// @notice Example of proper async pattern
    /// @dev Demonstrates correct flow
    mapping(uint256 => bool) private _pendingRequests;

    function properAsyncPattern() external returns (uint256 requestId) {
        // 1. Request decryption
        requestId = uint256(keccak256(abi.encode(_encryptedBid, block.timestamp)));

        // 2. Track pending request
        _pendingRequests[requestId] = true;

        emit DecryptionRequested(requestId);

        // 3. Return request ID for tracking
        // Client should poll or listen for BidRevealed event
        return requestId;
    }

    function properCallbackPattern(uint256 requestId, uint32 decryptedValue) external {
        // 1. Verify sender
        require(msg.sender == gateway, "Only Gateway");

        // 2. Verify request is pending
        require(_pendingRequests[requestId], "Invalid request");

        // 3. Mark as processed
        _pendingRequests[requestId] = false;

        // 4. Use the decrypted value
        decryptedBid = decryptedValue;
        isRevealed = true;

        emit BidRevealed(winner, decryptedValue);
    }
}
