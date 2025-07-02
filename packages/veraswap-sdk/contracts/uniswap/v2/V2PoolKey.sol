// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";

using V2PoolKeyLibrary for V2PoolKey global;

/// @notice Returns the key for identifying a pool in Uniswap V2
struct V2PoolKey {
    /// @notice The lower currency of the pool, sorted numerically
    Currency currency0;
    /// @notice The higher currency of the pool, sorted numerically
    Currency currency1;
}

/// @title V2PoolKeyLibrary
library V2PoolKeyLibrary {
    /// @notice Returns PoolKey: the ordered tokens with the matched fee levels
    /// @param currencyA The first token of a pool, unsorted
    /// @param currencyB The second token of a pool, unsorted
    /// @return Poolkey The pool details with ordered token0 and token1 assignments
    function getPoolKey(Currency currencyA, Currency currencyB) internal pure returns (V2PoolKey memory) {
        (Currency currency0, Currency currency1) = currencyA < currencyB
            ? (currencyA, currencyB)
            : (currencyB, currencyA);

        return V2PoolKey({currency0: currency0, currency1: currency1});
    }

    /// @notice Deterministically computes the pool address given the factory and PoolKey
    /// @param factory The Uniswap V2 factory contract address
    /// @param pairInitCodeHash The init code hash of the V2 pool
    /// @param key The PoolKey
    /// @return pool The contract address of the V2 pool
    function computeAddress(
        V2PoolKey memory key,
        address factory,
        bytes32 pairInitCodeHash
    ) internal pure returns (address pool) {
        pool = address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            hex"ff",
                            factory,
                            keccak256(abi.encodePacked(key.currency0, key.currency1)),
                            pairInitCodeHash
                        )
                    )
                )
            )
        );
    }
}
