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

/// @title V4Quoter
abstract contract V4QuoterBase is BaseV4Quoter {
    using QuoterRevert for *;
    using ParseBytes for bytes;

    constructor(IPoolManager _poolManager) BaseV4Quoter(_poolManager) {}

    function _quoteExactInputSingleReason(
        IV4Quoter.QuoteExactSingleParams memory params
    ) internal returns (bytes memory reason, uint256 gasEstimate) {
        uint256 gasBefore = gasleft();
        try poolManager.unlock(abi.encodeCall(this._quoteExactInputSingle, (params))) {} catch (
            bytes memory reasonCatch
        ) {
            gasEstimate = gasBefore - gasleft();
            reason = reasonCatch;
        }
    }

    function _quoteExactInputReason(
        IV4Quoter.QuoteExactParams memory params
    ) internal returns (bytes memory reason, uint256 gasEstimate) {
        uint256 gasBefore = gasleft();
        try poolManager.unlock(abi.encodeCall(this._quoteExactInput, (params))) {} catch (bytes memory reasonCatch) {
            gasEstimate = gasBefore - gasleft();
            reason = reasonCatch;
        }
    }

    function _quoteExactOutputSingleReason(
        IV4Quoter.QuoteExactSingleParams memory params
    ) internal returns (bytes memory reason, uint256 gasEstimate) {
        uint256 gasBefore = gasleft();
        try poolManager.unlock(abi.encodeCall(this._quoteExactOutputSingle, (params))) {} catch (
            bytes memory reasonCatch
        ) {
            gasEstimate = gasBefore - gasleft();
            reason = reasonCatch;
        }
    }

    function _quoteExactOutputReason(
        IV4Quoter.QuoteExactParams memory params
    ) internal returns (bytes memory reason, uint256 gasEstimate) {
        uint256 gasBefore = gasleft();
        try poolManager.unlock(abi.encodeCall(this._quoteExactOutput, (params))) {} catch (bytes memory reasonCatch) {
            gasEstimate = gasBefore - gasleft();
            reason = reasonCatch;
        }
    }

    /// @dev external function called within the _unlockCallback, to simulate an exact input swap, then revert with the result
    function _quoteExactInput(IV4Quoter.QuoteExactParams calldata params) external selfOnly returns (bytes memory) {
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
    function _quoteExactInputSingle(
        IV4Quoter.QuoteExactSingleParams calldata params
    ) external selfOnly returns (bytes memory) {
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
    function _quoteExactOutput(IV4Quoter.QuoteExactParams calldata params) external selfOnly returns (bytes memory) {
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
    function _quoteExactOutputSingle(
        IV4Quoter.QuoteExactSingleParams calldata params
    ) external selfOnly returns (bytes memory) {
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
