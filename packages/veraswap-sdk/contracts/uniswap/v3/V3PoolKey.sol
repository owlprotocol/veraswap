// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";

using V3PoolKeyLibrary for V3PoolKey global;

/// @notice Returns the key for identifying a pool in Uniswap V3
struct V3PoolKey {
    /// @notice The lower currency of the pool, sorted numerically
    Currency currency0;
    /// @notice The higher currency of the pool, sorted numerically
    Currency currency1;
    /// @notice The pool LP fee, capped at 1_000_000. If the highest bit is 1, the pool has a dynamic fee and must be exactly equal to 0x800000
    uint24 fee;
}

/// @title V3PoolKeyLibrary
library V3PoolKeyLibrary {
    /// @notice Returns PoolKey: the ordered tokens with the matched fee levels
    /// @param currencyA The first token of a pool, unsorted
    /// @param currencyB The second token of a pool, unsorted
    /// @param fee The fee level of the pool
    /// @return Poolkey The pool details with ordered token0 and token1 assignments
    function getPoolKey(Currency currencyA, Currency currencyB, uint24 fee) internal pure returns (V3PoolKey memory) {
        (Currency currency0, Currency currency1) = currencyA < currencyB
            ? (currencyA, currencyB)
            : (currencyB, currencyA);

        return V3PoolKey({currency0: currency0, currency1: currency1, fee: fee});
    }

    /// @notice Deterministically computes the pool address given the factory and PoolKey
    /// @param factory The Uniswap V3 factory contract address
    /// @param poolInitCodeHash The init code hash of the V3 pool
    /// @param key The PoolKey
    /// @return pool The contract address of the V3 pool
    function computeAddress(
        V3PoolKey memory key,
        address factory,
        bytes32 poolInitCodeHash
    ) internal pure returns (address pool) {
        pool = address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            hex"ff",
                            factory,
                            keccak256(abi.encode(key.currency0, key.currency1, key.fee)),
                            poolInitCodeHash
                        )
                    )
                )
            )
        );
    }
}
