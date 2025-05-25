// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {ParseBytes} from "@uniswap/v4-core/src/libraries/ParseBytes.sol";
import {QuoterRevert} from "@uniswap/v4-periphery/src/libraries/QuoterRevert.sol";

import {IV3MetaQuoter} from "./IV3MetaQuoter.sol";
import {V3Quoter} from "./V3Quoter.sol";
import {V3PoolKey} from "./V3PoolKey.sol";

/// @title V3MetaQuoter
/// @notice Supports quoting and routing optimal trade using logic by getting balance delta across multiple routes
/// @dev These functions are not marked view because they rely on calling non-view functions and reverting
/// to compute the result. They are also not gas efficient and should not be called on-chain.
contract V3MetaQuoter is V3Quoter, IV3MetaQuoter {
    using QuoterRevert for *;
    using ParseBytes for bytes;

    constructor(address _factory, bytes32 _poolInitCodeHash) V3Quoter(_factory, _poolInitCodeHash) {}

    /// @inheritdoc IV3MetaQuoter
    function metaQuoteExactInputSingle(
        MetaQuoteExactSingleParams memory params
    ) external returns (MetaQuoteExactSingleResult[] memory swaps) {
        uint256 quoteResultsMaxLen = params.feeOptions.length;
        uint256 quoteResultsCount = 0;
        MetaQuoteExactSingleResult[] memory quoteResults = new MetaQuoteExactSingleResult[](quoteResultsMaxLen);

        (Currency currency0, Currency currency1) = params.exactCurrency < params.variableCurrency
            ? (params.exactCurrency, params.variableCurrency)
            : (params.variableCurrency, params.exactCurrency);
        bool zeroForOne = params.exactCurrency == currency0;

        // Loop through the poolKeyOptions and create a PoolKey for each
        // Quote using quoteExactInputSingle
        for (uint256 i = 0; i < params.feeOptions.length; i++) {
            uint24 fee = params.feeOptions[i];

            V3PoolKey memory poolKey = V3PoolKey({currency0: currency0, currency1: currency1, fee: fee});

            QuoteExactSingleParams memory quoteParams = QuoteExactSingleParams({
                poolKey: poolKey,
                zeroForOne: zeroForOne,
                exactAmount: params.exactAmount
            });

            (bytes memory reason, uint256 gasEstimate) = _quoteExactInputSingleReason(quoteParams);
            if (reason.parseSelector() != QuoterRevert.QuoteSwap.selector) {
                // Quote failed (eg. insufficient liquidity), skip this pool
                continue;
            }
            quoteResultsCount++;
            uint256 variableAmount = reason.parseQuoteAmount();

            MetaQuoteExactSingleResult memory quote = MetaQuoteExactSingleResult({
                poolKey: poolKey,
                zeroForOne: zeroForOne,
                variableAmount: variableAmount,
                gasEstimate: gasEstimate
            });
            quoteResults[i] = quote;
        }

        // Filter out empty results
        swaps = new MetaQuoteExactSingleResult[](quoteResultsCount);
        uint256 swapsIndex = 0;
        for (uint256 i = 0; i < quoteResults.length; i++) {
            if (quoteResults[i].gasEstimate != 0) {
                swaps[swapsIndex] = quoteResults[i]; //non-zero quote
                swapsIndex++;
            }
        }
    }

    /// @inheritdoc IV3MetaQuoter
    function metaQuoteExactOutputSingle(
        MetaQuoteExactSingleParams memory params
    ) external returns (MetaQuoteExactSingleResult[] memory swaps) {
        uint256 quoteResultsMaxLen = params.feeOptions.length;
        uint256 quoteResultsCount = 0;
        MetaQuoteExactSingleResult[] memory quoteResults = new MetaQuoteExactSingleResult[](quoteResultsMaxLen);

        (Currency currency0, Currency currency1) = params.exactCurrency < params.variableCurrency
            ? (params.exactCurrency, params.variableCurrency)
            : (params.variableCurrency, params.exactCurrency);
        bool zeroForOne = params.exactCurrency == currency1;

        // Loop through the poolKeyOptions and create a PoolKey for each
        // Quote using quoteExactInputSingle
        for (uint256 i = 0; i < params.feeOptions.length; i++) {
            uint24 fee = params.feeOptions[i];

            V3PoolKey memory poolKey = V3PoolKey({currency0: currency0, currency1: currency1, fee: fee});

            QuoteExactSingleParams memory quoteParams = QuoteExactSingleParams({
                poolKey: poolKey,
                zeroForOne: zeroForOne,
                exactAmount: params.exactAmount
            });

            (bytes memory reason, uint256 gasEstimate) = _quoteExactOutputSingleReason(quoteParams);
            if (reason.parseSelector() != QuoterRevert.QuoteSwap.selector) {
                // Quote failed (eg. insufficient liquidity), skip this pool
                continue;
            }
            quoteResultsCount++;
            uint256 variableAmount = reason.parseQuoteAmount();

            MetaQuoteExactSingleResult memory quote = MetaQuoteExactSingleResult({
                poolKey: poolKey,
                zeroForOne: zeroForOne,
                variableAmount: variableAmount,
                gasEstimate: gasEstimate
            });
            quoteResults[i] = quote;
        }

        // Filter out empty results
        swaps = new MetaQuoteExactSingleResult[](quoteResultsCount);
        uint256 swapsIndex = 0;
        for (uint256 i = 0; i < quoteResults.length; i++) {
            if (quoteResults[i].gasEstimate != 0) {
                swaps[swapsIndex] = quoteResults[i]; //non-zero quote
                swapsIndex++;
            }
        }
    }

    /// @inheritdoc IV3MetaQuoter
    function metaQuoteExactInput(
        MetaQuoteExactParams memory params
    ) external returns (MetaQuoteExactResult[] memory swaps) {}

    /// @inheritdoc IV3MetaQuoter
    function metaQuoteExactOutput(
        MetaQuoteExactParams memory params
    ) external returns (MetaQuoteExactResult[] memory swaps) {}

    /// @inheritdoc IV3MetaQuoter
    function metaQuoteExactInputBest(
        MetaQuoteExactParams memory params
    )
        external
        returns (
            MetaQuoteExactSingleResult memory bestSingleSwap,
            MetaQuoteExactResult memory bestMultihopSwap,
            BestSwap bestSwapType
        )
    {}

    /// @inheritdoc IV3MetaQuoter
    function metaQuoteExactOutputBest(
        MetaQuoteExactParams memory params
    )
        external
        returns (
            MetaQuoteExactSingleResult memory bestSingleSwap,
            MetaQuoteExactResult memory bestMultihopSwap,
            BestSwap bestSwapType
        )
    {}
}
