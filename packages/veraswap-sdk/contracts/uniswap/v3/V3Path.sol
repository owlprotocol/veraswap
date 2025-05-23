// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {BytesLib} from "@uniswap/universal-router/contracts/modules/uniswap/v3/BytesLib.sol";

/// @title Functions for manipulating path data for multihop swaps
library V3Path {
    using BytesLib for bytes;

    /// @dev The length of the bytes encoded address
    uint256 private constant ADDR_SIZE = 20;
    /// @dev The length of the bytes encoded fee
    uint256 private constant V3_FEE_SIZE = 3;

    /// @dev The offset of a single token address and pool fee
    uint256 private constant NEXT_V3_POOL_OFFSET = ADDR_SIZE + V3_FEE_SIZE;
    /// @dev The offset of an encoded pool key
    uint256 private constant V3_POP_OFFSET = NEXT_V3_POOL_OFFSET + ADDR_SIZE;
    /// @dev The minimum length of an encoding that contains 2 or more pools
    uint256 private constant MULTIPLE_V3_POOLS_MIN_LENGTH = V3_POP_OFFSET + NEXT_V3_POOL_OFFSET;

    /// @notice Returns true iff the path contains two or more pools
    /// @param path The encoded swap path
    /// @return True if path contains two or more pools, otherwise false
    function hasMultiplePools(bytes calldata path) internal pure returns (bool) {
        return path.length >= MULTIPLE_V3_POOLS_MIN_LENGTH;
    }

    /// @notice Returns the number of pools in the path
    /// @param path The encoded swap path
    /// @return The number of pools in the path
    function numPools(bytes memory path) internal pure returns (uint256) {
        // Ignore the first token address. From then on every fee and token offset indicates a pool.
        return ((path.length - ADDR_SIZE) / NEXT_V3_POOL_OFFSET);
    }

    /// @notice Decodes the first pool in path
    /// @param path The bytes encoded swap path
    /// @return tokenA The first token of the given pool
    /// @return fee The fee level of the pool
    /// @return tokenB The second token of the given pool
    function decodeFirstPool(bytes calldata path) internal pure returns (address, uint24, address) {
        return path.toPool();
    }

    /// @notice Gets the segment corresponding to the first pool in the path
    /// @param path The bytes encoded swap path
    /// @return The segment containing all data necessary to target the first pool in the path
    function getFirstPool(bytes calldata path) internal pure returns (bytes calldata) {
        return path[:V3_POP_OFFSET];
    }

    function decodeFirstToken(bytes calldata path) internal pure returns (address tokenA) {
        tokenA = path.toAddress();
    }

    /// @notice Skips a token + fee element
    /// @param path The swap path
    function skipToken(bytes calldata path) internal pure returns (bytes calldata) {
        return path[NEXT_V3_POOL_OFFSET:];
    }
}
