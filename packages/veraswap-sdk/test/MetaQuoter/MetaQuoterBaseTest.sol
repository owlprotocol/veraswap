// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

// Uniswap V4 Core
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
// Uniswap V4 Periphery
import {IV4MetaQuoter} from "../../contracts/uniswap/IV4MetaQuoter.sol";
// Uniswap Base Test
import {UniswapBaseTest} from "../UniswapBaseTest.sol";

contract MetaQuoterBaseTest is UniswapBaseTest {
    uint128 constant amount = 0.01 ether;

    function setUp() public virtual override {
        super.setUp();
    }

    function getDefaultPoolKeyOptions()
        internal
        pure
        returns (IV4MetaQuoter.PoolKeyOptions[] memory defaultPoolKeyOptions)
    {
        defaultPoolKeyOptions = new IV4MetaQuoter.PoolKeyOptions[](4);
        defaultPoolKeyOptions[0] = IV4MetaQuoter.PoolKeyOptions({fee: 100, tickSpacing: 1, hooks: address(0)});
        defaultPoolKeyOptions[1] = IV4MetaQuoter.PoolKeyOptions({fee: 500, tickSpacing: 10, hooks: address(0)});
        defaultPoolKeyOptions[2] = IV4MetaQuoter.PoolKeyOptions({fee: 3_000, tickSpacing: 60, hooks: address(0)});
        defaultPoolKeyOptions[3] = IV4MetaQuoter.PoolKeyOptions({fee: 10_000, tickSpacing: 200, hooks: address(0)});
    }

    function _mapNativeToWeth(Currency currency) internal view returns (Currency) {
        // If the currency is native token, map it to WETH
        return currency.isAddressZero() ? weth9 : currency;
    }

    function _mapWethToNative(Currency currency) internal view returns (Currency) {
        // If the currency is weth token, map it to native token
        return currency == weth9 ? Currency.wrap(address(0)) : currency;
    }
}
