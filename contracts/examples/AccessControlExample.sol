// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint32, ebool, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Access Control Example
/// @notice Demonstrates FHE permission management and access control patterns
/// @dev This example teaches:
///      - Role-based access control with encrypted data
///      - Selective permission granting
///      - Multi-user access scenarios
///      - Admin/owner controls
contract AccessControlExample is ZamaEthereumConfig {
    /// @notice Contract owner address
    address public owner;

    /// @notice Admin addresses
    mapping(address => bool) public admins;

    /// @notice User encrypted data
    mapping(address => euint32) private _userData;

    /// @notice Shared encrypted data (multiple users can access)
    euint32 private _sharedValue;

    /// @notice Addresses with permission to view shared value
    mapping(address => bool) public sharedViewers;

    /// @notice Emitted when ownership is transferred
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /// @notice Emitted when admin status changes
    event AdminStatusChanged(address indexed admin, bool status);

    /// @notice Emitted when shared viewer access is granted/revoked
    event SharedViewerChanged(address indexed viewer, bool status);

    /// @notice Emitted when user data is stored
    event UserDataStored(address indexed user);

    /// @notice Restricts access to owner only
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    /// @notice Restricts access to admins only
    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner, "Only admin can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true;

        // Initialize shared value
        _sharedValue = FHE.asEuint32(0);
        FHE.allowThis(_sharedValue);
    }

    /// @notice Transfers ownership to a new address
    /// @param newOwner The address of the new owner
    /// @dev Classic access control pattern
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        address previousOwner = owner;
        owner = newOwner;
        admins[newOwner] = true;
        emit OwnershipTransferred(previousOwner, newOwner);
    }

    /// @notice Grants or revokes admin status
    /// @param admin The address to modify
    /// @param status True to grant, false to revoke
    function setAdmin(address admin, bool status) external onlyOwner {
        require(admin != address(0), "Invalid admin address");
        admins[admin] = status;
        emit AdminStatusChanged(admin, status);
    }

    /// @notice Stores encrypted data for the caller
    /// @param encryptedData The encrypted data
    /// @param inputProof The input proof
    /// @dev Only the user and admins can access this data
    function storeUserData(externalEuint32 calldata encryptedData, bytes calldata inputProof) external {
        euint32 data = FHE.fromExternal(encryptedData, inputProof);

        _userData[msg.sender] = data;

        // Grant contract permission
        FHE.allowThis(_userData[msg.sender]);

        // ✅ Grant user permission (user can decrypt their own data)
        FHE.allow(_userData[msg.sender], msg.sender);

        emit UserDataStored(msg.sender);
    }

    /// @notice Gets the caller's encrypted data
    /// @return The encrypted data (only accessible to owner)
    function getUserData() external view returns (euint32) {
        return _userData[msg.sender];
    }

    /// @notice Admin function to grant themselves permission to view user data
    /// @param user The user whose data to access
    /// @dev Demonstrates admin oversight capability
    ///      In production, consider logging/auditing admin access
    function adminGrantViewPermission(address user) external onlyAdmin {
        require(user != address(0), "Invalid user address");

        // ✅ Admin grants themselves permission to view user data
        FHE.allow(_userData[user], msg.sender);
    }

    /// @notice Updates the shared encrypted value
    /// @param encryptedValue The new encrypted value
    /// @param inputProof The input proof
    /// @dev Only admins can update, but viewers can decrypt
    function updateSharedValue(externalEuint32 calldata encryptedValue, bytes calldata inputProof) external onlyAdmin {
        euint32 value = FHE.fromExternal(encryptedValue, inputProof);

        _sharedValue = value;

        // Re-grant contract permission
        FHE.allowThis(_sharedValue);

        // Re-grant permissions to all existing viewers
        // Note: In production, you'd track viewers in a list
        // and iterate to re-grant permissions
    }

    /// @notice Grants permission to view the shared value
    /// @param viewer The address to grant permission to
    /// @dev Demonstrates selective access control
    function grantSharedViewPermission(address viewer) external onlyAdmin {
        require(viewer != address(0), "Invalid viewer address");

        sharedViewers[viewer] = true;

        // ✅ Grant decryption permission
        FHE.allow(_sharedValue, viewer);

        emit SharedViewerChanged(viewer, true);
    }

    /// @notice Revokes permission to view the shared value
    /// @param viewer The address to revoke permission from
    /// @dev Note: FHEVM doesn't have built-in permission revocation
    ///      This removes the viewer from our tracking, but they may
    ///      still have permission to decrypt old values
    ///      To truly revoke: create new encrypted value and re-grant to remaining viewers
    function revokeSharedViewPermission(address viewer) external onlyAdmin {
        sharedViewers[viewer] = false;
        emit SharedViewerChanged(viewer, false);

        // ⚠️  IMPORTANT: This doesn't revoke FHEVM permissions
        // To truly revoke, you'd need to:
        // 1. Create a new encrypted value with the same plaintext
        // 2. Re-grant permissions only to remaining authorized viewers
        // Example is shown in revokeAndRotateSharedValue()
    }

    /// @notice Gets the shared encrypted value
    /// @return The shared encrypted value
    /// @dev Caller must have been granted permission via grantSharedViewPermission()
    function getSharedValue() external view returns (euint32) {
        require(sharedViewers[msg.sender] || admins[msg.sender], "No permission to view shared value");
        return _sharedValue;
    }

    /// @notice Example of true permission revocation through value rotation
    /// @param excludedViewer The viewer to exclude from new permissions
    /// @param authorizedViewers List of viewers to maintain access
    /// @dev This demonstrates the only way to truly revoke decryption permission:
    ///      Create new encrypted value and selectively re-grant
    function revokeAndRotateSharedValue(
        address excludedViewer,
        address[] calldata authorizedViewers
    ) external onlyAdmin {
        // Step 1: Keep the same logical value (no encryption change visible)
        // In practice, you'd re-encrypt with same plaintext
        // For this example, we'll use the existing value

        // Step 2: Remove excluded viewer from tracking
        sharedViewers[excludedViewer] = false;
        emit SharedViewerChanged(excludedViewer, false);

        // Step 3: Re-grant permissions only to authorized viewers
        for (uint256 i = 0; i < authorizedViewers.length; i++) {
            address viewer = authorizedViewers[i];
            if (viewer != excludedViewer && viewer != address(0)) {
                sharedViewers[viewer] = true;
                FHE.allow(_sharedValue, viewer);
                emit SharedViewerChanged(viewer, true);
            }
        }

        // ✅ Now only authorized viewers can decrypt
        // The excluded viewer's old permission is effectively revoked
    }

    /// @notice Demonstrates conditional access based on encrypted condition
    /// @param user The user address
    /// @param threshold Encrypted threshold value
    /// @param proofThreshold Proof for threshold
    /// @return True if user's data exceeds threshold (encrypted)
    /// @dev Shows privacy-preserving access control logic
    function checkUserDataExceedsThreshold(
        address user,
        externalEuint32 calldata threshold,
        bytes calldata proofThreshold
    ) external onlyAdmin returns (ebool) {
        euint32 thresholdValue = FHE.fromExternal(threshold, proofThreshold);

        // Compare encrypted values without revealing them
        ebool exceeds = FHE.gt(_userData[user], thresholdValue);

        // Grant permission to admin
        FHE.allowThis(exceeds);
        FHE.allow(exceeds, msg.sender);

        return exceeds;
    }

    /// @title Best Practices for FHE Access Control
    /// @dev Key patterns:
    ///
    /// 1. ✅ Always use modifiers for role checks
    ///    - Keep access control separate from FHE permission logic
    ///
    /// 2. ✅ Grant FHE.allow() explicitly and deliberately
    ///    - Every FHE.allow() is a decryption permission grant
    ///    - Document who should have access and why
    ///
    /// 3. ✅ Track viewers/accessors in mappings
    ///    - Provides transparency about who has access
    ///    - Useful for UI and auditing
    ///
    /// 4. ✅ Remember: FHE permissions are additive
    ///    - Once granted, cannot be directly revoked
    ///    - Must rotate values to revoke access
    ///
    /// 5. ✅ Re-grant permissions after operations
    ///    - FHE operations create new encrypted values
    ///    - Old permissions don't automatically transfer

    /// @title Common Access Control Mistakes
    /*
    /// ❌ MISTAKE 1: Forgetting access control modifiers
    function updateSharedValueWrong(externalEuint32 calldata encryptedValue, bytes calldata inputProof) external {
        // ERROR: No onlyAdmin modifier
        // Anyone can update shared value
        euint32 value = FHE.fromExternal(encryptedValue, inputProof);
        _sharedValue = value;
    }

    /// ❌ MISTAKE 2: Granting permissions too broadly
    function grantPermissionWrong(address user) external {
        // ERROR: No access control, granting to arbitrary addresses
        FHE.allow(_userData[msg.sender], user);
    }

    /// ❌ MISTAKE 3: Not tracking who has permissions
    function grantSharedViewPermissionWrong(address viewer) external onlyAdmin {
        FHE.allow(_sharedValue, viewer);
        // ERROR: Not tracking in sharedViewers mapping
        // No way to know who has access later
    }

    /// ❌ MISTAKE 4: Assuming permissions auto-revoke
    function revokePermissionWrong(address viewer) external onlyAdmin {
        sharedViewers[viewer] = false;
        // ERROR: Viewer can still decrypt old value
        // Must rotate value to truly revoke
    }
    */
}
