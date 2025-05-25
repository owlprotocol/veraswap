// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {ParseBytes} from "@uniswap/v4-core/src/libraries/ParseBytes.sol";
import {QuoterRevert} from "@uniswap/v4-periphery/src/libraries/QuoterRevert.sol";

import {V3QuoterBase} from "./V3QuoterBase.sol";
import {V3PoolKey} from "./V3PoolKey.sol";
import {V3PathKey} from "./V3PathKey.sol";
import {IV3Quoter} from "./IV3Quoter.sol";
import {IV3MetaQuoter} from "./IV3MetaQuoter.sol";

/// @title V3MetaQuoterBase
abstract contract V3MetaQuoterBase is V3QuoterBase {
    using QuoterRevert for *;
    using ParseBytes for bytes;

    constructor(address _factory, bytes32 _poolInitCodeHash) V3QuoterBase(_factory, _poolInitCodeHash) {}

    function _metaQuoteExactInputSingle(
        IV3MetaQuoter.MetaQuoteExactSingleParams memory params
    ) internal returns (IV3MetaQuoter.MetaQuoteExactSingleResult[] memory swaps) {
        uint256 quoteResultsMaxLen = params.feeOptions.length;
        uint256 quoteResultsCount = 0;
        IV3MetaQuoter.MetaQuoteExactSingleResult[] memory quoteResults = new IV3MetaQuoter.MetaQuoteExactSingleResult[](
            quoteResultsMaxLen
        );

        (Currency currency0, Currency currency1) = params.exactCurrency < params.variableCurrency
            ? (params.exactCurrency, params.variableCurrency)
            : (params.variableCurrency, params.exactCurrency);
        bool zeroForOne = params.exactCurrency == currency0;

        // Loop through the poolKeyOptions and create a PoolKey for each
        // Quote using quoteExactInputSingle
        for (uint256 i = 0; i < params.feeOptions.length; i++) {
            uint24 fee = params.feeOptions[i];

            V3PoolKey memory poolKey = V3PoolKey({currency0: currency0, currency1: currency1, fee: fee});

            IV3Quoter.QuoteExactSingleParams memory quoteParams = IV3Quoter.QuoteExactSingleParams({
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

            IV3MetaQuoter.MetaQuoteExactSingleResult memory quote = IV3MetaQuoter.MetaQuoteExactSingleResult({
                poolKey: poolKey,
                zeroForOne: zeroForOne,
                variableAmount: variableAmount,
                gasEstimate: gasEstimate
            });
            quoteResults[i] = quote;
        }

        // Filter out empty results
        swaps = new IV3MetaQuoter.MetaQuoteExactSingleResult[](quoteResultsCount);
        uint256 swapsIndex = 0;
        for (uint256 i = 0; i < quoteResults.length; i++) {
            if (quoteResults[i].gasEstimate != 0) {
                swaps[swapsIndex] = quoteResults[i]; //non-zero quote
                swapsIndex++;
            }
        }
    }

    function _metaQuoteExactOutputSingle(
        IV3MetaQuoter.MetaQuoteExactSingleParams memory params
    ) internal returns (IV3MetaQuoter.MetaQuoteExactSingleResult[] memory swaps) {
        uint256 quoteResultsMaxLen = params.feeOptions.length;
        uint256 quoteResultsCount = 0;
        IV3MetaQuoter.MetaQuoteExactSingleResult[] memory quoteResults = new IV3MetaQuoter.MetaQuoteExactSingleResult[](
            quoteResultsMaxLen
        );

        (Currency currency0, Currency currency1) = params.exactCurrency < params.variableCurrency
            ? (params.exactCurrency, params.variableCurrency)
            : (params.variableCurrency, params.exactCurrency);
        bool zeroForOne = params.exactCurrency == currency1;

        // Loop through the poolKeyOptions and create a PoolKey for each
        // Quote using quoteExactInputSingle
        for (uint256 i = 0; i < params.feeOptions.length; i++) {
            uint24 fee = params.feeOptions[i];

            V3PoolKey memory poolKey = V3PoolKey({currency0: currency0, currency1: currency1, fee: fee});

            IV3Quoter.QuoteExactSingleParams memory quoteParams = IV3Quoter.QuoteExactSingleParams({
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

            IV3MetaQuoter.MetaQuoteExactSingleResult memory quote = IV3MetaQuoter.MetaQuoteExactSingleResult({
                poolKey: poolKey,
                zeroForOne: zeroForOne,
                variableAmount: variableAmount,
                gasEstimate: gasEstimate
            });
            quoteResults[i] = quote;
        }

        // Filter out empty results
        swaps = new IV3MetaQuoter.MetaQuoteExactSingleResult[](quoteResultsCount);
        uint256 swapsIndex = 0;
        for (uint256 i = 0; i < quoteResults.length; i++) {
            if (quoteResults[i].gasEstimate != 0) {
                swaps[swapsIndex] = quoteResults[i]; //non-zero quote
                swapsIndex++;
            }
        }
    }
}
