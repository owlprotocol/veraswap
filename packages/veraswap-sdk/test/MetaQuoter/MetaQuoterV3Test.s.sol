// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {MetaQuoterBaseTest} from "./MetaQuoterBaseTest.sol";

// Uniswap V4 Core
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
// Uniswap V4 Periphery
import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";
import {ActionConstants} from "@uniswap/v4-periphery/src/libraries/ActionConstants.sol";
import {IV4MetaQuoter} from "../../contracts/uniswap/IV4MetaQuoter.sol";
// Uniswap Universal Router
import {Commands} from "@uniswap/universal-router/contracts/libraries/Commands.sol";
// Pools
import {PoolUtils} from "../../script/utils/PoolUtils.sol";

contract MetaQuoterV3Test is MetaQuoterBaseTest {
    // A (exact) -> L3 (variable)
    function testExactInputSingle_A_L3() public {
        PoolUtils.createV3Pool(tokenA, liq3, v3Factory, v3PositionManager, 10 ether);

        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, liq3);
        // Quote
        IV4MetaQuoter.MetaQuoteExactSingleParams memory metaQuoteParams = IV4MetaQuoter.MetaQuoteExactSingleParams({
            exactCurrency: currencyIn,
            variableCurrency: currencyOut,
            exactAmount: amount,
            poolKeyOptions: getDefaultPoolKeyOptions()
        });
        IV4MetaQuoter.MetaQuoteExactSingleResult[] memory metaQuoteResults = metaQuoter.metaQuoteExactInputSingle(
            metaQuoteParams
        );
        assertEq(metaQuoteResults.length, 1); // 1 pool
        assertEq(address(metaQuoteResults[0].poolKey.hooks), address(3)); // V3 Pool

        IV4MetaQuoter.MetaQuoteExactSingleResult memory quote = metaQuoteResults[0];
        assertGt(quote.variableAmount, 0);
        // V3 Swap
        // Encode V3 Swap
        bytes memory path = abi.encodePacked(
            Currency.unwrap(currencyIn),
            quote.poolKey.fee,
            Currency.unwrap(currencyOut)
        );
        bytes memory v3Swap = abi.encode(
            ActionConstants.MSG_SENDER, // recipient
            amount,
            uint256(quote.variableAmount), // amountOutMinimum
            path,
            true // payerIsUser
        );
        // Encode Universal Router Commands
        bytes memory routerCommands = abi.encodePacked(uint8(Commands.V3_SWAP_EXACT_IN));
        bytes[] memory routerCommandInputs = new bytes[](1);
        routerCommandInputs[0] = v3Swap;
        // Execute Swap
        uint256 currencyInBalanceBeforeSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceBeforeSwap = currencyOut.balanceOf(msg.sender);
        uint256 deadline = block.timestamp + 20;
        router.execute(routerCommands, routerCommandInputs, deadline);
        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceAfterSwap = currencyOut.balanceOf(msg.sender);
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - metaQuoteParams.exactAmount); // Input balance decreased by exact amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + quote.variableAmount); // Output balance increased by variable amount
    }

    // A (variable) -> L3 (exact)
    function testExactOutputSingle_A_L3() public {
        PoolUtils.createV3Pool(tokenA, liq3, v3Factory, v3PositionManager, 10 ether);

        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, liq3);
        // Quote
        IV4MetaQuoter.MetaQuoteExactSingleParams memory metaQuoteParams = IV4MetaQuoter.MetaQuoteExactSingleParams({
            exactCurrency: currencyOut,
            variableCurrency: currencyIn,
            exactAmount: amount,
            poolKeyOptions: getDefaultPoolKeyOptions()
        });
        IV4MetaQuoter.MetaQuoteExactSingleResult[] memory metaQuoteResults = metaQuoter.metaQuoteExactOutputSingle(
            metaQuoteParams
        );
        assertEq(metaQuoteResults.length, 1); // 1 pool
        assertEq(address(metaQuoteResults[0].poolKey.hooks), address(3)); // V3 Pool

        IV4MetaQuoter.MetaQuoteExactSingleResult memory quote = metaQuoteResults[0];
        assertGt(quote.variableAmount, 0);
        // V3 Swap
        // Encode V3 Swap
        bytes memory path = abi.encodePacked(
            Currency.unwrap(currencyOut),
            quote.poolKey.fee,
            Currency.unwrap(currencyIn)
        );
        bytes memory v3Swap = abi.encode(
            ActionConstants.MSG_SENDER, // recipient
            amount,
            uint256(quote.variableAmount), // amountInMaximum
            path,
            true // payerIsUser
        );
        // Encode Universal Router Commands
        bytes memory routerCommands = abi.encodePacked(uint8(Commands.V3_SWAP_EXACT_OUT));
        bytes[] memory routerCommandInputs = new bytes[](1);
        routerCommandInputs[0] = v3Swap;
        // Execute Swap
        uint256 currencyInBalanceBeforeSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceBeforeSwap = currencyOut.balanceOf(msg.sender);
        uint256 deadline = block.timestamp + 20;
        router.execute(routerCommands, routerCommandInputs, deadline);
        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceAfterSwap = currencyOut.balanceOf(msg.sender);
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - quote.variableAmount); // Input balance decreased by variable amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + metaQuoteParams.exactAmount); // Output balance increased by exact amount
    }
}
