// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {V3PoolKey} from "./V3PoolKey.sol";
import {V3PathKey} from "./V3PathKey.sol";

/// @title IV3Quoter
/// @notice Interface for the V3Quoter contract
interface IV3Quoter {
    struct QuoteExactSingleParams {
        V3PoolKey poolKey;
        bool zeroForOne;
        uint128 exactAmount;
    }

    struct QuoteExactParams {
        Currency exactCurrency;
        V3PathKey[] path;
        uint128 exactAmount;
    }

    /// @notice Returns the delta amounts for a given exact input swap of a single pool
    /// @param params The params for the quote, encoded as `QuoteExactSingleParams`
    /// poolKey The key for identifying a V3 pool
    /// zeroForOne If the swap is from currency0 to currency1
    /// exactAmount The desired input amount
    /// @return amountOut The output quote for the exactIn swap
    /// @return gasEstimate Estimated gas units used for the swap
    function quoteExactInputSingle(
        QuoteExactSingleParams memory params
    ) external returns (uint256 amountOut, uint256 gasEstimate);

    /// @notice Returns the delta amounts along the swap path for a given exact input swap
    /// @param params the params for the quote, encoded as 'QuoteExactParams'
    /// currencyIn The input currency of the swap
    /// path The path of the swap encoded as PathKeys that contains currency, and fee info
    /// exactAmount The desired input amount
    /// @return amountOut The output quote for the exactIn swap
    /// @return gasEstimate Estimated gas units used for the swap
    function quoteExactInput(QuoteExactParams memory params) external returns (uint256 amountOut, uint256 gasEstimate);

    /// @notice Returns the delta amounts for a given exact output swap of a single pool
    /// @param params The params for the quote, encoded as `QuoteExactSingleParams`
    /// poolKey The key for identifying a V3 pool
    /// zeroForOne If the swap is from currency0 to currency1
    /// exactAmount The desired output amount
    /// @return amountIn The input quote for the exactOut swap
    /// @return gasEstimate Estimated gas units used for the swap
    function quoteExactOutputSingle(
        QuoteExactSingleParams memory params
    ) external returns (uint256 amountIn, uint256 gasEstimate);

    /// @notice Returns the delta amounts along the swap path for a given exact output swap
    /// @param params the params for the quote, encoded as 'QuoteExactParams'
    /// currencyOut The output currency of the swap
    /// path The path of the swap encoded as PathKeys that contains currency, and fee info
    /// exactAmount The desired output amount
    /// @return amountIn The input quote for the exactOut swap
    /// @return gasEstimate Estimated gas units used for the swap
    function quoteExactOutput(QuoteExactParams memory params) external returns (uint256 amountIn, uint256 gasEstimate);
}
