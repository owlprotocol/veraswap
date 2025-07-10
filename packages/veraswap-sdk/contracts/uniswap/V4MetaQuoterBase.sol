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
    ) internal virtual returns (IV4MetaQuoter.MetaQuoteExactSingleResult[] memory swaps) {
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
    ) internal virtual returns (IV4MetaQuoter.MetaQuoteExactSingleResult[] memory swaps) {
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

    function _metaQuoteExactInput(
        IV4MetaQuoter.MetaQuoteExactParams memory params
    ) internal virtual returns (IV4MetaQuoter.MetaQuoteExactResult[] memory swaps) {
        // Find best swap route for each hop currency
        uint256 quoteResultsCount = 0; // Count of non-reverting quotes
        IV4MetaQuoter.MetaQuoteExactResult[] memory quoteResults = new IV4MetaQuoter.MetaQuoteExactResult[](
            params.hopCurrencies.length
        );

        for (uint256 k = 0; k < params.hopCurrencies.length; k++) {
            // Quote Input -> Intermediate
            IV4MetaQuoter.MetaQuoteExactSingleParams memory quoteInputToIntermediateParams = IV4MetaQuoter
                .MetaQuoteExactSingleParams({
                    exactCurrency: params.exactCurrency,
                    variableCurrency: params.hopCurrencies[k],
                    exactAmount: params.exactAmount,
                    poolKeyOptions: params.poolKeyOptions
                });
            IV4MetaQuoter.MetaQuoteExactSingleResult[] memory quoteInputToIntermediate = _metaQuoteExactInputSingle(
                quoteInputToIntermediateParams
            );
            if (quoteInputToIntermediate.length == 0) {
                // No valid quote for Input -> Intermediate, skip
                continue;
            }
            IV4MetaQuoter.MetaQuoteExactSingleResult memory quoteInputToIntermediateBest = quoteInputToIntermediate[0];
            for (uint256 i = 1; i < quoteInputToIntermediate.length; i++) {
                // Find largest output
                if (quoteInputToIntermediate[i].variableAmount > quoteInputToIntermediateBest.variableAmount) {
                    quoteInputToIntermediateBest = quoteInputToIntermediate[i];
                }
            }

            // Quote Intermediate -> Output
            IV4MetaQuoter.MetaQuoteExactSingleParams memory quoteIntermediateToOutputParams = IV4MetaQuoter
                .MetaQuoteExactSingleParams({
                    exactCurrency: params.hopCurrencies[k],
                    variableCurrency: params.variableCurrency,
                    exactAmount: uint128(quoteInputToIntermediateBest.variableAmount), // assume < 2^128
                    poolKeyOptions: params.poolKeyOptions
                });
            IV4MetaQuoter.MetaQuoteExactSingleResult[] memory quoteIntermediateToOutput = _metaQuoteExactInputSingle(
                quoteIntermediateToOutputParams
            );
            if (quoteIntermediateToOutput.length == 0) {
                // No valid quote for Intermediate -> Output, skip
                continue;
            }
            IV4MetaQuoter.MetaQuoteExactSingleResult memory quoteIntermediateToOutputBest = quoteIntermediateToOutput[
                0
            ];
            for (uint256 i = 1; i < quoteIntermediateToOutput.length; i++) {
                // Find largest output
                if (quoteIntermediateToOutput[i].variableAmount > quoteIntermediateToOutputBest.variableAmount) {
                    quoteIntermediateToOutputBest = quoteIntermediateToOutput[i];
                }
            }
            // Construct path
            // Input -> Intermediate -> Output
            PathKey[] memory path = new PathKey[](2);
            PathKey memory pathKeyIntermediate = PathKey({
                intermediateCurrency: params.hopCurrencies[k],
                fee: quoteInputToIntermediateBest.poolKey.fee,
                tickSpacing: quoteInputToIntermediateBest.poolKey.tickSpacing,
                hooks: quoteInputToIntermediateBest.poolKey.hooks,
                hookData: quoteInputToIntermediateBest.hookData
            });
            PathKey memory pathKeyOutput = PathKey({
                intermediateCurrency: params.variableCurrency,
                fee: quoteIntermediateToOutputBest.poolKey.fee,
                tickSpacing: quoteIntermediateToOutputBest.poolKey.tickSpacing,
                hooks: quoteIntermediateToOutputBest.poolKey.hooks,
                hookData: quoteIntermediateToOutputBest.hookData
            });
            path[0] = pathKeyIntermediate;
            path[1] = pathKeyOutput;
            // Construct quote
            IV4MetaQuoter.MetaQuoteExactResult memory quote = IV4MetaQuoter.MetaQuoteExactResult({
                path: path,
                variableAmount: quoteIntermediateToOutputBest.variableAmount,
                gasEstimate: quoteInputToIntermediateBest.gasEstimate + quoteIntermediateToOutputBest.gasEstimate // Not as accurate as direct multihop quote
            });
            quoteResultsCount++;
            quoteResults[k] = quote;
        }

        // Filter out empty results
        swaps = new IV4MetaQuoter.MetaQuoteExactResult[](quoteResultsCount);
        uint256 swapsIndex = 0;
        for (uint256 i = 0; i < quoteResults.length; i++) {
            if (quoteResults[i].gasEstimate != 0) {
                swaps[swapsIndex] = quoteResults[i]; //non-zero quote
                swapsIndex++;
            }
        }
    }

    function _metaQuoteExactOutput(
        IV4MetaQuoter.MetaQuoteExactParams memory params
    ) internal virtual returns (IV4MetaQuoter.MetaQuoteExactResult[] memory swaps) {
        // Find best swap route for each hop currency
        uint256 quoteResultsCount = 0; // Count of non-reverting quotes
        IV4MetaQuoter.MetaQuoteExactResult[] memory quoteResults = new IV4MetaQuoter.MetaQuoteExactResult[](
            params.hopCurrencies.length
        );

        for (uint256 k = 0; k < params.hopCurrencies.length; k++) {
            // Quote Output -> Intermediate
            IV4MetaQuoter.MetaQuoteExactSingleParams memory quoteOutputToIntermediateParams = IV4MetaQuoter
                .MetaQuoteExactSingleParams({
                    exactCurrency: params.exactCurrency,
                    variableCurrency: params.hopCurrencies[k],
                    exactAmount: params.exactAmount,
                    poolKeyOptions: params.poolKeyOptions
                });
            IV4MetaQuoter.MetaQuoteExactSingleResult[] memory quoteOutputToIntermediate = _metaQuoteExactOutputSingle(
                quoteOutputToIntermediateParams
            );
            if (quoteOutputToIntermediate.length == 0) {
                // No valid quote for Output -> Intermediate, skip
                continue;
            }
            IV4MetaQuoter.MetaQuoteExactSingleResult memory quoteOutputToIntermediateBest = quoteOutputToIntermediate[
                0
            ];
            for (uint256 i = 1; i < quoteOutputToIntermediate.length; i++) {
                // Find smallest input
                if (quoteOutputToIntermediate[i].variableAmount < quoteOutputToIntermediateBest.variableAmount) {
                    quoteOutputToIntermediateBest = quoteOutputToIntermediate[i];
                }
            }

            // Quote Intermediate -> Input
            IV4MetaQuoter.MetaQuoteExactSingleParams memory quoteIntermediateToInputParams = IV4MetaQuoter
                .MetaQuoteExactSingleParams({
                    exactCurrency: params.hopCurrencies[k],
                    variableCurrency: params.variableCurrency,
                    exactAmount: uint128(quoteOutputToIntermediateBest.variableAmount), // assume < 2^128
                    poolKeyOptions: params.poolKeyOptions
                });
            IV4MetaQuoter.MetaQuoteExactSingleResult[] memory quoteIntermediateToInput = _metaQuoteExactOutputSingle(
                quoteIntermediateToInputParams
            );
            if (quoteIntermediateToInput.length == 0) {
                // No valid quote for Intermediate -> Input, skip
                continue;
            }
            IV4MetaQuoter.MetaQuoteExactSingleResult memory quoteIntermediateToInputBest = quoteIntermediateToInput[0];
            for (uint256 i = 1; i < quoteIntermediateToInput.length; i++) {
                // Find smallest input
                if (quoteIntermediateToInput[i].variableAmount < quoteIntermediateToInputBest.variableAmount) {
                    quoteIntermediateToInputBest = quoteIntermediateToInput[i];
                }
            }
            // Construct path
            // Input -> Intermediate -> Output
            PathKey[] memory path = new PathKey[](2);
            PathKey memory pathKeyInput = PathKey({
                intermediateCurrency: params.variableCurrency,
                fee: quoteIntermediateToInputBest.poolKey.fee,
                tickSpacing: quoteIntermediateToInputBest.poolKey.tickSpacing,
                hooks: quoteIntermediateToInputBest.poolKey.hooks,
                hookData: quoteIntermediateToInputBest.hookData
            });
            PathKey memory pathKeyIntermediate = PathKey({
                intermediateCurrency: params.hopCurrencies[k],
                fee: quoteOutputToIntermediateBest.poolKey.fee,
                tickSpacing: quoteOutputToIntermediateBest.poolKey.tickSpacing,
                hooks: quoteOutputToIntermediateBest.poolKey.hooks,
                hookData: quoteOutputToIntermediateBest.hookData
            });
            path[0] = pathKeyInput;
            path[1] = pathKeyIntermediate;
            // Construct quote
            IV4MetaQuoter.MetaQuoteExactResult memory quote = IV4MetaQuoter.MetaQuoteExactResult({
                path: path,
                variableAmount: quoteIntermediateToInputBest.variableAmount,
                gasEstimate: quoteOutputToIntermediateBest.gasEstimate + quoteIntermediateToInputBest.gasEstimate // Not as accurate as direct multihop quote
            });
            quoteResultsCount++;
            quoteResults[k] = quote;
        }

        // Filter out empty results
        swaps = new IV4MetaQuoter.MetaQuoteExactResult[](quoteResultsCount);
        uint256 swapsIndex = 0;
        for (uint256 i = 0; i < quoteResults.length; i++) {
            if (quoteResults[i].gasEstimate != 0) {
                swaps[swapsIndex] = quoteResults[i]; //non-zero quote
                swapsIndex++;
            }
        }
    }

    function _metaQuoteExactInputBest(
        IV4MetaQuoter.MetaQuoteExactParams memory params
    )
        internal
        returns (
            IV4MetaQuoter.MetaQuoteExactSingleResult memory bestSingleSwap,
            IV4MetaQuoter.MetaQuoteExactResult memory bestMultihopSwap,
            IV4MetaQuoter.BestSwap bestSwapType
        )
    {
        IV4MetaQuoter.MetaQuoteExactSingleResult[] memory singleResults = _metaQuoteExactInputSingle(
            IV4MetaQuoter.MetaQuoteExactSingleParams({
                exactCurrency: params.exactCurrency,
                variableCurrency: params.variableCurrency,
                poolKeyOptions: params.poolKeyOptions,
                exactAmount: params.exactAmount
            })
        );
        IV4MetaQuoter.MetaQuoteExactResult[] memory multihopResults = _metaQuoteExactInput(params);

        if (singleResults.length == 0 && multihopResults.length == 0) {
            return (bestSingleSwap, bestMultihopSwap, bestSwapType); //BestSwap.None
        } else if (singleResults.length == 0) {
            bestSwapType = IV4MetaQuoter.BestSwap.Multihop;
            bestMultihopSwap = multihopResults[0]; //multihopResults.length > 0
        } else if (multihopResults.length == 0) {
            bestSwapType = IV4MetaQuoter.BestSwap.Single;
            bestSingleSwap = singleResults[0]; //singleResults.length > 0
        } else {
            bestSingleSwap = singleResults[0]; //singleResults.length > 0
            bestMultihopSwap = multihopResults[0]; //multihopResults.length > 0
        }

        // Find swap with largest output amount (will get skipped if length is 0 or 1)
        for (uint256 i = 1; i < singleResults.length; i++) {
            if (singleResults[i].variableAmount > bestSingleSwap.variableAmount) {
                bestSingleSwap = singleResults[i];
            }
        }
        // Find swap with largest output amount (will get skipped if length is 0 or 1)
        for (uint256 i = 1; i < multihopResults.length; i++) {
            if (multihopResults[i].variableAmount > bestMultihopSwap.variableAmount) {
                bestMultihopSwap = multihopResults[i];
            }
        }
        // Both arrays have length > 0, compare bestSingleSwap and bestMultihopSwap
        if (bestSwapType == IV4MetaQuoter.BestSwap.None) {
            if (bestSingleSwap.variableAmount >= bestMultihopSwap.variableAmount) {
                bestSwapType = IV4MetaQuoter.BestSwap.Single;
            } else {
                bestSwapType = IV4MetaQuoter.BestSwap.Multihop;
            }
        }
    }

    function _metaQuoteExactOutputBest(
        IV4MetaQuoter.MetaQuoteExactParams memory params
    )
        internal
        returns (
            IV4MetaQuoter.MetaQuoteExactSingleResult memory bestSingleSwap,
            IV4MetaQuoter.MetaQuoteExactResult memory bestMultihopSwap,
            IV4MetaQuoter.BestSwap bestSwapType
        )
    {
        // Single Quotes
        IV4MetaQuoter.MetaQuoteExactSingleResult[] memory singleResults = _metaQuoteExactOutputSingle(
            IV4MetaQuoter.MetaQuoteExactSingleParams({
                exactCurrency: params.exactCurrency,
                variableCurrency: params.variableCurrency,
                poolKeyOptions: params.poolKeyOptions,
                exactAmount: params.exactAmount
            })
        );
        IV4MetaQuoter.MetaQuoteExactResult[] memory multihopResults = _metaQuoteExactOutput(params);

        if (singleResults.length == 0 && multihopResults.length == 0) {
            return (bestSingleSwap, bestMultihopSwap, bestSwapType); //BestSwap.None
        } else if (singleResults.length == 0) {
            bestSwapType = IV4MetaQuoter.BestSwap.Multihop;
            bestMultihopSwap = multihopResults[0]; //multihopResults.length > 0
        } else if (multihopResults.length == 0) {
            bestSwapType = IV4MetaQuoter.BestSwap.Single;
            bestSingleSwap = singleResults[0]; //singleResults.length > 0
        } else {
            bestSingleSwap = singleResults[0]; //singleResults.length > 0
            bestMultihopSwap = multihopResults[0]; //multihopResults.length > 0
        }

        // Find swap with smallest input amount (will get skipped if length is 0 or 1)
        for (uint256 i = 1; i < singleResults.length; i++) {
            if (singleResults[i].variableAmount < bestSingleSwap.variableAmount) {
                bestSingleSwap = singleResults[i];
            }
        }
        // Find swap with smallest input amount (will get skipped if length is 0 or 1)
        for (uint256 i = 1; i < multihopResults.length; i++) {
            if (multihopResults[i].variableAmount < bestMultihopSwap.variableAmount) {
                bestMultihopSwap = multihopResults[i];
            }
        }
        // Both arrays have length > 0, compare bestSingleSwap and bestMultihopSwap
        if (bestSwapType == IV4MetaQuoter.BestSwap.None) {
            if (bestSingleSwap.variableAmount <= bestMultihopSwap.variableAmount) {
                bestSwapType = IV4MetaQuoter.BestSwap.Single;
            } else {
                bestSwapType = IV4MetaQuoter.BestSwap.Multihop;
            }
        }
    }
}
