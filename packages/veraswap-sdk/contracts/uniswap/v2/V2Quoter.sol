// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";

import {IV2Quoter} from "./IV2Quoter.sol";
import {V2PoolKey, V2PoolKeyLibrary} from "./V2PoolKey.sol";
import {V2QuoterBase} from "./V2QuoterBase.sol";

contract V2Quoter is IV2Quoter, V2QuoterBase {
    /// @param _factory The address of the Uniswap V2 factory contract
    /// @param _pairInitCodeHash The init code hash of the V2 pool
    constructor(address _factory, bytes32 _pairInitCodeHash) V2QuoterBase(_factory, _pairInitCodeHash) {}

    /// @inheritdoc IV2Quoter
    function quoteExactInputSingle(QuoteExactSingleParams memory params) external view returns (uint256 amountOut) {
        amountOut = _quoteExactInputSingle(params);
    }

    /// @inheritdoc IV2Quoter
    function quoteExactInput(QuoteExactParams memory params) external view returns (uint256 amountOut) {
        Currency exactCurrency = params.exactCurrency;
        uint128 exactAmount = params.exactAmount;

        uint256 idx = 0;
        while (true) {
            V2PoolKey memory poolKey = V2PoolKeyLibrary.getPoolKey(exactCurrency, params.path[idx]);

            QuoteExactSingleParams memory quoteParams = QuoteExactSingleParams({
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

    /// @inheritdoc IV2Quoter
    function quoteExactOutputSingle(QuoteExactSingleParams memory params) public view returns (uint256 amountIn) {
        amountIn = _quoteExactOutputSingle(params);
    }

    /// @inheritdoc IV2Quoter
    function quoteExactOutput(QuoteExactParams memory params) external view returns (uint256 amountIn) {
        Currency exactCurrency = params.exactCurrency;
        uint128 exactAmount = params.exactAmount;

        uint256 idx = params.path.length - 1;
        while (true) {
            V2PoolKey memory poolKey = V2PoolKeyLibrary.getPoolKey(exactCurrency, params.path[idx]);

            QuoteExactSingleParams memory quoteParams = QuoteExactSingleParams({
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
