// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {PathKey} from "@uniswap/v4-periphery/src/libraries/PathKey.sol";

/// @title IV4MetaQuoter
/// @notice Interface for MetaQuoter, a contract that searches for multiple quotes
interface IV4MetaQuoter {
    struct PoolKeyOptions {
        uint24 fee;
        int24 tickSpacing;
        address hooks;
    }

    struct MetaQuoteExactParams {
        Currency exactCurrency;
        Currency variableCurrency;
        Currency[] hopCurrencies;
        uint128 exactAmount;
        PoolKeyOptions[] poolKeyOptions;
    }

    struct MetaQuoteExactSingleResult {
        PoolKey poolKey;
        bool zeroForOne;
        bytes hookData;
        uint256 variableAmount; // variable amountIn or amountOut from quoteExactSingle
        uint256 gasEstimate; // gas estimate from quoteExact
    }

    struct MetaQuoteExactResult {
        PathKey[] path;
        uint256 variableAmount; // variable amountIn or amountOut from quoteExact
        uint256 gasEstimate; // gas estimate from quoteExact
    }

    /// @notice Returns the best single swap and multihop swap quote for a given exact input swap
    /// @param params the params for the quote, encoded as 'MetaQuoteExactParams'
    /// @return bestSingleSwap Best single swap quote result
    /// @return bestMultihopSwap Best multihop quote result
    function metaQuoteExactInput(
        MetaQuoteExactParams memory params
    ) external returns (MetaQuoteExactSingleResult memory bestSingleSwap, MetaQuoteExactResult memory bestMultihopSwap);

    /// @notice Returns the best single swap and multihop swap quote for a given exact output swap
    /// @param params the params for the quote, encoded as 'MetaQuoteExactParams'
    /// @return bestSingleSwap Best single swap quote result
    /// @return bestMultihopSwap Best multihop quote result
    function metaQuoteExactOutput(
        MetaQuoteExactParams memory params
    ) external returns (MetaQuoteExactSingleResult memory bestSingleSwap, MetaQuoteExactResult memory bestMultihopSwap);
}
