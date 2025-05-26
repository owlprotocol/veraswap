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
import {V4QuoterBase} from "./V4QuoterBase.sol";

/// @title V4Quoter
contract V4Quoter is IV4Quoter, V4QuoterBase {
    using QuoterRevert for *;
    using ParseBytes for bytes;

    constructor(IPoolManager _poolManager) V4QuoterBase(_poolManager) {}

    /// @inheritdoc IV4Quoter
    function quoteExactInputSingle(
        QuoteExactSingleParams memory params
    ) external returns (uint256 amountOut, uint256 gasEstimate) {
        (bytes memory reason, uint256 gasEstimateCatch) = _quoteExactInputSingleReason(params);
        gasEstimate = gasEstimateCatch;
        amountOut = reason.parseQuoteAmount();
    }

    /// @inheritdoc IV4Quoter
    function quoteExactInput(QuoteExactParams memory params) external returns (uint256 amountOut, uint256 gasEstimate) {
        (bytes memory reason, uint256 gasEstimateCatch) = _quoteExactInputReason(params);
        gasEstimate = gasEstimateCatch;
        amountOut = reason.parseQuoteAmount();
    }

    /// @inheritdoc IV4Quoter
    function quoteExactOutputSingle(
        QuoteExactSingleParams memory params
    ) external returns (uint256 amountIn, uint256 gasEstimate) {
        (bytes memory reason, uint256 gasEstimateCatch) = _quoteExactOutputSingleReason(params);
        gasEstimate = gasEstimateCatch;
        amountIn = reason.parseQuoteAmount();
    }

    /// @inheritdoc IV4Quoter
    function quoteExactOutput(QuoteExactParams memory params) external returns (uint256 amountIn, uint256 gasEstimate) {
        (bytes memory reason, uint256 gasEstimateCatch) = _quoteExactOutputReason(params);
        gasEstimate = gasEstimateCatch;
        amountIn = reason.parseQuoteAmount();
    }
}
