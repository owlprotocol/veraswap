// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IUniswapV2Pair} from "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";

import {IV2Quoter} from "./IV2Quoter.sol";
import {V2QuoterLibrary} from "./V2QuoterLibrary.sol";

abstract contract V2QuoterBase {
    /// @notice The address of the Uniswap V2 factory contract
    address public immutable factory;
    /// @notice The init code hash of the V2 pool
    bytes32 public immutable pairInitCodeHash;

    error PoolDoesNotExist(address pool);

    /// @param _factory The address of the Uniswap V2 factory contract
    /// @param _pairInitCodeHash The init code hash of the V2 pool
    constructor(address _factory, bytes32 _pairInitCodeHash) {
        factory = _factory;
        pairInitCodeHash = _pairInitCodeHash;
    }

    function _quoteExactInputSingle(
        IV2Quoter.QuoteExactSingleParams memory params
    ) internal view returns (uint256 amountOut) {
        address pair = params.poolKey.computeAddress(factory, pairInitCodeHash);
        if (pair.code.length == 0) {
            revert PoolDoesNotExist(pair);
        }

        (uint256 reserve0, uint256 reserve1, ) = IUniswapV2Pair(pair).getReserves();
        (uint256 reserveInput, uint256 reserveOutput) = params.zeroForOne ? (reserve0, reserve1) : (reserve1, reserve0);
        amountOut = V2QuoterLibrary.getAmountOut(params.exactAmount, reserveInput, reserveOutput);
    }

    function _quoteExactOutputSingle(
        IV2Quoter.QuoteExactSingleParams memory params
    ) internal view returns (uint256 amountIn) {
        address pair = params.poolKey.computeAddress(factory, pairInitCodeHash);
        if (pair.code.length == 0) {
            revert PoolDoesNotExist(pair);
        }

        (uint256 reserve0, uint256 reserve1, ) = IUniswapV2Pair(pair).getReserves();
        (uint256 reserveInput, uint256 reserveOutput) = params.zeroForOne ? (reserve0, reserve1) : (reserve1, reserve0);
        amountIn = V2QuoterLibrary.getAmountIn(params.exactAmount, reserveInput, reserveOutput);
    }
}
