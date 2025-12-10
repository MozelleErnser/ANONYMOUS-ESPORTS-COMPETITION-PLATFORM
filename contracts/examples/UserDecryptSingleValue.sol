// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title User Decrypt Single Value
/// @notice Demonstrates how users decrypt their encrypted values
/// @dev This example teaches:
///      - The permission model for decryption
///      - Using FHE.allow() to grant decryption rights
///      - Client-side decryption workflow
///      - Security considerations for value exposure
contract UserDecryptSingleValue is ZamaEthereumConfig {
    /// @notice Mapping of user addresses to their encrypted balances
    mapping(address => euint32) private _balances;

    /// @notice Emitted when a user stores a value
    event ValueStored(address indexed user);

    /// @notice Emitted when a user is granted decryption permission
    event DecryptionPermissionGranted(address indexed user);

    /// @notice Stores an encrypted balance for the caller
    /// @param encryptedBalance The encrypted balance to store
    /// @param inputProof The proof validating encryption binding
    /// @dev After storing, the user can decrypt their balance using FHEVM client
    function storeBalance(externalEuint32 calldata encryptedBalance, bytes calldata inputProof) external {
        euint32 balance = FHE.fromExternal(encryptedBalance, inputProof);

        _balances[msg.sender] = balance;

        // Grant contract permission for future operations
        FHE.allowThis(_balances[msg.sender]);

        // ✅ CRITICAL: Grant user permission for decryption
        // Without this, the user cannot decrypt their own value
        FHE.allow(_balances[msg.sender], msg.sender);

        emit ValueStored(msg.sender);
        emit DecryptionPermissionGranted(msg.sender);
    }

    /// @notice Gets the caller's encrypted balance
    /// @return The encrypted balance (can be decrypted by the owner)
    /// @dev Client-side workflow:
    ///      1. Call this function to get encrypted value
    ///      2. Use fhevm.decrypt() on client to decrypt
    ///      3. Provide signature proving you're the authorized user
    function getBalance() external view returns (euint32) {
        return _balances[msg.sender];
    }

    /// @notice Adds an encrypted amount to the caller's balance
    /// @param encryptedAmount The encrypted amount to add
    /// @param inputProof The input proof
    /// @dev Demonstrates operations on encrypted state with re-granting permissions
    function addToBalance(externalEuint32 calldata encryptedAmount, bytes calldata inputProof) external {
        euint32 amount = FHE.fromExternal(encryptedAmount, inputProof);

        // Perform encrypted addition
        _balances[msg.sender] = FHE.add(_balances[msg.sender], amount);

        // Re-grant permissions after modification
        FHE.allowThis(_balances[msg.sender]);
        FHE.allow(_balances[msg.sender], msg.sender);

        emit DecryptionPermissionGranted(msg.sender);
    }

    /// @notice Grants another user permission to view caller's balance
    /// @param viewer The address to grant permission to
    /// @dev This is a privacy-preserving delegation
    ///      The viewer can decrypt but not modify the balance
    function grantViewPermission(address viewer) external {
        require(viewer != address(0), "Invalid viewer address");
        require(viewer != msg.sender, "Cannot grant to self");

        // Grant decryption permission to another user
        FHE.allow(_balances[msg.sender], viewer);

        emit DecryptionPermissionGranted(viewer);
    }

    /// @notice Client-side decryption process (informational comment)
    /// @dev Example client-side code:
    ///
    /// ```typescript
    /// import { createFhevmInstance } from "@fhevm/sdk";
    ///
    /// async function decryptBalance() {
    ///     // 1. Initialize FHEVM instance
    ///     const fhevm = await createFhevmInstance({
    ///         networkUrl: RPC_URL,
    ///         chainId: CHAIN_ID,
    ///         aclAddress: ACL_CONTRACT_ADDRESS
    ///     });
    ///
    ///     // 2. Get encrypted balance from contract
    ///     const encryptedBalance = await contract.getBalance();
    ///
    ///     // 3. Request decryption (requires user signature)
    ///     const { publicKey, privateKey } = fhevm.generateKeypair();
    ///     const eip712 = fhevm.createEIP712(
    ///         publicKey,
    ///         await contract.getAddress()
    ///     );
    ///
    ///     // 4. Sign the EIP-712 message
    ///     const signature = await signer.signTypedData(
    ///         eip712.domain,
    ///         eip712.types,
    ///         eip712.message
    ///     );
    ///
    ///     // 5. Decrypt the value
    ///     const decryptedBalance = await fhevm.decrypt(
    ///         encryptedBalance,
    ///         privateKey
    ///     );
    ///
    ///     console.log("Decrypted balance:", decryptedBalance);
    /// }
    /// ```

    /// @notice Checks if a user has stored a balance
    /// @return True if the user has a balance stored
    function hasBalance() external view returns (bool) {
        // Note: We can't directly check if encrypted value is zero
        // This is simplified for demonstration
        return true;
    }

    /// @title Security Considerations
    /// @dev IMPORTANT: Decryption exposes the plaintext value
    ///
    /// 1. ⚠️  Once decrypted, the value is no longer private
    ///    - Only decrypt when necessary
    ///    - Ensure secure channel for decrypted data
    ///
    /// 2. ⚠️  Permissions are permanent until revoked
    ///    - Be careful who you grant FHE.allow() to
    ///    - No built-in revocation mechanism
    ///
    /// 3. ⚠️  Client-side decryption requires signature
    ///    - Protects against unauthorized decryption requests
    ///    - Uses EIP-712 for secure signing
    ///
    /// 4. ⚠️  Network observers cannot see plaintext
    ///    - Encrypted on-chain
    ///    - Only authorized addresses with proper keys can decrypt
    ///
    /// 5. ⚠️  Gas costs for decryption
    ///    - Client-side decryption is free
    ///    - On-chain operations still cost gas

    /// @title Common Mistakes
    /// @dev Examples of incorrect implementations

    /*
    /// ❌ MISTAKE 1: Missing FHE.allow() for user
    function storeBalanceWrong1(externalEuint32 calldata encryptedBalance, bytes calldata inputProof) external {
        euint32 balance = FHE.fromExternal(encryptedBalance, inputProof);
        _balances[msg.sender] = balance;
        FHE.allowThis(_balances[msg.sender]);

        // ERROR: Missing FHE.allow(_balances[msg.sender], msg.sender)
        // User cannot decrypt their own balance
    }

    /// ❌ MISTAKE 2: Granting permission to wrong address
    function storeBalanceWrong2(externalEuint32 calldata encryptedBalance, bytes calldata inputProof) external {
        euint32 balance = FHE.fromExternal(encryptedBalance, inputProof);
        _balances[msg.sender] = balance;
        FHE.allowThis(_balances[msg.sender]);

        // ERROR: Granting to contract address instead of user
        FHE.allow(_balances[msg.sender], address(this));
    }

    /// ❌ MISTAKE 3: Forgetting to re-grant after modification
    function addToBalanceWrong(externalEuint32 calldata encryptedAmount, bytes calldata inputProof) external {
        euint32 amount = FHE.fromExternal(encryptedAmount, inputProof);
        _balances[msg.sender] = FHE.add(_balances[msg.sender], amount);

        // ERROR: Missing permission re-grant
        // After FHE.add(), new euint32 is created
        // Old permissions don't transfer automatically
    }

    /// ❌ MISTAKE 4: Not validating viewer address
    function grantViewPermissionWrong(address viewer) external {
        // ERROR: No validation
        // Could grant to zero address or self
        FHE.allow(_balances[msg.sender], viewer);
    }
    */

    /// @notice Example of proper permission management pattern
    /// @param encryptedValue The encrypted value
    /// @param inputProof The input proof
    function properPermissionPattern(externalEuint32 calldata encryptedValue, bytes calldata inputProof) external {
        // 1. Convert encrypted input
        euint32 value = FHE.fromExternal(encryptedValue, inputProof);

        // 2. Store the value
        _balances[msg.sender] = value;

        // 3. Grant contract permission (for future operations)
        FHE.allowThis(_balances[msg.sender]);

        // 4. Grant user permission (for decryption)
        FHE.allow(_balances[msg.sender], msg.sender);

        // ✅ This pattern ensures:
        // - Contract can use the value in operations
        // - User can decrypt their own value
        // - Proper encryption binding is maintained
    }
}
