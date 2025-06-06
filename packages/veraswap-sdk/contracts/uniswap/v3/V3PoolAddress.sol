// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//TODO: Create 2 versions for init code hash (local and mainnet) due to different compilation output
/// @title Provides functions for deriving a pool address from the factory, tokens, and the fee
library V3PoolAddress {
    /// @notice The identifying key of the pool
    struct PoolKey {
        address token0;
        address token1;
        uint24 fee;
    }

    /// @notice Returns PoolKey: the ordered tokens with the matched fee levels
    /// @param tokenA The first token of a pool, unsorted
    /// @param tokenB The second token of a pool, unsorted
    /// @param fee The fee level of the pool
    /// @return Poolkey The pool details with ordered token0 and token1 assignments
    function getPoolKey(address tokenA, address tokenB, uint24 fee) internal pure returns (PoolKey memory) {
        if (tokenA > tokenB) (tokenA, tokenB) = (tokenB, tokenA);
        return PoolKey({token0: tokenA, token1: tokenB, fee: fee});
    }

    /// @notice Deterministically computes the pool address given the factory and PoolKey
    /// @param factory The Uniswap V3 factory contract address
    /// @param poolInitCodeHash The init code hash of the V3 pool
    /// @param key The PoolKey
    /// @return pool The contract address of the V3 pool
    function computeAddress(
        address factory,
        bytes32 poolInitCodeHash,
        PoolKey memory key
    ) internal pure returns (address pool) {
        require(key.token0 < key.token1);
        pool = address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            hex"ff",
                            factory,
                            keccak256(abi.encode(key.token0, key.token1, key.fee)),
                            poolInitCodeHash
                        )
                    )
                )
            )
        );
    }
}
