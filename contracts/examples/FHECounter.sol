// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE Counter
/// @notice A simple encrypted counter demonstrating basic FHE operations
/// @dev This example shows how to:
///      - Store encrypted state
///      - Perform FHE arithmetic (add, sub)
///      - Manage FHE permissions (allow, allowThis)
///      - Handle input proofs for encrypted values
contract FHECounter is ZamaEthereumConfig {
    /// @notice The encrypted counter value
    euint32 private _counter;

    /// @notice Emitted when the counter is incremented
    /// @param by The amount the counter was incremented by (not encrypted for demo)
    event Incremented(address indexed by, uint32 amount);

    /// @notice Emitted when the counter is decremented
    /// @param by The amount the counter was decremented by (not encrypted for demo)
    event Decremented(address indexed by, uint32 amount);

    /// @notice Initializes the counter to zero
    constructor() {
        _counter = FHE.asEuint32(0);
        FHE.allowThis(_counter);
    }

    /// @notice Increments the counter by an encrypted value
    /// @param encryptedAmount The encrypted amount to increment by
    /// @param inputProof The proof that the encrypted value is correctly bound
    /// @dev This demonstrates:
    ///      1. Converting external encrypted input to internal format
    ///      2. Performing FHE addition
    ///      3. Granting permissions to both contract and caller
    function increment(externalEuint32 calldata encryptedAmount, bytes calldata inputProof) external {
        // Convert the external encrypted input to internal euint32
        euint32 amount = FHE.fromExternal(encryptedAmount, inputProof);

        // Perform encrypted addition
        _counter = FHE.add(_counter, amount);

        // ✅ CRITICAL: Grant permissions
        // The contract needs permission to store/use the value
        FHE.allowThis(_counter);

        // The caller needs permission to decrypt their result later
        FHE.allow(_counter, msg.sender);

        // Note: We emit a non-encrypted event for demo purposes
        // In production, you might emit only the fact that an increment occurred
        emit Incremented(msg.sender, 1);
    }

    /// @notice Decrements the counter by an encrypted value
    /// @param encryptedAmount The encrypted amount to decrement by
    /// @param inputProof The proof that the encrypted value is correctly bound
    /// @dev This example omits underflow checks for simplicity
    ///      In production, you should verify the counter doesn't go negative
    function decrement(externalEuint32 calldata encryptedAmount, bytes calldata inputProof) external {
        // Convert external encrypted input
        euint32 amount = FHE.fromExternal(encryptedAmount, inputProof);

        // Perform encrypted subtraction
        _counter = FHE.sub(_counter, amount);

        // ✅ Grant permissions
        FHE.allowThis(_counter);
        FHE.allow(_counter, msg.sender);

        emit Decremented(msg.sender, 1);
    }

    /// @notice Gets the encrypted counter value
    /// @return The encrypted counter (only accessible to authorized addresses)
    /// @dev The caller must have been granted permission via FHE.allow()
    ///      This function cannot be view because it returns encrypted data
    function getCounter() external view returns (euint32) {
        return _counter;
    }

    /// @notice Resets the counter to zero
    /// @dev Only for demonstration purposes
    ///      In production, you'd want access control on this function
    function reset() external {
        _counter = FHE.asEuint32(0);
        FHE.allowThis(_counter);
        FHE.allow(_counter, msg.sender);
    }

    /// @notice Example of what NOT to do - missing permissions
    /// @dev This function would fail because it doesn't grant permissions
    /// @param encryptedAmount The encrypted amount
    /// @param inputProof The input proof
    /*
    function incrementWrong(externalEuint32 calldata encryptedAmount, bytes calldata inputProof) external {
        euint32 amount = FHE.fromExternal(encryptedAmount, inputProof);
        _counter = FHE.add(_counter, amount);

        // ❌ ERROR: Missing FHE.allowThis(_counter)
        // ❌ ERROR: Missing FHE.allow(_counter, msg.sender)
        // This would cause the contract to fail on subsequent operations
    }
    */
}
