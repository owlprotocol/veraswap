// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {ParseBytes} from "@uniswap/v4-core/src/libraries/ParseBytes.sol";
import {QuoterRevert} from "@uniswap/v4-periphery/src/libraries/QuoterRevert.sol";

import {V3QuoterBase} from "./V3QuoterBase.sol";
import {V3PoolKey} from "./V3PoolKey.sol";
import {V3PathKey} from "./V3PathKey.sol";
import {IV3MetaQuoterBase} from "./IV3MetaQuoterBase.sol";

/// @title V3MetaQuoterBase
abstract contract V3MetaQuoterBase is IV3MetaQuoterBase, V3QuoterBase {
    using QuoterRevert for *;
    using ParseBytes for bytes;

    constructor(address _factory, bytes32 _poolInitCodeHash) V3QuoterBase(_factory, _poolInitCodeHash) {}

    function _metaQuoteExactInputSingle(
        MetaQuoteExactSingleParams memory params
    ) internal returns (MetaQuoteExactSingleResult[] memory swaps) {
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

    function _metaQuoteExactOutputSingle(
        MetaQuoteExactSingleParams memory params
    ) internal returns (MetaQuoteExactSingleResult[] memory swaps) {
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
}
