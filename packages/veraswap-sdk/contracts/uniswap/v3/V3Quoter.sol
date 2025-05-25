// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {IUniswapV3SwapCallback} from "@uniswap/v3-core/contracts/interfaces/callback/IUniswapV3SwapCallback.sol";

import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {QuoterRevert} from "@uniswap/v4-periphery/src/libraries/QuoterRevert.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";

import {V3CallbackValidation} from "./V3CallbackValidation.sol";
import {IV3Quoter} from "./IV3Quoter.sol";
import {V3PoolKey, V3PoolKeyLibrary} from "./V3PoolKey.sol";

contract V3Quoter is IV3Quoter, IUniswapV3SwapCallback {
    using QuoterRevert for *;

    /// @notice The address of the Uniswap V3 factory contract
    address public immutable factory;
    /// @notice The init code hash of the V3 pool
    bytes32 public immutable poolInitCodeHash;

    error PoolDoesNotExist(address pool);

    /// @param _factory The address of the Uniswap V3 factory contract
    /// @param _poolInitCodeHash The init code hash of the V3 pool
    constructor(address _factory, bytes32 _poolInitCodeHash) {
        factory = _factory;
        poolInitCodeHash = _poolInitCodeHash;
    }

    /// @inheritdoc IUniswapV3SwapCallback
    function uniswapV3SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata data
    ) external view override {
        require(amount0Delta > 0 || amount1Delta > 0); // swaps entirely within 0-liquidity regions are not supported
        (V3PoolKey memory poolKey, bool isExactInput) = abi.decode(data, (V3PoolKey, bool));
        V3CallbackValidation.verifyCallback(poolKey, factory, poolInitCodeHash);

        (uint256 amountToPay, uint256 amountReceived) = amount0Delta > 0
            ? (uint256(amount0Delta), uint256(-amount1Delta))
            : (uint256(amount1Delta), uint256(-amount0Delta));

        if (isExactInput) {
            amountReceived.revertQuote();
        } else {
            amountToPay.revertQuote();
        }
    }

    function _quoteExactInputSingleReason(
        QuoteExactSingleParams memory params
    ) internal returns (bytes memory reason, uint256 gasEstimate) {
        IUniswapV3Pool pool = IUniswapV3Pool(params.poolKey.computeAddress(factory, poolInitCodeHash));
        if (address(pool).code.length == 0) {
            // Pool does not exist, revert early
            reason = abi.encodeWithSelector(PoolDoesNotExist.selector, address(pool));
            return (reason, 0);
        }

        bool zeroForOne = params.zeroForOne;
        uint256 gasBefore = gasleft();
        // limit priced param removed, we set it to the max/min sqrt ratio depending on the swap direction
        uint160 sqrtPriceLimitX96 = zeroForOne ? TickMath.MIN_SQRT_PRICE + 1 : TickMath.MAX_SQRT_PRICE - 1;
        try
            pool.swap(
                address(this), // address(0) might cause issues with some tokens
                zeroForOne,
                int256(uint256(params.exactAmount)),
                sqrtPriceLimitX96,
                abi.encode(params.poolKey, true)
            )
        {} catch (bytes memory reasonCatch) {
            gasEstimate = gasBefore - gasleft();
            reason = reasonCatch;
        }
    }

    /// @inheritdoc IV3Quoter
    function quoteExactInputSingle(
        QuoteExactSingleParams memory params
    ) public returns (uint256 amountOut, uint256 gasEstimate) {
        (bytes memory reason, uint256 gasEstimateCatch) = _quoteExactInputSingleReason(params);
        gasEstimate = gasEstimateCatch;
        amountOut = reason.parseQuoteAmount();
    }

    /// @inheritdoc IV3Quoter
    function quoteExactInput(QuoteExactParams memory params) external returns (uint256 amountOut, uint256 gasEstimate) {
        Currency exactCurrency = params.exactCurrency;
        uint128 exactAmount = params.exactAmount;

        uint256 idx = 0;
        while (true) {
            V3PoolKey memory poolKey = V3PoolKeyLibrary.getPoolKey(
                exactCurrency,
                params.path[idx].intermediateCurrency,
                params.path[idx].fee
            );

            QuoteExactSingleParams memory quoteParams = QuoteExactSingleParams({
                poolKey: poolKey,
                exactAmount: exactAmount,
                zeroForOne: exactCurrency == poolKey.currency0
            });
            (uint256 amount, uint256 gas) = quoteExactInputSingle(quoteParams);
            gasEstimate += gas;

            if (idx == params.path.length - 1) {
                // last path element, return final amount
                return (amount, gasEstimate);
            } else {
                // update the exact currency and amount for the next iteration
                exactCurrency = params.path[idx].intermediateCurrency;
                exactAmount = uint128(amount);
                idx++;
            }
        }
    }

    function _quoteExactOutputSingleReason(
        QuoteExactSingleParams memory params
    ) internal returns (bytes memory reason, uint256 gasEstimate) {
        IUniswapV3Pool pool = IUniswapV3Pool(params.poolKey.computeAddress(factory, poolInitCodeHash));
        if (address(pool).code.length == 0) {
            // Pool does not exist, revert early
            reason = abi.encodeWithSelector(PoolDoesNotExist.selector, address(pool));
            return (reason, 0);
        }

        bool zeroForOne = params.zeroForOne;
        uint256 gasBefore = gasleft();
        // limit priced param removed, we set it to the max/min sqrt ratio depending on the swap direction
        uint160 sqrtPriceLimitX96 = zeroForOne ? TickMath.MIN_SQRT_PRICE + 1 : TickMath.MAX_SQRT_PRICE - 1;
        try
            pool.swap(
                address(this), // address(0) might cause issues with some tokens
                zeroForOne,
                -int256(uint256(params.exactAmount)),
                sqrtPriceLimitX96,
                abi.encode(params.poolKey, false)
            )
        {} catch (bytes memory reasonCatch) {
            gasEstimate = gasBefore - gasleft();
            reason = reasonCatch;
        }
    }

    /// @inheritdoc IV3Quoter
    function quoteExactOutputSingle(
        QuoteExactSingleParams memory params
    ) public returns (uint256 amountIn, uint256 gasEstimate) {
        (bytes memory reason, uint256 gasEstimateCatch) = _quoteExactOutputSingleReason(params);
        gasEstimate = gasEstimateCatch;
        amountIn = reason.parseQuoteAmount();
    }

    /// @inheritdoc IV3Quoter
    function quoteExactOutput(QuoteExactParams memory params) external returns (uint256 amountIn, uint256 gasEstimate) {
        Currency exactCurrency = params.exactCurrency;
        uint128 exactAmount = params.exactAmount;

        uint256 idx = params.path.length - 1;
        while (true) {
            V3PoolKey memory poolKey = V3PoolKeyLibrary.getPoolKey(
                exactCurrency,
                params.path[idx].intermediateCurrency,
                params.path[idx].fee
            );

            QuoteExactSingleParams memory quoteParams = QuoteExactSingleParams({
                poolKey: poolKey,
                exactAmount: exactAmount,
                zeroForOne: exactCurrency == poolKey.currency0
            });
            (uint256 amount, uint256 gas) = quoteExactOutputSingle(quoteParams);
            gasEstimate += gas;

            if (idx == 0) {
                // last path element, return final amount
                return (amount, gasEstimate);
            } else {
                // update the exact currency and amount for the next iteration
                exactCurrency = params.path[idx].intermediateCurrency;
                exactAmount = uint128(amount);
                idx--;
            }
        }
    }
}
