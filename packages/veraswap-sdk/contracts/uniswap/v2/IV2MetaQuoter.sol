// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {V2PoolKey} from "./V2PoolKey.sol";

/// @title IV2MetaQuoter
/// @notice Interface for MetaQuoter, a contract that searches for multiple quotes
interface IV2MetaQuoter {
    enum BestSwap {
        None,
        Single,
        Multihop
    }

    struct MetaQuoteExactParams {
        Currency exactCurrency;
        Currency variableCurrency;
        Currency[] hopCurrencies;
        uint128 exactAmount;
    }

    struct MetaQuoteExactResult {
        Currency[] path;
        uint256 variableAmount; // variable amountIn or amountOut from quoteExact
    }

    /// @notice Returns list of multihop swaps for a given exact input swap
    /// @param params the params for the quote, encoded as 'MetaQuoteExactParams'
    /// @return swaps Multihop swap quote results
    function metaQuoteExactInput(
        MetaQuoteExactParams memory params
    ) external view returns (MetaQuoteExactResult[] memory swaps);

    /// @notice Returns list of multihop swaps for a given exact output swap
    /// @param params the params for the quote, encoded as 'MetaQuoteExactParams'
    /// @return swaps Multihop swap quote results
    function metaQuoteExactOutput(
        MetaQuoteExactParams memory params
    ) external view returns (MetaQuoteExactResult[] memory swaps);

    /// @notice Returns the best single swap and multihop swap quote for a given exact input swap
    /// @param params the params for the quote, encoded as 'MetaQuoteExactParams'
    /// @return singleSwapAmount Single swap quote result
    /// @return bestMultihopSwap Best multihop quote result
    /// @return bestSwapType The type of the best swap (single or multihop or none)
    function metaQuoteExactInputBest(
        MetaQuoteExactParams memory params
    )
        external
        view
        returns (uint256 singleSwapAmount, MetaQuoteExactResult memory bestMultihopSwap, BestSwap bestSwapType);

    /// @notice Returns the best single swap and multihop swap quote for a given exact output swap
    /// @param params the params for the quote, encoded as 'MetaQuoteExactParams'
    /// @return singleSwapAmount Single swap quote result
    /// @return bestMultihopSwap Best multihop quote result
    /// @return bestSwapType The type of the best swap (single or multihop or none)
    function metaQuoteExactOutputBest(
        MetaQuoteExactParams memory params
    )
        external
        view
        returns (uint256 singleSwapAmount, MetaQuoteExactResult memory bestMultihopSwap, BestSwap bestSwapType);
}
