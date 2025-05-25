// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {V3PoolKey} from "./V3PoolKey.sol";
import {V3PathKey} from "./V3PathKey.sol";

/// @title IV3MetaQuoter
/// @notice Interface for MetaQuoter, a contract that searches for multiple quotes
interface IV3MetaQuoter {
    enum BestSwap {
        None,
        Single,
        Multihop
    }

    struct MetaQuoteExactSingleParams {
        Currency exactCurrency;
        Currency variableCurrency;
        uint128 exactAmount;
        uint24[] feeOptions;
    }

    struct MetaQuoteExactSingleResult {
        V3PoolKey poolKey;
        bool zeroForOne;
        uint256 variableAmount;
        uint256 gasEstimate;
    }

    struct MetaQuoteExactParams {
        Currency exactCurrency;
        Currency variableCurrency;
        Currency[] hopCurrencies;
        uint128 exactAmount;
        uint24[] feeOptions;
    }

    struct MetaQuoteExactResult {
        V3PathKey[] path;
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
