// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";

import {QuoterRevert} from "@uniswap/v4-periphery/src/libraries/QuoterRevert.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";

import {V3CallbackValidation} from "./V3CallbackValidation.sol";
import {IV3Quoter} from "./IV3Quoter.sol";
import {V3PoolKey, V3PoolKeyLibrary} from "./V3PoolKey.sol";
import {V3QuoterBase} from "./V3QuoterBase.sol";

contract V3Quoter is IV3Quoter, V3QuoterBase {
    using QuoterRevert for *;

    /// @param _factory The address of the Uniswap V3 factory contract
    /// @param _poolInitCodeHash The init code hash of the V3 pool
    constructor(address _factory, bytes32 _poolInitCodeHash) V3QuoterBase(_factory, _poolInitCodeHash) {}

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
