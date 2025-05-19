// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {PathKey} from "@uniswap/v4-periphery/src/libraries/PathKey.sol";

/// @title IV4MetaQuoter
/// @notice Interface for MetaQuoter, a contract that searches for multiple quotes
interface IV4MetaQuoter {
    enum BestSwap {
        None,
        Single,
        Multihop
    }

    struct PoolKeyOptions {
        uint24 fee;
        int24 tickSpacing;
        address hooks;
    }

    struct MetaQuoteExactSingleParams {
        Currency exactCurrency;
        Currency variableCurrency;
        uint128 exactAmount;
        PoolKeyOptions[] poolKeyOptions;
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

    /// @notice Returns list of single swaps for a given exact input swap
    /// @param params the params for the quote, encoded as 'MetaQuoteExactSingleParams'
    /// @return swaps Single swap quote results
    function metaQuoteExactInputSingle(
        MetaQuoteExactSingleParams memory params
    ) external returns (MetaQuoteExactSingleResult[] memory swaps);

    /// @notice Returns list of single swaps for a given exact output swap
    /// @param params the params for the quote, encoded as 'MetaQuoteExactSingleParams'
    /// @return swaps Single swap quote results
    function metaQuoteExactOutputSingle(
        MetaQuoteExactSingleParams memory params
    ) external returns (MetaQuoteExactSingleResult[] memory swaps);

    /// @notice Returns list of multihop swaps for a given exact input swap
    /// @param params the params for the quote, encoded as 'MetaQuoteExactParams'
    /// @return swaps Multihop swap quote results
    function metaQuoteExactInput(
        MetaQuoteExactParams memory params
    ) external returns (MetaQuoteExactResult[] memory swaps);

    /// @notice Returns list of multihop swaps for a given exact output swap
    /// @param params the params for the quote, encoded as 'MetaQuoteExactParams'
    /// @return swaps Multihop swap quote results
    function metaQuoteExactOutput(
        MetaQuoteExactParams memory params
    ) external returns (MetaQuoteExactResult[] memory swaps);

    /// @notice Returns the best single swap and multihop swap quote for a given exact input swap
    /// @param params the params for the quote, encoded as 'MetaQuoteExactParams'
    /// @return bestSingleSwap Best single swap quote result
    /// @return bestMultihopSwap Best multihop quote result
    /// @return bestSwapType The type of the best swap (single or multihop or none)
    function metaQuoteExactInputBest(
        MetaQuoteExactParams memory params
    )
        external
        returns (
            MetaQuoteExactSingleResult memory bestSingleSwap,
            MetaQuoteExactResult memory bestMultihopSwap,
            BestSwap bestSwapType
        );

    /// @notice Returns the best single swap and multihop swap quote for a given exact output swap
    /// @param params the params for the quote, encoded as 'MetaQuoteExactParams'
    /// @return bestSingleSwap Best single swap quote result
    /// @return bestMultihopSwap Best multihop quote result
    /// @return bestSwapType The type of the best swap (single or multihop or none)
    function metaQuoteExactOutputBest(
        MetaQuoteExactParams memory params
    )
        external
        returns (
            MetaQuoteExactSingleResult memory bestSingleSwap,
            MetaQuoteExactResult memory bestMultihopSwap,
            BestSwap bestSwapType
        );
}
