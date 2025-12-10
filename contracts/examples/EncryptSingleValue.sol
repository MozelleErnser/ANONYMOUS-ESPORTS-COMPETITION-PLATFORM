// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypt Single Value
/// @notice Demonstrates encryption of a single value with input proofs
/// @dev This example teaches:
///      - What input proofs are and why they're needed
///      - How to correctly encrypt and store a single value
///      - Common mistakes with encryption binding
///      - Proper permission management
contract EncryptSingleValue is ZamaEthereumConfig {
    /// @notice Mapping of user addresses to their encrypted values
    mapping(address => euint32) private _userValues;

    /// @notice Emitted when a user stores an encrypted value
    event ValueStored(address indexed user);

    /// @notice Emitted when a user retrieves their encrypted value
    event ValueRetrieved(address indexed user);

    /// @notice Stores an encrypted value for the caller
    /// @param encryptedValue The encrypted value to store
    /// @param inputProof The zero-knowledge proof that validates encryption binding
    /// @dev Input proofs ensure that:
    ///      1. The encrypted value was created by the caller
    ///      2. The value is bound to this specific contract
    ///      3. Nobody can replay the encryption for a different context
    function storeValue(externalEuint32 calldata encryptedValue, bytes calldata inputProof) external {
        // Convert external encrypted input to internal encrypted type
        // This validates the input proof and ensures proper binding
        euint32 value = FHE.fromExternal(encryptedValue, inputProof);

        // Store the encrypted value
        _userValues[msg.sender] = value;

        // ✅ CRITICAL: Grant permissions
        // Contract needs permission to store and work with the value
        FHE.allowThis(_userValues[msg.sender]);

        // User needs permission to access their own value
        FHE.allow(_userValues[msg.sender], msg.sender);

        emit ValueStored(msg.sender);
    }

    /// @notice Updates the stored encrypted value
    /// @param newEncryptedValue The new encrypted value
    /// @param inputProof The input proof for the new value
    /// @dev Demonstrates updating encrypted state
    function updateValue(externalEuint32 calldata newEncryptedValue, bytes calldata inputProof) external {
        euint32 newValue = FHE.fromExternal(newEncryptedValue, inputProof);

        // Update the value
        _userValues[msg.sender] = newValue;

        // Re-grant permissions for the new value
        FHE.allowThis(_userValues[msg.sender]);
        FHE.allow(_userValues[msg.sender], msg.sender);

        emit ValueStored(msg.sender);
    }

    /// @notice Retrieves the caller's encrypted value
    /// @return The encrypted value (only accessible to the owner)
    /// @dev The caller must have permission to access this value
    ///      Cannot be 'view' because it returns encrypted data
    function getValue() external view returns (euint32) {
        emit ValueRetrieved(msg.sender);
        return _userValues[msg.sender];
    }

    /// @notice Checks if the caller has stored a value
    /// @return True if the user has stored a value, false otherwise
    function hasValue() external view returns (bool) {
        // We can't directly check if an encrypted value is "zero" easily
        // This is a simplified version for demonstration
        // In practice, you might track this with a separate boolean
        return true; // Simplified for example
    }

    /// @notice Clears the caller's stored value
    /// @dev Resets to encrypted zero
    function clearValue() external {
        _userValues[msg.sender] = FHE.asEuint32(0);
        FHE.allowThis(_userValues[msg.sender]);
        FHE.allow(_userValues[msg.sender], msg.sender);
    }

    /// @title Common Mistakes to Avoid
    /// @dev These commented functions show incorrect implementations

    /*
    /// ❌ MISTAKE 1: Missing input proof validation
    function storeValueWrong1(euint32 value) external {
        // ERROR: Accepting euint32 directly without proof
        // This bypasses encryption binding validation
        // Someone could pass an encrypted value meant for another contract
        _userValues[msg.sender] = value;
    }

    /// ❌ MISTAKE 2: Missing FHE.allowThis()
    function storeValueWrong2(externalEuint32 calldata encryptedValue, bytes calldata inputProof) external {
        euint32 value = FHE.fromExternal(encryptedValue, inputProof);
        _userValues[msg.sender] = value;

        // ERROR: Missing FHE.allowThis()
        // The contract won't be able to use this value in future operations
        FHE.allow(_userValues[msg.sender], msg.sender);
    }

    /// ❌ MISTAKE 3: Missing user permission
    function storeValueWrong3(externalEuint32 calldata encryptedValue, bytes calldata inputProof) external {
        euint32 value = FHE.fromExternal(encryptedValue, inputProof);
        _userValues[msg.sender] = value;

        FHE.allowThis(_userValues[msg.sender]);
        // ERROR: Missing FHE.allow() for user
        // User won't be able to decrypt their own value
    }

    /// ❌ MISTAKE 4: Returning encrypted value in view function
    function getValueWrong() external view returns (euint32) {
        // ERROR: This might seem to work but violates FHE semantics
        // Encrypted values should not be returned from pure view functions
        // They require active permission checks
        return _userValues[msg.sender];
    }

    /// ❌ MISTAKE 5: Granting wrong permissions
    function storeValueWrong4(externalEuint32 calldata encryptedValue, bytes calldata inputProof, address wrongUser) external {
        euint32 value = FHE.fromExternal(encryptedValue, inputProof);
        _userValues[msg.sender] = value;

        FHE.allowThis(_userValues[msg.sender]);
        // ERROR: Granting permission to wrong address
        // Should be msg.sender, not an arbitrary address
        FHE.allow(_userValues[msg.sender], wrongUser);
    }
    */

    /// @notice Example of proper error handling
    /// @param encryptedValue The encrypted value
    /// @param inputProof The input proof
    function storeValueWithValidation(
        externalEuint32 calldata encryptedValue,
        bytes calldata inputProof
    ) external {
        // Could add additional validation here
        require(inputProof.length > 0, "Input proof required");

        euint32 value = FHE.fromExternal(encryptedValue, inputProof);

        _userValues[msg.sender] = value;

        // Proper permissions
        FHE.allowThis(_userValues[msg.sender]);
        FHE.allow(_userValues[msg.sender], msg.sender);

        emit ValueStored(msg.sender);
    }
}
