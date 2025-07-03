// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {MetaQuoterBaseTest} from "./MetaQuoterBaseTest.sol";

// WETH9
import {WETHUtils} from "../../script/utils/WETHUtils.sol";
// Uniswap V4 Core
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
// Uniswap V4 Periphery
import {IV4Router} from "@uniswap/v4-periphery/src/interfaces/IV4Router.sol";
import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";
import {ActionConstants} from "@uniswap/v4-periphery/src/libraries/ActionConstants.sol";
import {IV4MetaQuoter} from "../../contracts/uniswap/IV4MetaQuoter.sol";
// Uniswap Universal Router
import {Commands} from "@uniswap/universal-router/contracts/libraries/Commands.sol";
// Pools
import {PoolUtils} from "../../script/utils/PoolUtils.sol";
import {CommandsBuilderLibrary} from "../../contracts/uniswap/CommandsBuilder.sol";

contract MetaQuoterV2V4Test is MetaQuoterBaseTest {
    /***** V2 -> V4  *****/
    // A -> L4 -> B (ERC20-only)
    function test_V2V4_A_L4_B() public {
        PoolUtils.createV2Pool(tokenA, liq4, v2Factory, 10 ether);
        PoolUtils.createV4Pool(liq4, tokenB, v4PositionManager, 10 ether);

        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, tokenB);
        // Quote
        Currency[] memory hopCurrencies = new Currency[](1);
        hopCurrencies[0] = liq4;
        IV4MetaQuoter.MetaQuoteExactParams memory metaQuoteParams = IV4MetaQuoter.MetaQuoteExactParams({
            exactCurrency: currencyIn,
            variableCurrency: currencyOut,
            hopCurrencies: hopCurrencies,
            exactAmount: amount,
            poolKeyOptions: getDefaultPoolKeyOptions()
        });
        IV4MetaQuoter.MetaQuoteExactResult[] memory metaQuoteResults = metaQuoter.metaQuoteExactInput(metaQuoteParams);
        assertEq(metaQuoteResults.length, 1);

        IV4MetaQuoter.MetaQuoteExactResult memory quote = metaQuoteResults[0];
        assertGt(quote.variableAmount, 0);
        assertEq(address(quote.path[0].hooks), address(2)); // V2 Pool
        assertEq(address(quote.path[1].hooks), address(0)); // V4 Pool

        (bytes memory commands, bytes[] memory commandInputs) = CommandsBuilderLibrary.getSwapExactInCommands(
            weth9,
            currencyIn,
            currencyOut,
            quote.path,
            metaQuoteParams.exactAmount, // amountIn
            quote.variableAmount, // amountOutMinimum
            ActionConstants.MSG_SENDER // recipient
        );

        // Execute Swap
        uint256 currencyInBalanceBeforeSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceBeforeSwap = currencyOut.balanceOf(msg.sender);
        uint256 deadline = block.timestamp + 20;
        router.execute(commands, commandInputs, deadline);
        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceAfterSwap = currencyOut.balanceOf(msg.sender);
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - metaQuoteParams.exactAmount); // Input balance decreased by exact amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + quote.variableAmount); // Output balance increased by variable amount
    }
    // A -> B -> ETH (ETH-output)
    function test_V2V4_A_B_ETH() public {
        PoolUtils.createV2Pool(tokenA, tokenB, v2Factory, 10 ether);
        PoolUtils.createV4Pool(tokenB, eth, v4PositionManager, 10 ether);

        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, eth);
        // Quote
        Currency[] memory hopCurrencies = new Currency[](1);
        hopCurrencies[0] = tokenB;
        IV4MetaQuoter.MetaQuoteExactParams memory metaQuoteParams = IV4MetaQuoter.MetaQuoteExactParams({
            exactCurrency: currencyIn,
            variableCurrency: currencyOut,
            hopCurrencies: hopCurrencies,
            exactAmount: amount,
            poolKeyOptions: getDefaultPoolKeyOptions()
        });
        IV4MetaQuoter.MetaQuoteExactResult[] memory metaQuoteResults = metaQuoter.metaQuoteExactInput(metaQuoteParams);
        assertEq(metaQuoteResults.length, 1);

        IV4MetaQuoter.MetaQuoteExactResult memory quote = metaQuoteResults[0];
        assertGt(quote.variableAmount, 0);
        assertEq(address(quote.path[0].hooks), address(2)); // V2 Pool
        assertEq(address(quote.path[1].hooks), address(0)); // V4 Pool

        (bytes memory commands, bytes[] memory commandInputs) = CommandsBuilderLibrary.getSwapExactInCommands(
            weth9,
            currencyIn,
            currencyOut,
            quote.path,
            metaQuoteParams.exactAmount, // amountIn
            quote.variableAmount, // amountOutMinimum
            ActionConstants.MSG_SENDER // recipient
        );

        // Execute Swap
        uint256 currencyInBalanceBeforeSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceBeforeSwap = currencyOut.balanceOf(msg.sender);
        uint256 deadline = block.timestamp + 20;
        router.execute(commands, commandInputs, deadline);
        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceAfterSwap = currencyOut.balanceOf(msg.sender);
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - metaQuoteParams.exactAmount); // Input balance decreased by exact amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + quote.variableAmount); // Output balance increased by variable amount
    }

    // ETH/WETH (wrap) -> B -> A (ETH-input)
    function test_V2V4_ETH_B_A() public {
        PoolUtils.createV2Pool(weth9, tokenB, v2Factory, 10 ether);
        PoolUtils.createV4Pool(tokenB, tokenA, v4PositionManager, 10 ether);

        // Currency
        (Currency currencyIn, Currency currencyOut) = (eth, tokenA);
        // Quote
        Currency[] memory hopCurrencies = new Currency[](1);
        hopCurrencies[0] = tokenB;
        IV4MetaQuoter.MetaQuoteExactParams memory metaQuoteParams = IV4MetaQuoter.MetaQuoteExactParams({
            exactCurrency: currencyIn,
            variableCurrency: currencyOut,
            hopCurrencies: hopCurrencies,
            exactAmount: amount,
            poolKeyOptions: getDefaultPoolKeyOptions()
        });
        IV4MetaQuoter.MetaQuoteExactResult[] memory metaQuoteResults = metaQuoter.metaQuoteExactInput(metaQuoteParams);
        assertEq(metaQuoteResults.length, 1);

        IV4MetaQuoter.MetaQuoteExactResult memory quote = metaQuoteResults[0];
        assertGt(quote.variableAmount, 0);
        assertEq(address(quote.path[0].hooks), address(2)); // V2 Pool
        assertEq(address(quote.path[1].hooks), address(0)); // V4 Pool

        (bytes memory commands, bytes[] memory commandInputs) = CommandsBuilderLibrary.getSwapExactInCommands(
            weth9,
            currencyIn,
            currencyOut,
            quote.path,
            metaQuoteParams.exactAmount, // amountIn
            quote.variableAmount, // amountOutMinimum
            ActionConstants.MSG_SENDER // recipient
        );

        // Execute Swap
        uint256 currencyInBalanceBeforeSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceBeforeSwap = currencyOut.balanceOf(msg.sender);
        uint256 deadline = block.timestamp + 20;
        router.execute{value: metaQuoteParams.exactAmount}(commands, commandInputs, deadline);
        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceAfterSwap = currencyOut.balanceOf(msg.sender);
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - metaQuoteParams.exactAmount); // Input balance decreased by exact amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + quote.variableAmount); // Output balance increased by variable amount
    }

    // A -> WETH/ETH (unwrap) -> B (ETH-intermediate)
    function test_V2V4_A_ETH_B() public {
        PoolUtils.createV2Pool(tokenA, weth9, v2Factory, 10 ether);
        PoolUtils.createV4Pool(eth, tokenB, v4PositionManager, 10 ether);

        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, tokenB);
        // Quote
        Currency[] memory hopCurrencies = new Currency[](1);
        hopCurrencies[0] = eth;
        IV4MetaQuoter.MetaQuoteExactParams memory metaQuoteParams = IV4MetaQuoter.MetaQuoteExactParams({
            exactCurrency: currencyIn,
            variableCurrency: currencyOut,
            hopCurrencies: hopCurrencies,
            exactAmount: amount,
            poolKeyOptions: getDefaultPoolKeyOptions()
        });
        IV4MetaQuoter.MetaQuoteExactResult[] memory metaQuoteResults = metaQuoter.metaQuoteExactInput(metaQuoteParams);
        assertEq(metaQuoteResults.length, 1);

        IV4MetaQuoter.MetaQuoteExactResult memory quote = metaQuoteResults[0];
        assertGt(quote.variableAmount, 0);
        assertEq(address(quote.path[0].hooks), address(2)); // V2 Pool
        assertEq(address(quote.path[1].hooks), address(0)); // V4 Pool

        (bytes memory commands, bytes[] memory commandInputs) = CommandsBuilderLibrary.getSwapExactInCommands(
            weth9,
            currencyIn,
            currencyOut,
            quote.path,
            metaQuoteParams.exactAmount, // amountIn
            quote.variableAmount, // amountOutMinimum
            ActionConstants.MSG_SENDER // recipient
        );

        // Execute Swap
        uint256 currencyInBalanceBeforeSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceBeforeSwap = currencyOut.balanceOf(msg.sender);
        uint256 deadline = block.timestamp + 20;
        router.execute(commands, commandInputs, deadline);
        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceAfterSwap = currencyOut.balanceOf(msg.sender);
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - metaQuoteParams.exactAmount); // Input balance decreased by exact amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + quote.variableAmount); // Output balance increased by variable amount
    }

    /***** V4 -> V2  *****/
    // A -> L4 -> B (ERC20-only)
    function test_V4V2_A_L4_B() public {
        PoolUtils.createV4Pool(tokenA, liq4, v4PositionManager, 10 ether);
        PoolUtils.createV2Pool(liq4, tokenB, v2Factory, 10 ether);

        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, tokenB);
        // Quote
        Currency[] memory hopCurrencies = new Currency[](1);
        hopCurrencies[0] = liq4;
        IV4MetaQuoter.MetaQuoteExactParams memory metaQuoteParams = IV4MetaQuoter.MetaQuoteExactParams({
            exactCurrency: currencyIn,
            variableCurrency: currencyOut,
            hopCurrencies: hopCurrencies,
            exactAmount: amount,
            poolKeyOptions: getDefaultPoolKeyOptions()
        });
        IV4MetaQuoter.MetaQuoteExactResult[] memory metaQuoteResults = metaQuoter.metaQuoteExactInput(metaQuoteParams);
        assertEq(metaQuoteResults.length, 1);

        IV4MetaQuoter.MetaQuoteExactResult memory quote = metaQuoteResults[0];
        assertGt(quote.variableAmount, 0);
        assertEq(address(quote.path[0].hooks), address(0)); // V4 Pool
        assertEq(address(quote.path[1].hooks), address(2)); // V2 Pool

        // V4 Swap
        // Encode V4 Swap Actions
        bytes memory v4Actions = abi.encodePacked(
            uint8(Actions.SWAP_EXACT_IN_SINGLE),
            uint8(Actions.SETTLE_ALL),
            uint8(Actions.TAKE)
        );
        bytes[] memory v4ActionParams = new bytes[](3);
        (Currency v4Currency0, Currency v4Currency1) = currencyIn < quote.path[0].intermediateCurrency
            ? (currencyIn, quote.path[0].intermediateCurrency)
            : (quote.path[0].intermediateCurrency, currencyIn);

        v4ActionParams[0] = abi.encode(
            IV4Router.ExactInputSingleParams({
                poolKey: PoolKey({
                    currency0: v4Currency0,
                    currency1: v4Currency1,
                    fee: quote.path[0].fee,
                    tickSpacing: quote.path[0].tickSpacing,
                    hooks: quote.path[0].hooks
                }), // convert first path to PoolKey
                zeroForOne: v4Currency0 == currencyIn,
                amountIn: metaQuoteParams.exactAmount,
                amountOutMinimum: 0, // amountOutMinimum ignored for intermediate swap
                hookData: quote.path[0].hookData
            })
        );
        v4ActionParams[1] = abi.encode(currencyIn, metaQuoteParams.exactAmount); // Settle input
        v4ActionParams[2] = abi.encode(
            quote.path[0].intermediateCurrency,
            ActionConstants.ADDRESS_THIS,
            ActionConstants.OPEN_DELTA
        ); // Take output to router
        // V2 Swap
        // Encode V2 Swap
        Currency[] memory path = new Currency[](2);
        path[0] = quote.path[0].intermediateCurrency;
        path[1] = quote.path[1].intermediateCurrency;
        bytes memory v2Swap = abi.encode(
            ActionConstants.MSG_SENDER, // recipient
            ActionConstants.CONTRACT_BALANCE, // amountIn = contract balance
            quote.variableAmount, // amountOutMinimum
            path,
            false // payerIsUser
        );
        // Encode Universal Router Commands
        bytes memory routerCommands = abi.encodePacked(uint8(Commands.V4_SWAP), uint8(Commands.V2_SWAP_EXACT_IN));
        bytes[] memory routerCommandInputs = new bytes[](2);
        routerCommandInputs[0] = abi.encode(v4Actions, v4ActionParams);
        routerCommandInputs[1] = v2Swap;
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

    // A -> B -> WETH/ETH (unwrap) (ETH-output)
    function test_V4V2_A_B_ETH() public {
        PoolUtils.createV4Pool(tokenA, tokenB, v4PositionManager, 10 ether);
        PoolUtils.createV2Pool(tokenB, weth9, v2Factory, 10 ether);

        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, eth);
        // Quote
        Currency[] memory hopCurrencies = new Currency[](1);
        hopCurrencies[0] = tokenB;
        IV4MetaQuoter.MetaQuoteExactParams memory metaQuoteParams = IV4MetaQuoter.MetaQuoteExactParams({
            exactCurrency: currencyIn,
            variableCurrency: currencyOut,
            hopCurrencies: hopCurrencies,
            exactAmount: amount,
            poolKeyOptions: getDefaultPoolKeyOptions()
        });
        IV4MetaQuoter.MetaQuoteExactResult[] memory metaQuoteResults = metaQuoter.metaQuoteExactInput(metaQuoteParams);
        assertEq(metaQuoteResults.length, 1);

        IV4MetaQuoter.MetaQuoteExactResult memory quote = metaQuoteResults[0];
        assertGt(quote.variableAmount, 0);
        assertEq(address(quote.path[0].hooks), address(0)); // V4 Pool
        assertEq(address(quote.path[1].hooks), address(2)); // V2 Pool

        (bytes memory commands, bytes[] memory commandInputs) = CommandsBuilderLibrary.getSwapExactInCommands(
            weth9,
            currencyIn,
            currencyOut,
            quote.path,
            metaQuoteParams.exactAmount, // amountIn
            quote.variableAmount, // amountOutMinimum
            ActionConstants.MSG_SENDER // recipient
        );

        // Execute Swap
        uint256 currencyInBalanceBeforeSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceBeforeSwap = currencyOut.balanceOf(msg.sender);
        uint256 deadline = block.timestamp + 20;
        router.execute(commands, commandInputs, deadline);
        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceAfterSwap = currencyOut.balanceOf(msg.sender);
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - metaQuoteParams.exactAmount); // Input balance decreased by exact amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + quote.variableAmount); // Output balance increased by variable amount
    }

    // ETH -> B -> A (ETH-input)
    function test_V4V2_ETH_B_A() public {
        PoolUtils.createV4Pool(eth, tokenB, v4PositionManager, 10 ether);
        PoolUtils.createV2Pool(tokenB, tokenA, v2Factory, 10 ether);

        // Currency
        (Currency currencyIn, Currency currencyOut) = (eth, tokenA);
        // Quote
        Currency[] memory hopCurrencies = new Currency[](1);
        hopCurrencies[0] = tokenB;
        IV4MetaQuoter.MetaQuoteExactParams memory metaQuoteParams = IV4MetaQuoter.MetaQuoteExactParams({
            exactCurrency: currencyIn,
            variableCurrency: currencyOut,
            hopCurrencies: hopCurrencies,
            exactAmount: amount,
            poolKeyOptions: getDefaultPoolKeyOptions()
        });
        IV4MetaQuoter.MetaQuoteExactResult[] memory metaQuoteResults = metaQuoter.metaQuoteExactInput(metaQuoteParams);
        assertEq(metaQuoteResults.length, 1);

        IV4MetaQuoter.MetaQuoteExactResult memory quote = metaQuoteResults[0];
        assertGt(quote.variableAmount, 0);
        assertEq(address(quote.path[0].hooks), address(0)); // V4 Pool
        assertEq(address(quote.path[1].hooks), address(2)); // V2 Pool

        (bytes memory commands, bytes[] memory commandInputs) = CommandsBuilderLibrary.getSwapExactInCommands(
            weth9,
            currencyIn,
            currencyOut,
            quote.path,
            metaQuoteParams.exactAmount, // amountIn
            quote.variableAmount, // amountOutMinimum
            ActionConstants.MSG_SENDER // recipient
        );

        // Execute Swap
        uint256 currencyInBalanceBeforeSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceBeforeSwap = currencyOut.balanceOf(msg.sender);
        uint256 deadline = block.timestamp + 20;
        router.execute{value: metaQuoteParams.exactAmount}(commands, commandInputs, deadline);
        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceAfterSwap = currencyOut.balanceOf(msg.sender);
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - metaQuoteParams.exactAmount); // Input balance decreased by exact amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + quote.variableAmount); // Output balance increased by variable amount
    }

    // A -> ETH/WETH (wrap) -> B (ETH-intermediate)
    function test_V4V2_A_ETH_B() public {
        PoolUtils.createV4Pool(tokenA, eth, v4PositionManager, 10 ether);
        PoolUtils.createV2Pool(weth9, tokenB, v2Factory, 10 ether);

        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, tokenB);
        // Quote
        Currency[] memory hopCurrencies = new Currency[](1);
        hopCurrencies[0] = eth;
        IV4MetaQuoter.MetaQuoteExactParams memory metaQuoteParams = IV4MetaQuoter.MetaQuoteExactParams({
            exactCurrency: currencyIn,
            variableCurrency: currencyOut,
            hopCurrencies: hopCurrencies,
            exactAmount: amount,
            poolKeyOptions: getDefaultPoolKeyOptions()
        });
        IV4MetaQuoter.MetaQuoteExactResult[] memory metaQuoteResults = metaQuoter.metaQuoteExactInput(metaQuoteParams);
        assertEq(metaQuoteResults.length, 1);

        IV4MetaQuoter.MetaQuoteExactResult memory quote = metaQuoteResults[0];
        assertGt(quote.variableAmount, 0);
        assertEq(address(quote.path[0].hooks), address(0)); // V4 Pool
        assertEq(address(quote.path[1].hooks), address(2)); // V2 Pool

        (bytes memory commands, bytes[] memory commandInputs) = CommandsBuilderLibrary.getSwapExactInCommands(
            weth9,
            currencyIn,
            currencyOut,
            quote.path,
            metaQuoteParams.exactAmount, // amountIn
            quote.variableAmount, // amountOutMinimum
            ActionConstants.MSG_SENDER // recipient
        );

        // Execute Swap
        uint256 currencyInBalanceBeforeSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceBeforeSwap = currencyOut.balanceOf(msg.sender);
        uint256 deadline = block.timestamp + 20;
        router.execute(commands, commandInputs, deadline);
        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceAfterSwap = currencyOut.balanceOf(msg.sender);
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - metaQuoteParams.exactAmount); // Input balance decreased by exact amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + quote.variableAmount); // Output balance increased by variable amount
    }
}
