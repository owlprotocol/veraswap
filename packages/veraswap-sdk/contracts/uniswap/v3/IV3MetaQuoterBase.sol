// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {V3PoolKey} from "./V3PoolKey.sol";
import {V3PathKey} from "./V3PathKey.sol";

/// @title IV3MetaQuoterBase
interface IV3MetaQuoterBase {
    struct MetaQuoteExactSingleParams {
        Currency exactCurrency;
        Currency variableCurrency;
        uint128 exactAmount;
        uint24[] feeOptions;
    }

    struct MetaQuoteExactSingleResult {
        V3PoolKey poolKey;
        bool zeroForOne;
        uint256 variableAmount; // variable amountIn or amountOut from quoteExactSingle
        uint256 gasEstimate; // gas estimate from quoteExact
    }
}
