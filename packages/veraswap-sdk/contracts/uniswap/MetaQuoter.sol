// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {StateLibrary} from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {ParseBytes} from "@uniswap/v4-core/src/libraries/ParseBytes.sol";

import {PathKey} from "@uniswap/v4-periphery/src/libraries/PathKey.sol";
import {QuoterRevert} from "@uniswap/v4-periphery/src/libraries/QuoterRevert.sol";
import {V2PoolKey} from "./v2/V2PoolKey.sol";

// Base quoters
import {V2QuoterBase} from "./v2/V2QuoterBase.sol";
import {V3MetaQuoterBase} from "./v3/V3MetaQuoterBase.sol";
import {V4MetaQuoter} from "./V4MetaQuoter.sol";

import {IV2Quoter} from "./v2/IV2Quoter.sol";
import {IV3MetaQuoter} from "./v3/IV3MetaQuoter.sol";
import {IV4MetaQuoter} from "./IV4MetaQuoter.sol";

/// @title MetaQuoter
/// @notice Supports quoting and routing optimal trade using logic by getting balance delta across multiple routes for v3/v4 pools
/// @dev These functions are not marked view because they rely on calling non-view functions and reverting
/// to compute the result. They are also not gas efficient and should not be called on-chain.
contract MetaQuoter is IV4MetaQuoter, V2QuoterBase, V3MetaQuoterBase, V4MetaQuoter {
    using QuoterRevert for *;
    using ParseBytes for bytes;

    /// @notice Used to map native token quotes (address(0)) to WETH9 for V3 quotes
    address public immutable weth9;

    /// @param _v2Factory The address of the Uniswap V2 factory contract
    /// @param _v2PoolInitCodeHash The init code hash of the V2 pool
    /// @param _v3Factory The address of the Uniswap V3 factory contract
    /// @param _v3PoolInitCodeHash The init code hash of the V3 pool
    /// @param _v4PoolManager The address of the Uniswap V4 pool manager contract
    /// @param _weth9 The address of the WETH9 contract
    constructor(
        address _v2Factory,
        bytes32 _v2PoolInitCodeHash,
        address _v3Factory,
        bytes32 _v3PoolInitCodeHash,
        IPoolManager _v4PoolManager,
        address _weth9
    )
        V2QuoterBase(_v2Factory, _v2PoolInitCodeHash)
        V3MetaQuoterBase(_v3Factory, _v3PoolInitCodeHash)
        V4MetaQuoter(_v4PoolManager)
    {
        weth9 = _weth9;
    }

    function _mapCurrencyToWeth9(Currency currency) internal view returns (Currency) {
        // If the currency is the native token, map it to WETH9
        return currency.isAddressZero() ? Currency.wrap(weth9) : currency;
    }

    function quoteV2ExactInputSingle(
        IV2Quoter.QuoteExactSingleParams memory params
    ) external view returns (uint256 amountOut) {
        amountOut = _quoteExactInputSingle(params);
    }

    function quoteV2ExactOutputSingle(
        IV2Quoter.QuoteExactSingleParams memory params
    ) public view returns (uint256 amountIn) {
        amountIn = _quoteExactOutputSingle(params);
    }

    function _metaQuoteExactInputSingle(
        MetaQuoteExactSingleParams memory params
    ) internal override returns (MetaQuoteExactSingleResult[] memory quotes) {
        // V4 Quotes
        MetaQuoteExactSingleResult[] memory v4Quotes;
        if (address(poolManager) != address(0)) {
            v4Quotes = super._metaQuoteExactInputSingle(params);
        } else {
            v4Quotes = new MetaQuoteExactSingleResult[](0); // No V4 quotes if v4PoolManager is not set
        }
        // V3 Quotes
        Currency exactCurrency = _mapCurrencyToWeth9(params.exactCurrency); // V2,V3 use WETH for native token
        Currency variableCurrency = _mapCurrencyToWeth9(params.variableCurrency); // V2,V3 use WETH for native token

        IV3MetaQuoter.MetaQuoteExactSingleResult[] memory v3Quotes;
        if (v3Factory != address(0)) {
            uint24[] memory v3FeeOptions = new uint24[](params.poolKeyOptions.length);
            for (uint256 i = 0; i < params.poolKeyOptions.length; i++) {
                v3FeeOptions[i] = params.poolKeyOptions[i].fee;
            }
            IV3MetaQuoter.MetaQuoteExactSingleParams memory v3Params = IV3MetaQuoter.MetaQuoteExactSingleParams({
                exactCurrency: exactCurrency,
                variableCurrency: variableCurrency,
                exactAmount: params.exactAmount,
                feeOptions: v3FeeOptions
            });
            v3Quotes = _metaQuoteExactInputSingle(v3Params);
        } else {
            v3Quotes = new IV3MetaQuoter.MetaQuoteExactSingleResult[](0); // No V3 quotes if v3Factory is not set
        }

        // V2 Quotes
        (Currency currency0, Currency currency1) = exactCurrency < variableCurrency
            ? (exactCurrency, variableCurrency)
            : (variableCurrency, exactCurrency);
        bool zeroForOne = exactCurrency == currency0;

        uint256 v2AmountOut;
        if (v2Factory != address(0)) {
            IV2Quoter.QuoteExactSingleParams memory quoteSingleParams = IV2Quoter.QuoteExactSingleParams({
                poolKey: V2PoolKey({currency0: currency0, currency1: currency1}),
                zeroForOne: zeroForOne,
                exactAmount: params.exactAmount
            });

            try this.quoteV2ExactInputSingle(quoteSingleParams) returns (uint256 amountOut) {
                v2AmountOut = amountOut; //singleSwapAmount is the output amount for single swap
            } catch {}
        }

        // Combine results, set hook to address(3) for V3 quotes, address(2) for V2 quotes
        uint256 quotesLen = v4Quotes.length + v3Quotes.length + (v2AmountOut > 0 ? 1 : 0);
        quotes = new MetaQuoteExactSingleResult[](quotesLen);
        for (uint256 i = 0; i < v4Quotes.length; i++) {
            quotes[i] = v4Quotes[i];
        }
        for (uint256 i = 0; i < v3Quotes.length; i++) {
            quotes[v4Quotes.length + i] = MetaQuoteExactSingleResult({
                poolKey: PoolKey({
                    currency0: v3Quotes[i].poolKey.currency0,
                    currency1: v3Quotes[i].poolKey.currency1,
                    fee: v3Quotes[i].poolKey.fee,
                    tickSpacing: 0, //ignored for V3
                    hooks: IHooks(address(3)) // Set to address(3) for V3 quotes
                }),
                zeroForOne: v3Quotes[i].zeroForOne,
                hookData: "",
                variableAmount: v3Quotes[i].variableAmount,
                gasEstimate: v3Quotes[i].gasEstimate
            });
        }
        if (v2AmountOut > 0) {
            quotes[v4Quotes.length + v3Quotes.length] = MetaQuoteExactSingleResult({
                poolKey: PoolKey({
                    currency0: currency0,
                    currency1: currency1,
                    fee: 3000, // V2 has fixed LP fee of 0.3%
                    tickSpacing: 0, //ignored for V2
                    hooks: IHooks(address(2)) // Set to address(2) for V2 quotes
                }),
                zeroForOne: zeroForOne,
                hookData: "",
                variableAmount: v2AmountOut,
                gasEstimate: 0 // Gas estimate is not available for V2 quotes
            });
        }
    }

    function _metaQuoteExactOutputSingle(
        MetaQuoteExactSingleParams memory params
    ) internal override returns (MetaQuoteExactSingleResult[] memory quotes) {
        // V4 Quotes
        MetaQuoteExactSingleResult[] memory v4Quotes;
        if (address(poolManager) != address(0)) {
            v4Quotes = super._metaQuoteExactOutputSingle(params);
        } else {
            v4Quotes = new MetaQuoteExactSingleResult[](0); // No V4 quotes if v4PoolManager is not set
        }
        // V3 Quotes
        Currency exactCurrency = _mapCurrencyToWeth9(params.exactCurrency); // V2,V3 use WETH for native token
        Currency variableCurrency = _mapCurrencyToWeth9(params.variableCurrency); // V2,V3 use WETH for native token

        IV3MetaQuoter.MetaQuoteExactSingleResult[] memory v3Quotes;
        if (v3Factory != address(0)) {
            uint24[] memory v3FeeOptions = new uint24[](params.poolKeyOptions.length);
            for (uint256 i = 0; i < params.poolKeyOptions.length; i++) {
                v3FeeOptions[i] = params.poolKeyOptions[i].fee;
            }
            IV3MetaQuoter.MetaQuoteExactSingleParams memory v3Params = IV3MetaQuoter.MetaQuoteExactSingleParams({
                exactCurrency: exactCurrency,
                variableCurrency: variableCurrency,
                exactAmount: params.exactAmount,
                feeOptions: v3FeeOptions
            });
            v3Quotes = _metaQuoteExactOutputSingle(v3Params);
        } else {
            v3Quotes = new IV3MetaQuoter.MetaQuoteExactSingleResult[](0); // No V3 quotes if v3Factory is not set
        }

        // V2 Quotes
        (Currency currency0, Currency currency1) = exactCurrency < variableCurrency
            ? (exactCurrency, variableCurrency)
            : (variableCurrency, exactCurrency);
        bool zeroForOne = exactCurrency == currency1;

        uint256 v2AmountIn;
        if (v2Factory != address(0)) {
            IV2Quoter.QuoteExactSingleParams memory quoteSingleParams = IV2Quoter.QuoteExactSingleParams({
                poolKey: V2PoolKey({currency0: currency0, currency1: currency1}),
                zeroForOne: zeroForOne,
                exactAmount: params.exactAmount
            });

            try this.quoteV2ExactOutputSingle(quoteSingleParams) returns (uint256 amountIn) {
                v2AmountIn = amountIn; //singleSwapAmount is the output amount for single swap
            } catch {}
        }

        // Combine results, set hook to address(3) for V3 quotes, address(2) for V2 quotes
        quotes = new MetaQuoteExactSingleResult[](v4Quotes.length + v3Quotes.length + (v2AmountIn > 0 ? 1 : 0));
        for (uint256 i = 0; i < v4Quotes.length; i++) {
            quotes[i] = v4Quotes[i];
        }
        for (uint256 i = 0; i < v3Quotes.length; i++) {
            quotes[v4Quotes.length + i] = MetaQuoteExactSingleResult({
                poolKey: PoolKey({
                    currency0: v3Quotes[i].poolKey.currency0,
                    currency1: v3Quotes[i].poolKey.currency1,
                    fee: v3Quotes[i].poolKey.fee,
                    tickSpacing: 0, //ignored for V3
                    hooks: IHooks(address(3)) // Set to address(3) for V3 quotes
                }),
                zeroForOne: v3Quotes[i].zeroForOne,
                hookData: "",
                variableAmount: v3Quotes[i].variableAmount,
                gasEstimate: v3Quotes[i].gasEstimate
            });
        }
        if (v2AmountIn > 0) {
            quotes[v4Quotes.length + v3Quotes.length] = MetaQuoteExactSingleResult({
                poolKey: PoolKey({
                    currency0: currency0,
                    currency1: currency1,
                    fee: 3000, // V2 has fixed LP fee of 0.3%
                    tickSpacing: 0, //ignored for V2
                    hooks: IHooks(address(2)) // Set to address(2) for V2 quotes
                }),
                zeroForOne: zeroForOne,
                hookData: "",
                variableAmount: v2AmountIn,
                gasEstimate: 0 // Gas estimate is not available for V2 quotes
            });
        }
    }
}
