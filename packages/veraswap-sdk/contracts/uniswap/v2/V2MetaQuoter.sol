// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {ParseBytes} from "@uniswap/v4-core/src/libraries/ParseBytes.sol";
import {QuoterRevert} from "@uniswap/v4-periphery/src/libraries/QuoterRevert.sol";

import {IV2Quoter} from "./IV2Quoter.sol";
import {IV2MetaQuoter} from "./IV2MetaQuoter.sol";
import {V2Quoter} from "./V2Quoter.sol";
import {V2QuoterBase} from "./V2QuoterBase.sol";
import {V2PoolKey} from "./V2PoolKey.sol";

/// @title V2MetaQuoter
/// @notice Supports quoting and routing optimal trade using logic by getting balance delta across multiple routes
/// @dev These functions are not marked view because they rely on calling non-view functions and reverting
/// to compute the result. They are also not gas efficient and should not be called on-chain.
contract V2MetaQuoter is V2Quoter, IV2MetaQuoter {
    constructor(address _factory, bytes32 _pairInitCodeHash) V2Quoter(_factory, _pairInitCodeHash) {}

    /// @inheritdoc IV2MetaQuoter
    function metaQuoteExactInput(
        MetaQuoteExactParams memory params
    ) public view returns (MetaQuoteExactResult[] memory swaps) {
        // Find best swap route for each hop currency
        uint256 quoteResultsCount = 0; // Count of non-reverting quotes
        MetaQuoteExactResult[] memory quoteResults = new MetaQuoteExactResult[](params.hopCurrencies.length);

        for (uint256 k = 0; k < params.hopCurrencies.length; k++) {
            // Quote Input -> Intermediate -> Output
            Currency[] memory path = new Currency[](2);
            path[0] = params.hopCurrencies[k];
            path[1] = params.variableCurrency;

            IV2Quoter.QuoteExactParams memory quoteParams = IV2Quoter.QuoteExactParams({
                exactCurrency: params.exactCurrency,
                path: path,
                exactAmount: params.exactAmount
            });

            try this.quoteExactInput(quoteParams) returns (uint256 amountOut) {
                // Quote succeeded
                MetaQuoteExactResult memory quote = MetaQuoteExactResult({path: path, variableAmount: amountOut});
                quoteResultsCount++;
                quoteResults[k] = quote;
            } catch {
                continue; // Skip this hop currency if no valid quote
            }
        }

        // Filter out empty results
        swaps = new MetaQuoteExactResult[](quoteResultsCount);
        uint256 swapsIndex = 0;
        for (uint256 i = 0; i < quoteResults.length; i++) {
            if (quoteResults[i].variableAmount != 0) {
                swaps[swapsIndex] = quoteResults[i]; //non-zero quote
                swapsIndex++;
            }
        }
    }

    /// @inheritdoc IV2MetaQuoter
    function metaQuoteExactOutput(
        MetaQuoteExactParams memory params
    ) public view returns (MetaQuoteExactResult[] memory swaps) {
        // Find best swap route for each hop currency
        uint256 quoteResultsCount = 0; // Count of non-reverting quotes
        MetaQuoteExactResult[] memory quoteResults = new MetaQuoteExactResult[](params.hopCurrencies.length);

        for (uint256 k = 0; k < params.hopCurrencies.length; k++) {
            // Quote Input -> Intermediate -> Output
            Currency[] memory path = new Currency[](2);
            path[0] = params.variableCurrency;
            path[1] = params.hopCurrencies[k];

            IV2Quoter.QuoteExactParams memory quoteParams = IV2Quoter.QuoteExactParams({
                exactCurrency: params.exactCurrency,
                path: path,
                exactAmount: params.exactAmount
            });

            try this.quoteExactOutput(quoteParams) returns (uint256 amountIn) {
                // Quote succeeded
                MetaQuoteExactResult memory quote = MetaQuoteExactResult({path: path, variableAmount: amountIn});
                quoteResultsCount++;
                quoteResults[k] = quote;
            } catch {
                continue; // Skip this hop currency if no valid quote
            }
        }

        // Filter out empty results
        swaps = new MetaQuoteExactResult[](quoteResultsCount);
        uint256 swapsIndex = 0;
        for (uint256 i = 0; i < quoteResults.length; i++) {
            if (quoteResults[i].variableAmount != 0) {
                swaps[swapsIndex] = quoteResults[i]; //non-zero quote
                swapsIndex++;
            }
        }
    }

    /// @inheritdoc IV2MetaQuoter
    function metaQuoteExactInputBest(
        MetaQuoteExactParams memory params
    )
        external
        view
        returns (uint256 singleSwapAmount, MetaQuoteExactResult memory bestMultihopSwap, BestSwap bestSwapType)
    {
        (Currency currency0, Currency currency1) = params.exactCurrency < params.variableCurrency
            ? (params.exactCurrency, params.variableCurrency)
            : (params.variableCurrency, params.exactCurrency);
        bool zeroForOne = params.exactCurrency == currency0;

        IV2Quoter.QuoteExactSingleParams memory quoteSingleParams = IV2Quoter.QuoteExactSingleParams({
            poolKey: V2PoolKey({currency0: currency0, currency1: currency1}),
            zeroForOne: zeroForOne,
            exactAmount: params.exactAmount
        });

        try this.quoteExactInputSingle(quoteSingleParams) returns (uint256 amountOut) {
            singleSwapAmount = amountOut; //singleSwapAmount is the output amount for single swap
        } catch {
            // If no valid quote, singleSwapAmount = 0
        }

        MetaQuoteExactResult[] memory multihopResults = metaQuoteExactInput(params);

        if (singleSwapAmount == 0 && multihopResults.length == 0) {
            return (singleSwapAmount, bestMultihopSwap, bestSwapType); //BestSwap.None
        } else if (singleSwapAmount == 0) {
            bestSwapType = BestSwap.Multihop;
            bestMultihopSwap = multihopResults[0]; //multihopResults.length > 0
        } else if (multihopResults.length == 0) {
            bestSwapType = BestSwap.Single;
        } else {
            bestMultihopSwap = multihopResults[0]; //multihopResults.length > 0
        }

        // Find swap with largest output amount (will get skipped if length is 0 or 1)
        for (uint256 i = 1; i < multihopResults.length; i++) {
            if (multihopResults[i].variableAmount > bestMultihopSwap.variableAmount) {
                bestMultihopSwap = multihopResults[i];
            }
        }
        // singleSwapAmount > 0 and bestMultihopSwap.length > 0
        if (bestSwapType == BestSwap.None) {
            if (singleSwapAmount >= bestMultihopSwap.variableAmount) {
                bestSwapType = BestSwap.Single;
            } else {
                bestSwapType = BestSwap.Multihop;
            }
        }
    }

    /// @inheritdoc IV2MetaQuoter
    function metaQuoteExactOutputBest(
        MetaQuoteExactParams memory params
    )
        external
        view
        returns (uint256 singleSwapAmount, MetaQuoteExactResult memory bestMultihopSwap, BestSwap bestSwapType)
    {
        (Currency currency0, Currency currency1) = params.exactCurrency < params.variableCurrency
            ? (params.exactCurrency, params.variableCurrency)
            : (params.variableCurrency, params.exactCurrency);
        bool zeroForOne = params.exactCurrency == currency1;

        IV2Quoter.QuoteExactSingleParams memory quoteSingleParams = IV2Quoter.QuoteExactSingleParams({
            poolKey: V2PoolKey({currency0: currency0, currency1: currency1}),
            zeroForOne: zeroForOne,
            exactAmount: params.exactAmount
        });

        try this.quoteExactOutputSingle(quoteSingleParams) returns (uint256 amountOut) {
            singleSwapAmount = amountOut; //singleSwapAmount is the output amount for single swap
        } catch {
            // If no valid quote, singleSwapAmount = 0
        }

        MetaQuoteExactResult[] memory multihopResults = metaQuoteExactOutput(params);

        if (singleSwapAmount == 0 && multihopResults.length == 0) {
            return (singleSwapAmount, bestMultihopSwap, bestSwapType); //BestSwap.None
        } else if (singleSwapAmount == 0) {
            bestSwapType = BestSwap.Multihop;
            bestMultihopSwap = multihopResults[0]; //multihopResults.length > 0
        } else if (multihopResults.length == 0) {
            bestSwapType = BestSwap.Single;
        } else {
            bestMultihopSwap = multihopResults[0]; //multihopResults.length > 0
        }

        // Find swap with smallest input amount (will get skipped if length is 0 or 1)
        for (uint256 i = 1; i < multihopResults.length; i++) {
            if (multihopResults[i].variableAmount < bestMultihopSwap.variableAmount) {
                bestMultihopSwap = multihopResults[i];
            }
        }
        // singleSwapAmount > 0 and bestMultihopSwap.length > 0
        if (bestSwapType == BestSwap.None) {
            if (singleSwapAmount <= bestMultihopSwap.variableAmount) {
                bestSwapType = BestSwap.Single;
            } else {
                bestSwapType = BestSwap.Multihop;
            }
        }
    }
}
