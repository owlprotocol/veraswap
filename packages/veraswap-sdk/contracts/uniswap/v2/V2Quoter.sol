// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";

import {IV2Quoter} from "./IV2Quoter.sol";
import {V2PoolKey, V2PoolKeyLibrary} from "./V2PoolKey.sol";
import {V2QuoterBase} from "./V2QuoterBase.sol";

contract V2Quoter is IV2Quoter, V2QuoterBase {
    /// @param _v2Factory The address of the Uniswap V2 factory contract
    /// @param _v2PoolInitCodeHash The init code hash of the V2 pool
    constructor(address _v2Factory, bytes32 _v2PoolInitCodeHash) V2QuoterBase(_v2Factory, _v2PoolInitCodeHash) {}

    /// @inheritdoc IV2Quoter
    function quoteExactInputSingle(QuoteExactSingleParams memory params) external view returns (uint256 amountOut) {
        amountOut = _quoteExactInputSingle(params);
    }

    /// @inheritdoc IV2Quoter
    function quoteExactInput(QuoteExactParams memory params) external view returns (uint256 amountOut) {
        amountOut = _quoteExactInput(params);
    }

    /// @inheritdoc IV2Quoter
    function quoteExactOutputSingle(QuoteExactSingleParams memory params) public view returns (uint256 amountIn) {
        amountIn = _quoteExactOutputSingle(params);
    }

    /// @inheritdoc IV2Quoter
    function quoteExactOutput(QuoteExactParams memory params) external view returns (uint256 amountIn) {
        amountIn = _quoteExactOutput(params);
    }
}
