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
import {V4MetaQuoter} from "./V4MetaQuoter.sol";

/// @title V4GraphQuoter
/// @notice Supports quoting and routing optimal trade using logic by getting balance delta across multiple routes
/// similar to how V4MetaQuoter but using graph search algorithm for multihop swaps
/// @dev These functions are not marked view because they rely on calling non-view functions and reverting
/// to compute the result. They are also not gas efficient and should not be called on-chain.
contract V4GraphQuoter is V4MetaQuoter {
    using QuoterRevert for *;
    using ParseBytes for bytes;

    constructor(IPoolManager _poolManager) V4MetaQuoter(_poolManager) {}

    /// @inheritdoc IV4MetaQuoter
    function metaQuoteExactInput(
        MetaQuoteExactParams memory params
    ) public override returns (MetaQuoteExactResult[] memory swaps) {
        // Try all poolKeyOption permutations with all hop currencies
        uint256 quoteResultsMaxLen = params.poolKeyOptions.length *
            params.poolKeyOptions.length *
            params.hopCurrencies.length;
        uint256 quoteResultsCount = 0;
        MetaQuoteExactResult[] memory quoteResults = new MetaQuoteExactResult[](quoteResultsMaxLen);

        for (uint256 i = 0; i < params.poolKeyOptions.length; i++) {
            PoolKeyOptions memory poolKeyOptions0 = params.poolKeyOptions[i];

            for (uint256 j = 0; j < params.poolKeyOptions.length; j++) {
                PoolKeyOptions memory poolKeyOptions1 = params.poolKeyOptions[j];

                for (uint256 k = 0; k < params.hopCurrencies.length; k++) {
                    PathKey memory pathKeyIntermediate = PathKey({
                        intermediateCurrency: params.hopCurrencies[k],
                        fee: poolKeyOptions0.fee,
                        tickSpacing: poolKeyOptions0.tickSpacing,
                        hooks: IHooks(poolKeyOptions0.hooks),
                        hookData: ""
                    });
                    PathKey memory pathKeyOutput = PathKey({
                        intermediateCurrency: params.variableCurrency,
                        fee: poolKeyOptions1.fee,
                        tickSpacing: poolKeyOptions1.tickSpacing,
                        hooks: IHooks(poolKeyOptions1.hooks),
                        hookData: ""
                    });
                    // Input -> Intermediate -> Output
                    PathKey[] memory path = new PathKey[](2);
                    path[0] = pathKeyIntermediate;
                    path[1] = pathKeyOutput;

                    QuoteExactParams memory quoteParams = QuoteExactParams({
                        exactCurrency: params.exactCurrency,
                        path: path,
                        exactAmount: params.exactAmount
                    });

                    (bytes memory reason, uint256 gasEstimate) = _quoteExactInputReason(quoteParams);
                    if (reason.parseSelector() != QuoterRevert.QuoteSwap.selector) {
                        // Quote failed (eg. insufficient liquidity), skip this pool
                        continue;
                    }
                    quoteResultsCount++;
                    uint256 variableAmount = reason.parseQuoteAmount();

                    MetaQuoteExactResult memory quote = MetaQuoteExactResult({
                        path: path,
                        variableAmount: variableAmount,
                        gasEstimate: gasEstimate
                    });
                    uint256 quoteIndex = i *
                        params.poolKeyOptions.length *
                        params.hopCurrencies.length +
                        j *
                        params.hopCurrencies.length +
                        k;
                    quoteResults[quoteIndex] = quote;
                }
            }
        }

        // Filter out empty results
        swaps = new MetaQuoteExactResult[](quoteResultsCount);
        uint256 swapsIndex = 0;
        for (uint256 i = 0; i < quoteResults.length; i++) {
            if (quoteResults[i].gasEstimate != 0) {
                swaps[swapsIndex] = quoteResults[i]; //non-zero quote
                swapsIndex++;
            }
        }
    }

    /// @inheritdoc IV4MetaQuoter
    function metaQuoteExactOutput(
        MetaQuoteExactParams memory params
    ) public override returns (MetaQuoteExactResult[] memory swaps) {
        uint256 quoteResultsMaxLen = params.poolKeyOptions.length *
            params.poolKeyOptions.length *
            params.hopCurrencies.length;
        uint256 quoteResultsCount = 0;
        MetaQuoteExactResult[] memory quoteResults = new MetaQuoteExactResult[](quoteResultsMaxLen);

        for (uint256 i = 0; i < params.poolKeyOptions.length; i++) {
            PoolKeyOptions memory poolKeyOptions0 = params.poolKeyOptions[i];

            for (uint256 j = 0; j < params.poolKeyOptions.length; j++) {
                PoolKeyOptions memory poolKeyOptions1 = params.poolKeyOptions[j];

                for (uint256 k = 0; k < params.hopCurrencies.length; k++) {
                    PathKey memory pathKeyInput = PathKey({
                        intermediateCurrency: params.variableCurrency,
                        fee: poolKeyOptions0.fee,
                        tickSpacing: poolKeyOptions0.tickSpacing,
                        hooks: IHooks(poolKeyOptions0.hooks),
                        hookData: ""
                    });
                    PathKey memory pathKeyIntermediate = PathKey({
                        intermediateCurrency: params.hopCurrencies[k],
                        fee: poolKeyOptions1.fee,
                        tickSpacing: poolKeyOptions1.tickSpacing,
                        hooks: IHooks(poolKeyOptions1.hooks),
                        hookData: ""
                    });
                    // Input -> Intermediate -> Output
                    PathKey[] memory path = new PathKey[](2);
                    path[0] = pathKeyInput;
                    path[1] = pathKeyIntermediate;

                    QuoteExactParams memory quoteParams = QuoteExactParams({
                        exactCurrency: params.exactCurrency,
                        path: path,
                        exactAmount: params.exactAmount
                    });

                    (bytes memory reason, uint256 gasEstimate) = _quoteExactOutputReason(quoteParams);
                    if (reason.parseSelector() != QuoterRevert.QuoteSwap.selector) {
                        // Quote failed (eg. insufficient liquidity), skip this pool
                        continue;
                    }
                    quoteResultsCount++;
                    uint256 variableAmount = reason.parseQuoteAmount();

                    MetaQuoteExactResult memory quote = MetaQuoteExactResult({
                        path: path,
                        variableAmount: variableAmount,
                        gasEstimate: gasEstimate
                    });
                    uint256 quoteIndex = i *
                        params.poolKeyOptions.length *
                        params.hopCurrencies.length +
                        j *
                        params.hopCurrencies.length +
                        k;
                    quoteResults[quoteIndex] = quote;
                }
            }
        }

        // Filter out empty results
        swaps = new MetaQuoteExactResult[](quoteResultsCount);
        uint256 swapsIndex = 0;
        for (uint256 i = 0; i < quoteResults.length; i++) {
            if (quoteResults[i].gasEstimate != 0) {
                swaps[swapsIndex] = quoteResults[i]; //non-zero quote
                swapsIndex++;
            }
        }
    }
}
