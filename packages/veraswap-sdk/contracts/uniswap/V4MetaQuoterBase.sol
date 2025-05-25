// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {StateLibrary} from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {ParseBytes} from "@uniswap/v4-core/src/libraries/ParseBytes.sol";

import {IV4Quoter} from "@uniswap/v4-periphery/src/interfaces/IV4Quoter.sol";
import {PathKey} from "@uniswap/v4-periphery/src/libraries/PathKey.sol";
import {QuoterRevert} from "@uniswap/v4-periphery/src/libraries/QuoterRevert.sol";
import {BaseV4Quoter} from "@uniswap/v4-periphery/src/base/BaseV4Quoter.sol";

import {IV4MetaQuoter} from "./IV4MetaQuoter.sol";
import {V4QuoterBase} from "./V4QuoterBase.sol";

/// @title V4MetaQuoterBase
contract V4MetaQuoterBase is V4QuoterBase {
    using QuoterRevert for *;
    using ParseBytes for bytes;

    constructor(IPoolManager _poolManager) V4QuoterBase(_poolManager) {}

    function _metaQuoteExactInputSingle(
        IV4MetaQuoter.MetaQuoteExactSingleParams memory params
    ) internal returns (IV4MetaQuoter.MetaQuoteExactSingleResult[] memory swaps) {
        uint256 quoteResultsMaxLen = params.poolKeyOptions.length;
        uint256 quoteResultsCount = 0;
        IV4MetaQuoter.MetaQuoteExactSingleResult[] memory quoteResults = new IV4MetaQuoter.MetaQuoteExactSingleResult[](
            quoteResultsMaxLen
        );

        (Currency currency0, Currency currency1) = params.exactCurrency < params.variableCurrency
            ? (params.exactCurrency, params.variableCurrency)
            : (params.variableCurrency, params.exactCurrency);
        bool zeroForOne = params.exactCurrency == currency0;

        // Loop through the poolKeyOptions and create a PoolKey for each
        // Quote using quoteExactInputSingle
        for (uint256 i = 0; i < params.poolKeyOptions.length; i++) {
            IV4MetaQuoter.PoolKeyOptions memory poolKeyOptions = params.poolKeyOptions[i];

            PoolKey memory poolKey = PoolKey({
                currency0: currency0,
                currency1: currency1,
                fee: poolKeyOptions.fee,
                tickSpacing: poolKeyOptions.tickSpacing,
                hooks: IHooks(poolKeyOptions.hooks)
            });

            IV4Quoter.QuoteExactSingleParams memory quoteParams = IV4Quoter.QuoteExactSingleParams({
                poolKey: poolKey,
                zeroForOne: zeroForOne,
                exactAmount: params.exactAmount,
                hookData: ""
            });

            (bytes memory reason, uint256 gasEstimate) = _quoteExactInputSingleReason(quoteParams);
            if (reason.parseSelector() != QuoterRevert.QuoteSwap.selector) {
                // Quote failed (eg. insufficient liquidity), skip this pool
                continue;
            }
            quoteResultsCount++;
            uint256 variableAmount = reason.parseQuoteAmount();

            IV4MetaQuoter.MetaQuoteExactSingleResult memory quote = IV4MetaQuoter.MetaQuoteExactSingleResult({
                poolKey: poolKey,
                zeroForOne: zeroForOne,
                hookData: "",
                variableAmount: variableAmount,
                gasEstimate: gasEstimate
            });
            quoteResults[i] = quote;
        }

        // Filter out empty results
        swaps = new IV4MetaQuoter.MetaQuoteExactSingleResult[](quoteResultsCount);
        uint256 swapsIndex = 0;
        for (uint256 i = 0; i < quoteResults.length; i++) {
            if (quoteResults[i].gasEstimate != 0) {
                swaps[swapsIndex] = quoteResults[i]; //non-zero quote
                swapsIndex++;
            }
        }
    }

    function _metaQuoteExactOutputSingle(
        IV4MetaQuoter.MetaQuoteExactSingleParams memory params
    ) internal returns (IV4MetaQuoter.MetaQuoteExactSingleResult[] memory swaps) {
        uint256 quoteResultsMaxLen = params.poolKeyOptions.length;
        uint256 quoteResultsCount = 0;
        IV4MetaQuoter.MetaQuoteExactSingleResult[] memory quoteResults = new IV4MetaQuoter.MetaQuoteExactSingleResult[](
            quoteResultsMaxLen
        );

        (Currency currency0, Currency currency1) = params.exactCurrency < params.variableCurrency
            ? (params.exactCurrency, params.variableCurrency)
            : (params.variableCurrency, params.exactCurrency);
        bool zeroForOne = params.exactCurrency == currency1;

        // Loop through the poolKeyOptions and create a PoolKey for each
        // Quote using quoteExactInputSingle
        for (uint256 i = 0; i < params.poolKeyOptions.length; i++) {
            IV4MetaQuoter.PoolKeyOptions memory poolKeyOptions = params.poolKeyOptions[i];

            PoolKey memory poolKey = PoolKey({
                currency0: currency0,
                currency1: currency1,
                fee: poolKeyOptions.fee,
                tickSpacing: poolKeyOptions.tickSpacing,
                hooks: IHooks(poolKeyOptions.hooks)
            });

            IV4Quoter.QuoteExactSingleParams memory quoteParams = IV4Quoter.QuoteExactSingleParams({
                poolKey: poolKey,
                zeroForOne: zeroForOne,
                exactAmount: params.exactAmount,
                hookData: ""
            });

            (bytes memory reason, uint256 gasEstimate) = _quoteExactOutputSingleReason(quoteParams);
            if (reason.parseSelector() != QuoterRevert.QuoteSwap.selector) {
                // Quote failed (eg. insufficient liquidity), skip this pool
                continue;
            }
            quoteResultsCount++;
            uint256 variableAmount = reason.parseQuoteAmount();

            IV4MetaQuoter.MetaQuoteExactSingleResult memory quote = IV4MetaQuoter.MetaQuoteExactSingleResult({
                poolKey: poolKey,
                zeroForOne: zeroForOne,
                hookData: "",
                variableAmount: variableAmount,
                gasEstimate: gasEstimate
            });
            quoteResults[i] = quote;
        }

        // Filter out empty results
        swaps = new IV4MetaQuoter.MetaQuoteExactSingleResult[](quoteResultsCount);
        uint256 swapsIndex = 0;
        for (uint256 i = 0; i < quoteResults.length; i++) {
            if (quoteResults[i].gasEstimate != 0) {
                swaps[swapsIndex] = quoteResults[i]; //non-zero quote
                swapsIndex++;
            }
        }
    }
}
