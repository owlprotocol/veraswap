// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {V3PoolKey} from "./V3PoolKey.sol";

/// @notice Provides validation for callbacks from Uniswap V3 Pools
library V3CallbackValidation {
    error InvalidCallbackAddress(address msgSender, address expectedPoolAddress);

    /// @notice Returns the address of a valid Uniswap V3 Pool
    /// @param poolKey The identifying key of the V3 pool
    /// @param factory The contract address of the Uniswap V3 factory
    /// @param poolInitCodeHash The init code hash of the V3 pool
    /// @return pool The V3 pool contract address
    function verifyCallback(
        V3PoolKey memory poolKey,
        address factory,
        bytes32 poolInitCodeHash
    ) internal view returns (IUniswapV3Pool pool) {
        pool = IUniswapV3Pool(poolKey.computeAddress(factory, poolInitCodeHash));

        if (msg.sender != address(pool)) {
            revert InvalidCallbackAddress(msg.sender, address(pool));
        }
    }
}
