// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IUniswapV2Pair} from "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";

import {IV2Quoter} from "./IV2Quoter.sol";
import {V2QuoterLibrary} from "./V2QuoterLibrary.sol";
import {V2PoolKey, V2PoolKeyLibrary} from "./V2PoolKey.sol";

abstract contract V2QuoterBase {
    /// @notice The address of the Uniswap V2 factory contract
    address public immutable v2Factory;
    /// @notice The init code hash of the V2 pool
    bytes32 public immutable v2PoolInitCodeHash;

    error V2PoolDoesNotExist(address pool);

    /// @param _v2Factory The address of the Uniswap V2 v2Factory contract
    /// @param _v2PoolInitCodeHash The init code hash of the V2 pool
    constructor(address _v2Factory, bytes32 _v2PoolInitCodeHash) {
        v2Factory = _v2Factory;
        v2PoolInitCodeHash = _v2PoolInitCodeHash;
    }

    function _quoteExactInputSingle(
        IV2Quoter.QuoteExactSingleParams memory params
    ) internal view returns (uint256 amountOut) {
        address pair = params.poolKey.computeAddress(v2Factory, v2PoolInitCodeHash);
        if (pair.code.length == 0) {
            revert V2PoolDoesNotExist(pair);
        }

        (uint256 reserve0, uint256 reserve1, ) = IUniswapV2Pair(pair).getReserves();
        (uint256 reserveInput, uint256 reserveOutput) = params.zeroForOne ? (reserve0, reserve1) : (reserve1, reserve0);
        amountOut = V2QuoterLibrary.getAmountOut(params.exactAmount, reserveInput, reserveOutput);
    }

    function _quoteExactInput(IV2Quoter.QuoteExactParams memory params) internal view returns (uint256 amountOut) {
        Currency exactCurrency = params.exactCurrency;
        uint128 exactAmount = params.exactAmount;

        uint256 idx = 0;
        while (true) {
            V2PoolKey memory poolKey = V2PoolKeyLibrary.getPoolKey(exactCurrency, params.path[idx]);

            IV2Quoter.QuoteExactSingleParams memory quoteParams = IV2Quoter.QuoteExactSingleParams({
                poolKey: poolKey,
                exactAmount: exactAmount,
                zeroForOne: exactCurrency == poolKey.currency0
            });
            uint256 amount = _quoteExactInputSingle(quoteParams);

            if (idx == params.path.length - 1) {
                // last path element, return final amount
                return (amount);
            } else {
                // update the exact currency and amount for the next iteration
                exactCurrency = params.path[idx];
                exactAmount = uint128(amount);
                idx++;
            }
        }
    }

    function _quoteExactOutputSingle(
        IV2Quoter.QuoteExactSingleParams memory params
    ) internal view returns (uint256 amountIn) {
        address pair = params.poolKey.computeAddress(v2Factory, v2PoolInitCodeHash);
        if (pair.code.length == 0) {
            revert V2PoolDoesNotExist(pair);
        }

        (uint256 reserve0, uint256 reserve1, ) = IUniswapV2Pair(pair).getReserves();
        (uint256 reserveInput, uint256 reserveOutput) = params.zeroForOne ? (reserve0, reserve1) : (reserve1, reserve0);
        amountIn = V2QuoterLibrary.getAmountIn(params.exactAmount, reserveInput, reserveOutput);
    }

    function _quoteExactOutput(IV2Quoter.QuoteExactParams memory params) internal view returns (uint256 amountIn) {
        Currency exactCurrency = params.exactCurrency;
        uint128 exactAmount = params.exactAmount;

        uint256 idx = params.path.length - 1;
        while (true) {
            V2PoolKey memory poolKey = V2PoolKeyLibrary.getPoolKey(exactCurrency, params.path[idx]);

            IV2Quoter.QuoteExactSingleParams memory quoteParams = IV2Quoter.QuoteExactSingleParams({
                poolKey: poolKey,
                exactAmount: exactAmount,
                zeroForOne: exactCurrency == poolKey.currency0
            });
            uint256 amount = _quoteExactOutputSingle(quoteParams);

            if (idx == 0) {
                // last path element, return final amount
                return (amount);
            } else {
                // update the exact currency and amount for the next iteration
                exactCurrency = params.path[idx];
                exactAmount = uint128(amount);
                idx--;
            }
        }
    }
}
