// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {V3PoolKey} from "./V3PoolKey.sol";
import {V3PathKey} from "./V3PathKey.sol";

/// @title IV3QuoterBase
interface IV3QuoterBase {
    struct QuoteExactSingleParams {
        V3PoolKey poolKey;
        bool zeroForOne;
        uint128 exactAmount;
    }

    struct QuoteExactParams {
        Currency exactCurrency;
        V3PathKey[] path;
        uint128 exactAmount;
    }
}
