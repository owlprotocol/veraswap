//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {V3PoolKey} from "./V3PoolKey.sol";

struct V3PathKey {
    Currency intermediateCurrency;
    uint24 fee;
}

using V3PathKeyLibrary for V3PathKey global;

/// @title PathKey Library
/// @notice Functions for working with PathKeys
library V3PathKeyLibrary {
    /// @notice Get the pool and swap direction for a given PathKey
    /// @param params the given PathKey
    /// @param currencyIn the input currency
    /// @return poolKey the pool key of the swap
    /// @return zeroForOne the direction of the swap, true if currency0 is being swapped for currency1
    function getPoolAndSwapDirection(
        V3PathKey calldata params,
        Currency currencyIn
    ) internal pure returns (V3PoolKey memory poolKey, bool zeroForOne) {
        Currency currencyOut = params.intermediateCurrency;
        (Currency currency0, Currency currency1) = currencyIn < currencyOut
            ? (currencyIn, currencyOut)
            : (currencyOut, currencyIn);

        zeroForOne = currencyIn == currency0;
        poolKey = V3PoolKey(currency0, currency1, params.fee);
    }
}
