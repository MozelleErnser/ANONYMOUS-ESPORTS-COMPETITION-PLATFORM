// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Example FHEVM Contract
/// @notice Template contract demonstrating basic FHEVM usage
/// @dev Replace this with your own contract logic
contract Example is ZamaEthereumConfig {
    /// @notice Encrypted value storage
    euint32 private _value;

    /// @notice Emitted when value is updated
    event ValueUpdated(address indexed updater);

    /// @notice Stores an encrypted value
    /// @param encryptedValue The encrypted value to store
    /// @param inputProof The zero-knowledge proof for encryption binding
    function storeValue(externalEuint32 calldata encryptedValue, bytes calldata inputProof) external {
        // Convert external encrypted input to internal format
        euint32 value = FHE.fromExternal(encryptedValue, inputProof);

        // Store the encrypted value
        _value = value;

        // Grant permissions
        FHE.allowThis(_value);
        FHE.allow(_value, msg.sender);

        emit ValueUpdated(msg.sender);
    }

    /// @notice Retrieves the encrypted value
    /// @return The encrypted value
    function getValue() external view returns (euint32) {
        return _value;
    }
}
