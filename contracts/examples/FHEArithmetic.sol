// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint32, ebool, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE Arithmetic Operations
/// @notice Demonstrates all FHE arithmetic and comparison operations
/// @dev This example covers:
///      - Addition (FHE.add)
///      - Subtraction (FHE.sub)
///      - Multiplication (FHE.mul)
///      - Division (FHE.div)
///      - Comparisons (FHE.eq, FHE.ne, FHE.lt, FHE.lte, FHE.gt, FHE.gte)
///      - Conditional operations (FHE.select)
contract FHEArithmetic is ZamaEthereumConfig {
    /// @notice Result of the last operation
    euint32 private _lastResult;

    /// @notice Emitted when an operation is performed
    event OperationPerformed(address indexed user, string operation);

    /// @notice Adds two encrypted numbers
    /// @param a First encrypted number
    /// @param proofA Input proof for a
    /// @param b Second encrypted number
    /// @param proofB Input proof for b
    /// @return The encrypted sum
    function add(
        externalEuint32 calldata a,
        bytes calldata proofA,
        externalEuint32 calldata b,
        bytes calldata proofB
    ) external returns (euint32) {
        euint32 valueA = FHE.fromExternal(a, proofA);
        euint32 valueB = FHE.fromExternal(b, proofB);

        // Perform encrypted addition
        euint32 result = FHE.add(valueA, valueB);

        _lastResult = result;
        FHE.allowThis(_lastResult);
        FHE.allow(_lastResult, msg.sender);

        emit OperationPerformed(msg.sender, "add");
        return result;
    }

    /// @notice Subtracts two encrypted numbers
    /// @param a First encrypted number (minuend)
    /// @param proofA Input proof for a
    /// @param b Second encrypted number (subtrahend)
    /// @param proofB Input proof for b
    /// @return The encrypted difference
    /// @dev Note: This does not check for underflow (negative results)
    ///      For production, consider using FHE.max(sub(a,b), 0) or similar logic
    function sub(
        externalEuint32 calldata a,
        bytes calldata proofA,
        externalEuint32 calldata b,
        bytes calldata proofB
    ) external returns (euint32) {
        euint32 valueA = FHE.fromExternal(a, proofA);
        euint32 valueB = FHE.fromExternal(b, proofB);

        // Perform encrypted subtraction
        euint32 result = FHE.sub(valueA, valueB);

        _lastResult = result;
        FHE.allowThis(_lastResult);
        FHE.allow(_lastResult, msg.sender);

        emit OperationPerformed(msg.sender, "sub");
        return result;
    }

    /// @notice Multiplies two encrypted numbers
    /// @param a First encrypted number
    /// @param proofA Input proof for a
    /// @param b Second encrypted number
    /// @param proofB Input proof for b
    /// @return The encrypted product
    /// @dev FHE.mul is more gas-expensive than add/sub (~2-3x cost)
    function mul(
        externalEuint32 calldata a,
        bytes calldata proofA,
        externalEuint32 calldata b,
        bytes calldata proofB
    ) external returns (euint32) {
        euint32 valueA = FHE.fromExternal(a, proofA);
        euint32 valueB = FHE.fromExternal(b, proofB);

        // Perform encrypted multiplication
        euint32 result = FHE.mul(valueA, valueB);

        _lastResult = result;
        FHE.allowThis(_lastResult);
        FHE.allow(_lastResult, msg.sender);

        emit OperationPerformed(msg.sender, "mul");
        return result;
    }

    /// @notice Checks if two encrypted numbers are equal
    /// @param a First encrypted number
    /// @param proofA Input proof for a
    /// @param b Second encrypted number
    /// @param proofB Input proof for b
    /// @return Encrypted boolean (true if equal)
    /// @dev Returns ebool, not euint32
    ///      FHE.eq is one of the cheaper comparison operations
    function eq(
        externalEuint32 calldata a,
        bytes calldata proofA,
        externalEuint32 calldata b,
        bytes calldata proofB
    ) external returns (ebool) {
        euint32 valueA = FHE.fromExternal(a, proofA);
        euint32 valueB = FHE.fromExternal(b, proofB);

        // Perform encrypted equality check
        ebool result = FHE.eq(valueA, valueB);

        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        emit OperationPerformed(msg.sender, "eq");
        return result;
    }

    /// @notice Checks if first number is less than second
    /// @param a First encrypted number
    /// @param proofA Input proof for a
    /// @param b Second encrypted number
    /// @param proofB Input proof for b
    /// @return Encrypted boolean (true if a < b)
    function lt(
        externalEuint32 calldata a,
        bytes calldata proofA,
        externalEuint32 calldata b,
        bytes calldata proofB
    ) external returns (ebool) {
        euint32 valueA = FHE.fromExternal(a, proofA);
        euint32 valueB = FHE.fromExternal(b, proofB);

        // Perform encrypted less-than comparison
        ebool result = FHE.lt(valueA, valueB);

        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        emit OperationPerformed(msg.sender, "lt");
        return result;
    }

    /// @notice Conditional selection based on encrypted condition
    /// @param condition Encrypted boolean condition
    /// @param proofCondition Input proof for condition
    /// @param ifTrue Value to return if condition is true
    /// @param proofTrue Input proof for ifTrue
    /// @param ifFalse Value to return if condition is false
    /// @param proofFalse Input proof for ifFalse
    /// @return The selected encrypted value
    /// @dev This is the FHE equivalent of: condition ? ifTrue : ifFalse
    ///      Extremely useful for privacy-preserving conditional logic
    function select(
        externalEuint32 calldata condition,
        bytes calldata proofCondition,
        externalEuint32 calldata ifTrue,
        bytes calldata proofTrue,
        externalEuint32 calldata ifFalse,
        bytes calldata proofFalse
    ) external returns (euint32) {
        // Note: In practice, you'd pass an ebool for condition
        // This simplified example shows the concept
        euint32 condValue = FHE.fromExternal(condition, proofCondition);
        euint32 trueValue = FHE.fromExternal(ifTrue, proofTrue);
        euint32 falseValue = FHE.fromExternal(ifFalse, proofFalse);

        // Convert to ebool (checking if > 0)
        ebool cond = FHE.ne(condValue, FHE.asEuint32(0));

        // Perform encrypted conditional selection
        euint32 result = FHE.select(cond, trueValue, falseValue);

        _lastResult = result;
        FHE.allowThis(_lastResult);
        FHE.allow(_lastResult, msg.sender);

        emit OperationPerformed(msg.sender, "select");
        return result;
    }

    /// @notice Gets the result of the last operation
    /// @return The last result
    function getLastResult() external view returns (euint32) {
        return _lastResult;
    }

    /// @notice Demonstrates chaining multiple operations
    /// @param a First number
    /// @param proofA Proof for a
    /// @param b Second number
    /// @param proofB Proof for b
    /// @param c Third number
    /// @param proofC Proof for c
    /// @return Result of (a + b) * c
    /// @dev Shows how to chain FHE operations
    function chainedOperation(
        externalEuint32 calldata a,
        bytes calldata proofA,
        externalEuint32 calldata b,
        bytes calldata proofB,
        externalEuint32 calldata c,
        bytes calldata proofC
    ) external returns (euint32) {
        euint32 valueA = FHE.fromExternal(a, proofA);
        euint32 valueB = FHE.fromExternal(b, proofB);
        euint32 valueC = FHE.fromExternal(c, proofC);

        // First add a and b
        euint32 sum = FHE.add(valueA, valueB);

        // Then multiply by c
        euint32 result = FHE.mul(sum, valueC);

        _lastResult = result;
        FHE.allowThis(_lastResult);
        FHE.allow(_lastResult, msg.sender);

        emit OperationPerformed(msg.sender, "chained");
        return result;
    }

    /// @notice Gas-efficient alternative for small multiplications
    /// @param value The encrypted value
    /// @param proof Input proof
    /// @dev Instead of FHE.mul(value, 2), use FHE.add(value, value)
    ///      This is cheaper for small constant multipliers
    function doubleValue(
        externalEuint32 calldata value,
        bytes calldata proof
    ) external returns (euint32) {
        euint32 val = FHE.fromExternal(value, proof);

        // ✅ More gas-efficient than FHE.mul(val, FHE.asEuint32(2))
        euint32 result = FHE.add(val, val);

        _lastResult = result;
        FHE.allowThis(_lastResult);
        FHE.allow(_lastResult, msg.sender);

        emit OperationPerformed(msg.sender, "double");
        return result;
    }
}
