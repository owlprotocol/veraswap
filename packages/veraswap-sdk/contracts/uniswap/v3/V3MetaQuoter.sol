// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {ParseBytes} from "@uniswap/v4-core/src/libraries/ParseBytes.sol";
import {QuoterRevert} from "@uniswap/v4-periphery/src/libraries/QuoterRevert.sol";

import {IV3MetaQuoter} from "./IV3MetaQuoter.sol";
import {V3MetaQuoterBase} from "./V3MetaQuoterBase.sol";
import {V3PoolKey} from "./V3PoolKey.sol";
import {V3PathKey} from "./V3PathKey.sol";

/// @title V3MetaQuoter
/// @notice Supports quoting and routing optimal trade using logic by getting balance delta across multiple routes
/// @dev These functions are not marked view because they rely on calling non-view functions and reverting
/// to compute the result. They are also not gas efficient and should not be called on-chain.
contract V3MetaQuoter is V3MetaQuoterBase, IV3MetaQuoter {
    using QuoterRevert for *;
    using ParseBytes for bytes;

    constructor(address _factory, bytes32 _poolInitCodeHash) V3MetaQuoterBase(_factory, _poolInitCodeHash) {}

    /// @inheritdoc IV3MetaQuoter
    function metaQuoteExactInputSingle(
        MetaQuoteExactSingleParams memory params
    ) external returns (MetaQuoteExactSingleResult[] memory) {
        return _metaQuoteExactInputSingle(params);
    }

    /// @inheritdoc IV3MetaQuoter
    function metaQuoteExactOutputSingle(
        MetaQuoteExactSingleParams memory params
    ) external returns (MetaQuoteExactSingleResult[] memory) {
        return _metaQuoteExactOutputSingle(params);
    }

    /// @inheritdoc IV3MetaQuoter
    function metaQuoteExactInput(
        MetaQuoteExactParams memory params
    ) public returns (MetaQuoteExactResult[] memory swaps) {
        // Find best swap route for each hop currency
        uint256 quoteResultsCount = 0; // Count of non-reverting quotes
        MetaQuoteExactResult[] memory quoteResults = new MetaQuoteExactResult[](params.hopCurrencies.length);

        for (uint256 k = 0; k < params.hopCurrencies.length; k++) {
            // Quote Input -> Intermediate
            MetaQuoteExactSingleParams memory quoteInputToIntermediateParams = MetaQuoteExactSingleParams({
                exactCurrency: params.exactCurrency,
                variableCurrency: params.hopCurrencies[k],
                exactAmount: params.exactAmount,
                feeOptions: params.feeOptions
            });
            MetaQuoteExactSingleResult[] memory quoteInputToIntermediate = _metaQuoteExactInputSingle(
                quoteInputToIntermediateParams
            );
            if (quoteInputToIntermediate.length == 0) {
                // No valid quote for Input -> Intermediate, skip
                continue;
            }
            MetaQuoteExactSingleResult memory quoteInputToIntermediateBest = quoteInputToIntermediate[0];
            for (uint256 i = 1; i < quoteInputToIntermediate.length; i++) {
                // Find largest output
                if (quoteInputToIntermediate[i].variableAmount > quoteInputToIntermediateBest.variableAmount) {
                    quoteInputToIntermediateBest = quoteInputToIntermediate[i];
                }
            }

            // Quote Intermediate -> Output
            MetaQuoteExactSingleParams memory quoteIntermediateToOutputParams = MetaQuoteExactSingleParams({
                exactCurrency: params.hopCurrencies[k],
                variableCurrency: params.variableCurrency,
                exactAmount: uint128(quoteInputToIntermediateBest.variableAmount), // assume < 2^128
                feeOptions: params.feeOptions
            });
            MetaQuoteExactSingleResult[] memory quoteIntermediateToOutput = _metaQuoteExactInputSingle(
                quoteIntermediateToOutputParams
            );
            if (quoteIntermediateToOutput.length == 0) {
                // No valid quote for Intermediate -> Output, skip
                continue;
            }
            MetaQuoteExactSingleResult memory quoteIntermediateToOutputBest = quoteIntermediateToOutput[0];
            for (uint256 i = 1; i < quoteIntermediateToOutput.length; i++) {
                // Find largest output
                if (quoteIntermediateToOutput[i].variableAmount > quoteIntermediateToOutputBest.variableAmount) {
                    quoteIntermediateToOutputBest = quoteIntermediateToOutput[i];
                }
            }
            // Construct path
            // Input -> Intermediate -> Output
            V3PathKey[] memory path = new V3PathKey[](2);
            V3PathKey memory pathKeyIntermediate = V3PathKey({
                intermediateCurrency: params.hopCurrencies[k],
                fee: quoteInputToIntermediateBest.poolKey.fee
            });
            V3PathKey memory pathKeyOutput = V3PathKey({
                intermediateCurrency: params.variableCurrency,
                fee: quoteIntermediateToOutputBest.poolKey.fee
            });
            path[0] = pathKeyIntermediate;
            path[1] = pathKeyOutput;
            // Construct quote
            MetaQuoteExactResult memory quote = MetaQuoteExactResult({
                path: path,
                variableAmount: quoteIntermediateToOutputBest.variableAmount,
                gasEstimate: quoteInputToIntermediateBest.gasEstimate + quoteIntermediateToOutputBest.gasEstimate // Not as accurate as direct multihop quote
            });
            quoteResultsCount++;
            quoteResults[k] = quote;
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

    /// @inheritdoc IV3MetaQuoter
    function metaQuoteExactOutput(
        MetaQuoteExactParams memory params
    ) public returns (MetaQuoteExactResult[] memory swaps) {
        // Find best swap route for each hop currency
        uint256 quoteResultsCount = 0; // Count of non-reverting quotes
        MetaQuoteExactResult[] memory quoteResults = new MetaQuoteExactResult[](params.hopCurrencies.length);

        for (uint256 k = 0; k < params.hopCurrencies.length; k++) {
            // Quote Output -> Intermediate
            MetaQuoteExactSingleParams memory quoteOutputToIntermediateParams = MetaQuoteExactSingleParams({
                exactCurrency: params.exactCurrency,
                variableCurrency: params.hopCurrencies[k],
                exactAmount: params.exactAmount,
                feeOptions: params.feeOptions
            });
            MetaQuoteExactSingleResult[] memory quoteOutputToIntermediate = _metaQuoteExactOutputSingle(
                quoteOutputToIntermediateParams
            );
            if (quoteOutputToIntermediate.length == 0) {
                // No valid quote for Output -> Intermediate, skip
                continue;
            }
            MetaQuoteExactSingleResult memory quoteOutputToIntermediateBest = quoteOutputToIntermediate[0];
            for (uint256 i = 1; i < quoteOutputToIntermediate.length; i++) {
                // Find smallest input
                if (quoteOutputToIntermediate[i].variableAmount < quoteOutputToIntermediateBest.variableAmount) {
                    quoteOutputToIntermediateBest = quoteOutputToIntermediate[i];
                }
            }

            // Quote Intermediate -> Input
            MetaQuoteExactSingleParams memory quoteIntermediateToInputParams = MetaQuoteExactSingleParams({
                exactCurrency: params.hopCurrencies[k],
                variableCurrency: params.variableCurrency,
                exactAmount: uint128(quoteOutputToIntermediateBest.variableAmount), // assume < 2^128
                feeOptions: params.feeOptions
            });
            MetaQuoteExactSingleResult[] memory quoteIntermediateToInput = _metaQuoteExactOutputSingle(
                quoteIntermediateToInputParams
            );
            if (quoteIntermediateToInput.length == 0) {
                // No valid quote for Intermediate -> Input, skip
                continue;
            }
            MetaQuoteExactSingleResult memory quoteIntermediateToInputBest = quoteIntermediateToInput[0];
            for (uint256 i = 1; i < quoteIntermediateToInput.length; i++) {
                // Find smallest input
                if (quoteIntermediateToInput[i].variableAmount < quoteIntermediateToInputBest.variableAmount) {
                    quoteIntermediateToInputBest = quoteIntermediateToInput[i];
                }
            }
            // Construct path
            // Input -> Intermediate -> Output
            V3PathKey[] memory path = new V3PathKey[](2);
            V3PathKey memory pathKeyInput = V3PathKey({
                intermediateCurrency: params.variableCurrency,
                fee: quoteIntermediateToInputBest.poolKey.fee
            });
            V3PathKey memory pathKeyIntermediate = V3PathKey({
                intermediateCurrency: params.hopCurrencies[k],
                fee: quoteOutputToIntermediateBest.poolKey.fee
            });
            path[0] = pathKeyInput;
            path[1] = pathKeyIntermediate;
            // Construct quote
            MetaQuoteExactResult memory quote = MetaQuoteExactResult({
                path: path,
                variableAmount: quoteIntermediateToInputBest.variableAmount,
                gasEstimate: quoteOutputToIntermediateBest.gasEstimate + quoteIntermediateToInputBest.gasEstimate // Not as accurate as direct multihop quote
            });
            quoteResultsCount++;
            quoteResults[k] = quote;
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
    {
        MetaQuoteExactSingleResult[] memory singleResults = _metaQuoteExactInputSingle(
            MetaQuoteExactSingleParams({
                exactCurrency: params.exactCurrency,
                variableCurrency: params.variableCurrency,
                feeOptions: params.feeOptions,
                exactAmount: params.exactAmount
            })
        );
        MetaQuoteExactResult[] memory multihopResults = metaQuoteExactInput(params);

        if (singleResults.length == 0 && multihopResults.length == 0) {
            return (bestSingleSwap, bestMultihopSwap, bestSwapType); //BestSwap.None
        } else if (singleResults.length == 0) {
            bestSwapType = BestSwap.Multihop;
            bestMultihopSwap = multihopResults[0]; //multihopResults.length > 0
        } else if (multihopResults.length == 0) {
            bestSwapType = BestSwap.Single;
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
        if (bestSwapType == BestSwap.None) {
            if (bestSingleSwap.variableAmount >= bestMultihopSwap.variableAmount) {
                bestSwapType = BestSwap.Single;
            } else {
                bestSwapType = BestSwap.Multihop;
            }
        }
    }

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
    {
        // Single Quotes
        MetaQuoteExactSingleResult[] memory singleResults = _metaQuoteExactOutputSingle(
            MetaQuoteExactSingleParams({
                exactCurrency: params.exactCurrency,
                variableCurrency: params.variableCurrency,
                feeOptions: params.feeOptions,
                exactAmount: params.exactAmount
            })
        );
        MetaQuoteExactResult[] memory multihopResults = metaQuoteExactOutput(params);

        if (singleResults.length == 0 && multihopResults.length == 0) {
            return (bestSingleSwap, bestMultihopSwap, bestSwapType); //BestSwap.None
        } else if (singleResults.length == 0) {
            bestSwapType = BestSwap.Multihop;
            bestMultihopSwap = multihopResults[0]; //multihopResults.length > 0
        } else if (multihopResults.length == 0) {
            bestSwapType = BestSwap.Single;
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
        if (bestSwapType == BestSwap.None) {
            if (bestSingleSwap.variableAmount <= bestMultihopSwap.variableAmount) {
                bestSwapType = BestSwap.Single;
            } else {
                bestSwapType = BestSwap.Multihop;
            }
        }
    }
}
