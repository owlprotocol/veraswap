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

import {IMetaQuoter} from "./IMetaQuoter.sol";

/// @title MetaQuoter
/// @notice Supports quoting and routing optimal trade using logic by getting balance delta across multiple routes
/// similar to how V4Quoter
/// @dev These functions are not marked view because they rely on calling non-view functions and reverting
/// to compute the result. They are also not gas efficient and should not be called on-chain.
contract MetaQuoter is IV4Quoter, IMetaQuoter, BaseV4Quoter {
    using QuoterRevert for *;
    using ParseBytes for bytes;

    constructor(IPoolManager _poolManager) BaseV4Quoter(_poolManager) {}

    /// @inheritdoc IMetaQuoter
    function metaQuoteExactInput(
        MetaQuoteExactParams memory params
    )
        external
        returns (MetaQuoteExactSingleResult memory bestSingleSwap, MetaQuoteExactResult memory bestMultihopSwap)
    {
        // Single Quotes
        {
            uint256 singleResultsMaxLen = params.poolKeyOptions.length;
            MetaQuoteExactSingleResult[] memory singleResults = new MetaQuoteExactSingleResult[](singleResultsMaxLen);

            (Currency currency0, Currency currency1) = params.exactCurrency < params.variableCurrency
                ? (params.exactCurrency, params.variableCurrency)
                : (params.variableCurrency, params.exactCurrency);
            bool zeroForOne = params.exactCurrency == currency0;

            // Loop through the poolKeyOptions and create a PoolKey for each
            // Quote using quoteExactInputSingle
            for (uint256 i = 0; i < params.poolKeyOptions.length; i++) {
                PoolKeyOptions memory poolKeyOptions = params.poolKeyOptions[i];

                PoolKey memory poolKey = PoolKey({
                    currency0: currency0,
                    currency1: currency1,
                    fee: poolKeyOptions.fee,
                    tickSpacing: poolKeyOptions.tickSpacing,
                    hooks: IHooks(poolKeyOptions.hooks)
                });

                QuoteExactSingleParams memory quoteParams = QuoteExactSingleParams({
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
                uint256 variableAmount = reason.parseQuoteAmount();

                MetaQuoteExactSingleResult memory singleResult = MetaQuoteExactSingleResult({
                    poolKey: poolKey,
                    zeroForOne: zeroForOne,
                    hookData: "",
                    variableAmount: variableAmount,
                    gasEstimate: gasEstimate
                });
                singleResults[i] = singleResult;

                // Find swap with largest output amount
                for (uint256 j = 0; j < singleResults.length; j++) {
                    if (singleResults[j].variableAmount > bestSingleSwap.variableAmount) {
                        bestSingleSwap = singleResults[j];
                    }
                }
            }
        }

        // Multihop Quotes
        uint256 multihopResultsMaxLen = params.poolKeyOptions.length * params.hopCurrencies.length;
        MetaQuoteExactResult[] memory multihopResults = new MetaQuoteExactResult[](multihopResultsMaxLen);
        for (uint256 i = 0; i < params.poolKeyOptions.length; i++) {
            PoolKeyOptions memory poolKeyOptions = params.poolKeyOptions[i];

            for (uint256 j = 0; j < params.hopCurrencies.length; j++) {
                PathKey memory pathKey = PathKey({
                    intermediateCurrency: params.hopCurrencies[j],
                    fee: poolKeyOptions.fee,
                    tickSpacing: poolKeyOptions.tickSpacing,
                    hooks: IHooks(poolKeyOptions.hooks),
                    hookData: ""
                });
                PathKey[] memory path = new PathKey[](1);
                path[0] = pathKey;

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
                uint256 variableAmount = reason.parseQuoteAmount();

                MetaQuoteExactResult memory multihopResult = MetaQuoteExactResult({
                    path: path,
                    variableAmount: variableAmount,
                    gasEstimate: gasEstimate
                });
                multihopResults[i] = multihopResult;
            }

            // Find swap with largest output amount
            for (uint256 j = 0; j < multihopResults.length; j++) {
                if (multihopResults[j].variableAmount > bestSingleSwap.variableAmount) {
                    bestMultihopSwap = multihopResults[j];
                }
            }
        }
    }

    /// @inheritdoc IMetaQuoter
    function metaQuoteExactOutput(
        MetaQuoteExactParams memory params
    )
        external
        returns (MetaQuoteExactSingleResult memory bestSingleSwap, MetaQuoteExactResult memory bestMultihopSwap)
    {
        // Single Quotes
        {
            uint256 singleResultsMaxLen = params.poolKeyOptions.length;
            MetaQuoteExactSingleResult[] memory singleResults = new MetaQuoteExactSingleResult[](singleResultsMaxLen);

            (Currency currency0, Currency currency1) = params.exactCurrency < params.variableCurrency
                ? (params.exactCurrency, params.variableCurrency)
                : (params.variableCurrency, params.exactCurrency);
            bool zeroForOne = params.exactCurrency == currency0;

            // Loop through the poolKeyOptions and create a PoolKey for each
            // Quote using quoteExactInputSingle
            for (uint256 i = 0; i < params.poolKeyOptions.length; i++) {
                PoolKeyOptions memory poolKeyOptions = params.poolKeyOptions[i];

                PoolKey memory poolKey = PoolKey({
                    currency0: currency0,
                    currency1: currency1,
                    fee: poolKeyOptions.fee,
                    tickSpacing: poolKeyOptions.tickSpacing,
                    hooks: IHooks(poolKeyOptions.hooks)
                });

                QuoteExactSingleParams memory quoteParams = QuoteExactSingleParams({
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
                uint256 variableAmount = reason.parseQuoteAmount();

                MetaQuoteExactSingleResult memory singleResult = MetaQuoteExactSingleResult({
                    poolKey: poolKey,
                    zeroForOne: zeroForOne,
                    hookData: "",
                    variableAmount: variableAmount,
                    gasEstimate: gasEstimate
                });
                singleResults[i] = singleResult;

                // Find swap with smallest input amount
                if (singleResults.length > 0) {
                    bestSingleSwap = singleResults[0];
                }
                for (uint256 j = 0; j < singleResults.length; j++) {
                    if (singleResults[j].variableAmount < bestSingleSwap.variableAmount) {
                        bestSingleSwap = singleResults[j];
                    }
                }
            }
        }

        // Multihop Quotes
        uint256 multihopResultsMaxLen = params.poolKeyOptions.length * params.hopCurrencies.length;
        MetaQuoteExactResult[] memory multihopResults = new MetaQuoteExactResult[](multihopResultsMaxLen);
        for (uint256 i = 0; i < params.poolKeyOptions.length; i++) {
            PoolKeyOptions memory poolKeyOptions = params.poolKeyOptions[i];

            for (uint256 j = 0; j < params.hopCurrencies.length; j++) {
                PathKey memory pathKey = PathKey({
                    intermediateCurrency: params.hopCurrencies[j],
                    fee: poolKeyOptions.fee,
                    tickSpacing: poolKeyOptions.tickSpacing,
                    hooks: IHooks(poolKeyOptions.hooks),
                    hookData: ""
                });
                PathKey[] memory path = new PathKey[](1);
                path[0] = pathKey;

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
                uint256 variableAmount = reason.parseQuoteAmount();

                MetaQuoteExactResult memory multihopResult = MetaQuoteExactResult({
                    path: path,
                    variableAmount: variableAmount,
                    gasEstimate: gasEstimate
                });
                multihopResults[i] = multihopResult;
            }

            // Find swap with smallest input amount
            if (multihopResults.length > 0) {
                bestMultihopSwap = multihopResults[0];
            }
            for (uint256 j = 0; j < multihopResults.length; j++) {
                if (multihopResults[j].variableAmount < bestSingleSwap.variableAmount) {
                    bestMultihopSwap = multihopResults[j];
                }
            }
        }
    }

    function _quoteExactInputSingleReason(
        QuoteExactSingleParams memory params
    ) internal returns (bytes memory reason, uint256 gasEstimate) {
        uint256 gasBefore = gasleft();
        try poolManager.unlock(abi.encodeCall(this._quoteExactInputSingle, (params))) {} catch (
            bytes memory reasonCatch
        ) {
            gasEstimate = gasBefore - gasleft();
            reason = reasonCatch;
        }
    }

    /// @inheritdoc IV4Quoter
    function quoteExactInputSingle(
        QuoteExactSingleParams memory params
    ) external returns (uint256 amountOut, uint256 gasEstimate) {
        (bytes memory reason, uint256 gasEstimateCatch) = _quoteExactInputSingleReason(params);
        gasEstimate = gasEstimateCatch;
        amountOut = reason.parseQuoteAmount();
    }

    function _quoteExactInputReason(
        QuoteExactParams memory params
    ) internal returns (bytes memory reason, uint256 gasEstimate) {
        uint256 gasBefore = gasleft();
        try poolManager.unlock(abi.encodeCall(this._quoteExactInput, (params))) {} catch (bytes memory reasonCatch) {
            gasEstimate = gasBefore - gasleft();
            reason = reasonCatch;
        }
    }

    /// @inheritdoc IV4Quoter
    function quoteExactInput(QuoteExactParams memory params) external returns (uint256 amountOut, uint256 gasEstimate) {
        (bytes memory reason, uint256 gasEstimateCatch) = _quoteExactInputReason(params);
        gasEstimate = gasEstimateCatch;
        amountOut = reason.parseQuoteAmount();
    }

    function _quoteExactOutputSingleReason(
        QuoteExactSingleParams memory params
    ) internal returns (bytes memory reason, uint256 gasEstimate) {
        uint256 gasBefore = gasleft();
        try poolManager.unlock(abi.encodeCall(this._quoteExactOutputSingle, (params))) {} catch (
            bytes memory reasonCatch
        ) {
            gasEstimate = gasBefore - gasleft();
            reason = reasonCatch;
        }
    }

    /// @inheritdoc IV4Quoter
    function quoteExactOutputSingle(
        QuoteExactSingleParams memory params
    ) external returns (uint256 amountIn, uint256 gasEstimate) {
        (bytes memory reason, uint256 gasEstimateCatch) = _quoteExactOutputSingleReason(params);
        gasEstimate = gasEstimateCatch;
        amountIn = reason.parseQuoteAmount();
    }

    function _quoteExactOutputReason(
        QuoteExactParams memory params
    ) internal returns (bytes memory reason, uint256 gasEstimate) {
        uint256 gasBefore = gasleft();
        try poolManager.unlock(abi.encodeCall(this._quoteExactOutput, (params))) {} catch (bytes memory reasonCatch) {
            gasEstimate = gasBefore - gasleft();
            reason = reasonCatch;
        }
    }

    /// @inheritdoc IV4Quoter
    function quoteExactOutput(QuoteExactParams memory params) external returns (uint256 amountIn, uint256 gasEstimate) {
        (bytes memory reason, uint256 gasEstimateCatch) = _quoteExactOutputReason(params);
        gasEstimate = gasEstimateCatch;
        amountIn = reason.parseQuoteAmount();
    }

    /// @dev external function called within the _unlockCallback, to simulate an exact input swap, then revert with the result
    function _quoteExactInput(QuoteExactParams calldata params) external selfOnly returns (bytes memory) {
        uint256 pathLength = params.path.length;
        BalanceDelta swapDelta;
        uint128 amountIn = params.exactAmount;
        Currency inputCurrency = params.exactCurrency;
        PathKey calldata pathKey;

        for (uint256 i = 0; i < pathLength; i++) {
            pathKey = params.path[i];
            (PoolKey memory poolKey, bool zeroForOne) = pathKey.getPoolAndSwapDirection(inputCurrency);

            swapDelta = _swap(poolKey, zeroForOne, -int256(int128(amountIn)), pathKey.hookData);

            amountIn = zeroForOne ? uint128(swapDelta.amount1()) : uint128(swapDelta.amount0());
            inputCurrency = pathKey.intermediateCurrency;
        }
        // amountIn after the loop actually holds the amountOut of the trade
        amountIn.revertQuote();
    }

    /// @dev external function called within the _unlockCallback, to simulate a single-hop exact input swap, then revert with the result
    function _quoteExactInputSingle(QuoteExactSingleParams calldata params) external selfOnly returns (bytes memory) {
        BalanceDelta swapDelta = _swap(
            params.poolKey,
            params.zeroForOne,
            -int256(int128(params.exactAmount)),
            params.hookData
        );

        // the output delta of a swap is positive
        uint256 amountOut = params.zeroForOne ? uint128(swapDelta.amount1()) : uint128(swapDelta.amount0());
        amountOut.revertQuote();
    }

    /// @dev external function called within the _unlockCallback, to simulate an exact output swap, then revert with the result
    function _quoteExactOutput(QuoteExactParams calldata params) external selfOnly returns (bytes memory) {
        uint256 pathLength = params.path.length;
        BalanceDelta swapDelta;
        uint128 amountOut = params.exactAmount;
        Currency outputCurrency = params.exactCurrency;
        PathKey calldata pathKey;

        for (uint256 i = pathLength; i > 0; i--) {
            pathKey = params.path[i - 1];
            (PoolKey memory poolKey, bool oneForZero) = pathKey.getPoolAndSwapDirection(outputCurrency);

            swapDelta = _swap(poolKey, !oneForZero, int256(uint256(amountOut)), pathKey.hookData);

            amountOut = oneForZero ? uint128(-swapDelta.amount1()) : uint128(-swapDelta.amount0());

            outputCurrency = pathKey.intermediateCurrency;
        }
        // amountOut after the loop exits actually holds the amountIn of the trade
        amountOut.revertQuote();
    }

    /// @dev external function called within the _unlockCallback, to simulate a single-hop exact output swap, then revert with the result
    function _quoteExactOutputSingle(QuoteExactSingleParams calldata params) external selfOnly returns (bytes memory) {
        BalanceDelta swapDelta = _swap(
            params.poolKey,
            params.zeroForOne,
            int256(uint256(params.exactAmount)),
            params.hookData
        );

        // the input delta of a swap is negative so we must flip it
        uint256 amountIn = params.zeroForOne ? uint128(-swapDelta.amount0()) : uint128(-swapDelta.amount1());
        amountIn.revertQuote();
    }
}
