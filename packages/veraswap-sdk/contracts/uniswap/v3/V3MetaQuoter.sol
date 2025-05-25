// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {ParseBytes} from "@uniswap/v4-core/src/libraries/ParseBytes.sol";
import {QuoterRevert} from "@uniswap/v4-periphery/src/libraries/QuoterRevert.sol";

import {IV3MetaQuoter} from "./IV3MetaQuoter.sol";
import {V3Quoter} from "./V3Quoter.sol";
import {V3PoolKey} from "./V3PoolKey.sol";
import {V3PathKey} from "./V3PathKey.sol";

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
    ) public returns (MetaQuoteExactSingleResult[] memory swaps) {
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
    ) public returns (MetaQuoteExactSingleResult[] memory swaps) {
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
    ) external returns (MetaQuoteExactResult[] memory swaps) {
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
            MetaQuoteExactSingleResult[] memory quoteInputToIntermediate = metaQuoteExactInputSingle(
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
            MetaQuoteExactSingleResult[] memory quoteIntermediateToOutput = metaQuoteExactInputSingle(
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
    ) external returns (MetaQuoteExactResult[] memory swaps) {
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
            MetaQuoteExactSingleResult[] memory quoteOutputToIntermediate = metaQuoteExactOutputSingle(
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
            MetaQuoteExactSingleResult[] memory quoteIntermediateToInput = metaQuoteExactOutputSingle(
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
