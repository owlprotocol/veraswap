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
