// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {IUniswapV3SwapCallback} from "@uniswap/v3-core/contracts/interfaces/callback/IUniswapV3SwapCallback.sol";

import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {QuoterRevert} from "@uniswap/v4-periphery/src/libraries/QuoterRevert.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";

import {V3CallbackValidation} from "./V3CallbackValidation.sol";
import {V3PoolKey} from "./V3PoolKey.sol";
import {V3PathKey} from "./V3PathKey.sol";
import {IV3Quoter} from "./IV3Quoter.sol";

abstract contract V3QuoterBase is IUniswapV3SwapCallback {
    using QuoterRevert for *;

    /// @notice The address of the Uniswap V3 factory contract
    address public immutable v3Factory;
    /// @notice The init code hash of the V3 pool
    bytes32 public immutable v3PoolInitCodeHash;

    error PoolDoesNotExist(address pool);

    /// @param _v3Factory The address of the Uniswap V3 factory contract
    /// @param _v3PoolInitCodeHash The init code hash of the V3 pool
    constructor(address _v3Factory, bytes32 _v3PoolInitCodeHash) {
        v3Factory = _v3Factory;
        v3PoolInitCodeHash = _v3PoolInitCodeHash;
    }

    /// @inheritdoc IUniswapV3SwapCallback
    function uniswapV3SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata data
    ) external view override {
        require(amount0Delta > 0 || amount1Delta > 0); // swaps entirely within 0-liquidity regions are not supported
        (V3PoolKey memory poolKey, bool isExactInput) = abi.decode(data, (V3PoolKey, bool));
        V3CallbackValidation.verifyCallback(poolKey, v3Factory, v3PoolInitCodeHash);

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
        IV3Quoter.QuoteExactSingleParams memory params
    ) internal returns (bytes memory reason, uint256 gasEstimate) {
        IUniswapV3Pool pool = IUniswapV3Pool(params.poolKey.computeAddress(v3Factory, v3PoolInitCodeHash));
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

    function _quoteExactOutputSingleReason(
        IV3Quoter.QuoteExactSingleParams memory params
    ) internal returns (bytes memory reason, uint256 gasEstimate) {
        IUniswapV3Pool pool = IUniswapV3Pool(params.poolKey.computeAddress(v3Factory, v3PoolInitCodeHash));
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
}
