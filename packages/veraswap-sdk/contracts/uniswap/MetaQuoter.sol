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

// Base quoters
import {V3MetaQuoterBase} from "./v3/V3MetaQuoterBase.sol";
import {V4MetaQuoter} from "./V4MetaQuoter.sol";

import {IV3MetaQuoter} from "./v3/IV3MetaQuoter.sol";
import {IV4MetaQuoter} from "./IV4MetaQuoter.sol";

/// @title MetaQuoter
/// @notice Supports quoting and routing optimal trade using logic by getting balance delta across multiple routes for v3/v4 pools
/// @dev These functions are not marked view because they rely on calling non-view functions and reverting
/// to compute the result. They are also not gas efficient and should not be called on-chain.
contract MetaQuoter is IV4MetaQuoter, V3MetaQuoterBase, V4MetaQuoter {
    using QuoterRevert for *;
    using ParseBytes for bytes;

    /// @notice Used to map native token quotes (address(0)) to WETH9 for V3 quotes
    address public immutable weth9;

    /// @param _factory The address of the Uniswap V3 factory contract
    /// @param _poolInitCodeHash The init code hash of the V3 pool
    /// @param _poolManager The address of the Uniswap V4 pool manager contract
    constructor(
        address _factory,
        bytes32 _poolInitCodeHash,
        IPoolManager _poolManager,
        address _weth9
    ) V3MetaQuoterBase(_factory, _poolInitCodeHash) V4MetaQuoter(_poolManager) {
        weth9 = _weth9;
    }

    function _mapCurrencyToWeth9(Currency currency) internal view returns (Currency) {
        // If the currency is the native token, map it to WETH9
        return currency.isAddressZero() ? Currency.wrap(weth9) : currency;
    }

    function _metaQuoteExactInputSingle(
        MetaQuoteExactSingleParams memory params
    ) internal override returns (MetaQuoteExactSingleResult[] memory quotes) {
        // V4 Quotes
        MetaQuoteExactSingleResult[] memory v4Quotes = super._metaQuoteExactInputSingle(params);
        // V3 Quotes
        uint24[] memory v3FeeOptions = new uint24[](params.poolKeyOptions.length);
        for (uint256 i = 0; i < params.poolKeyOptions.length; i++) {
            v3FeeOptions[i] = params.poolKeyOptions[i].fee;
        }
        IV3MetaQuoter.MetaQuoteExactSingleParams memory v3Params = IV3MetaQuoter.MetaQuoteExactSingleParams({
            exactCurrency: _mapCurrencyToWeth9(params.exactCurrency),
            variableCurrency: _mapCurrencyToWeth9(params.variableCurrency),
            exactAmount: params.exactAmount,
            feeOptions: v3FeeOptions
        });
        IV3MetaQuoter.MetaQuoteExactSingleResult[] memory v3Quotes = _metaQuoteExactInputSingle(v3Params);

        // Combine results, set hook to address(3) for V3 quotes
        quotes = new MetaQuoteExactSingleResult[](v4Quotes.length + v3Quotes.length);
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
    }

    function _metaQuoteExactOutputSingle(
        MetaQuoteExactSingleParams memory params
    ) internal override returns (MetaQuoteExactSingleResult[] memory quotes) {
        // V4 Quotes
        MetaQuoteExactSingleResult[] memory v4Quotes = super._metaQuoteExactOutputSingle(params);
        // V3 Quotes
        uint24[] memory v3FeeOptions = new uint24[](params.poolKeyOptions.length);
        for (uint256 i = 0; i < params.poolKeyOptions.length; i++) {
            v3FeeOptions[i] = params.poolKeyOptions[i].fee;
        }
        IV3MetaQuoter.MetaQuoteExactSingleParams memory v3Params = IV3MetaQuoter.MetaQuoteExactSingleParams({
            exactCurrency: _mapCurrencyToWeth9(params.exactCurrency),
            variableCurrency: _mapCurrencyToWeth9(params.variableCurrency),
            exactAmount: params.exactAmount,
            feeOptions: v3FeeOptions
        });
        IV3MetaQuoter.MetaQuoteExactSingleResult[] memory v3Quotes = _metaQuoteExactOutputSingle(v3Params);

        // Combine results, set hook to address(3) for V3 quotes
        quotes = new MetaQuoteExactSingleResult[](v4Quotes.length + v3Quotes.length);
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
    }
}
