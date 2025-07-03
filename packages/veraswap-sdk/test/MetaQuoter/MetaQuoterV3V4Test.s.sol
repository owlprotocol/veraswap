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

contract MetaQuoterV3V4Test is MetaQuoterBaseTest {
    /***** V3 -> V4  *****/
    // A -> L4 -> B (ERC20-only)
    function test_V3V4_A_L4_B() public {
        PoolUtils.createV3Pool(tokenA, liq4, v3Factory, v3PositionManager, 10 ether);
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
        assertEq(address(quote.path[0].hooks), address(3)); // V3 Pool
        assertEq(address(quote.path[1].hooks), address(0)); // V4 Pool

        // V3 Swap
        // Encode V3 Swap
        bytes memory path = abi.encodePacked(
            Currency.unwrap(currencyIn),
            quote.path[0].fee,
            Currency.unwrap(quote.path[0].intermediateCurrency)
        );
        bytes memory v3Swap = abi.encode(
            ActionConstants.ADDRESS_THIS, // recipient
            amount,
            0, // amountOutMinimum ignored for intermediate swap
            path,
            true // payerIsUser
        );
        // V4 Swap
        // Encode V4 Swap Actions
        bytes memory v4Actions = abi.encodePacked(
            uint8(Actions.SETTLE),
            uint8(Actions.SWAP_EXACT_IN_SINGLE),
            uint8(Actions.TAKE_ALL)
        );
        bytes[] memory v4ActionParams = new bytes[](3);
        v4ActionParams[0] = abi.encode(quote.path[0].intermediateCurrency, ActionConstants.CONTRACT_BALANCE, false); // Open delta for intermediateCurrency

        (Currency v4Currency0, Currency v4Currency1) = quote.path[0].intermediateCurrency <
            quote.path[1].intermediateCurrency
            ? (quote.path[0].intermediateCurrency, quote.path[1].intermediateCurrency)
            : (quote.path[1].intermediateCurrency, quote.path[0].intermediateCurrency);
        v4ActionParams[1] = abi.encode(
            IV4Router.ExactInputSingleParams({
                poolKey: PoolKey({
                    currency0: v4Currency0,
                    currency1: v4Currency1,
                    fee: quote.path[1].fee,
                    tickSpacing: quote.path[1].tickSpacing,
                    hooks: quote.path[1].hooks
                }), // convert last path to PoolKey
                zeroForOne: v4Currency0 == quote.path[0].intermediateCurrency,
                amountIn: ActionConstants.OPEN_DELTA,
                amountOutMinimum: uint128(quote.variableAmount),
                hookData: quote.path[1].hookData
            })
        );
        v4ActionParams[2] = abi.encode(currencyOut, quote.variableAmount); // Take output
        // Encode Universal Router Commands
        bytes memory routerCommands = abi.encodePacked(uint8(Commands.V3_SWAP_EXACT_IN), uint8(Commands.V4_SWAP));
        bytes[] memory routerCommandInputs = new bytes[](2);
        routerCommandInputs[0] = v3Swap;
        routerCommandInputs[1] = abi.encode(v4Actions, v4ActionParams);
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
    // A -> B -> ETH (ETH-output)
    function test_V3V4_A_B_ETH() public {
        PoolUtils.createV3Pool(tokenA, tokenB, v3Factory, v3PositionManager, 10 ether);
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
        assertEq(address(quote.path[0].hooks), address(3)); // V3 Pool
        assertEq(address(quote.path[1].hooks), address(0)); // V4 Pool

        // V3 Swap
        // Encode V3 Swap
        bytes memory path = abi.encodePacked(
            Currency.unwrap(currencyIn),
            quote.path[0].fee,
            Currency.unwrap(quote.path[0].intermediateCurrency)
        );
        bytes memory v3Swap = abi.encode(
            ActionConstants.ADDRESS_THIS, // recipient
            amount,
            0, // amountOutMinimum ignored for intermediate swap
            path,
            true // payerIsUser
        );
        // V4 Swap
        // Encode V4 Swap Actions
        bytes memory v4Actions = abi.encodePacked(
            uint8(Actions.SETTLE),
            uint8(Actions.SWAP_EXACT_IN_SINGLE),
            uint8(Actions.TAKE_ALL)
        );
        bytes[] memory v4ActionParams = new bytes[](3);
        v4ActionParams[0] = abi.encode(quote.path[0].intermediateCurrency, ActionConstants.CONTRACT_BALANCE, false); // Open delta for intermediateCurrency

        (Currency v4Currency0, Currency v4Currency1) = quote.path[0].intermediateCurrency <
            quote.path[1].intermediateCurrency
            ? (quote.path[0].intermediateCurrency, quote.path[1].intermediateCurrency)
            : (quote.path[1].intermediateCurrency, quote.path[0].intermediateCurrency);
        v4ActionParams[1] = abi.encode(
            IV4Router.ExactInputSingleParams({
                poolKey: PoolKey({
                    currency0: v4Currency0,
                    currency1: v4Currency1,
                    fee: quote.path[1].fee,
                    tickSpacing: quote.path[1].tickSpacing,
                    hooks: quote.path[1].hooks
                }), // convert last path to PoolKey
                zeroForOne: v4Currency0 == quote.path[0].intermediateCurrency,
                amountIn: ActionConstants.OPEN_DELTA,
                amountOutMinimum: uint128(quote.variableAmount),
                hookData: quote.path[1].hookData
            })
        );
        v4ActionParams[2] = abi.encode(currencyOut, quote.variableAmount); // Take output
        // Encode Universal Router Commands
        bytes memory routerCommands = abi.encodePacked(uint8(Commands.V3_SWAP_EXACT_IN), uint8(Commands.V4_SWAP));
        bytes[] memory routerCommandInputs = new bytes[](2);
        routerCommandInputs[0] = v3Swap;
        routerCommandInputs[1] = abi.encode(v4Actions, v4ActionParams);
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

    // ETH/WETH (wrap) -> B -> A (ETH-input)
    function test_V3V4_ETH_B_A() public {
        PoolUtils.createV3Pool(weth9, tokenB, v3Factory, v3PositionManager, 10 ether);
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
        assertEq(address(quote.path[0].hooks), address(3)); // V3 Pool
        assertEq(address(quote.path[1].hooks), address(0)); // V4 Pool

        // V3 Swap
        // Encode V3 Swap
        bytes memory path = abi.encodePacked(
            Currency.unwrap(_mapCurrencyToWeth9(currencyIn)),
            quote.path[0].fee,
            Currency.unwrap(quote.path[0].intermediateCurrency)
        );
        bytes memory v3Swap = abi.encode(
            ActionConstants.ADDRESS_THIS, // recipient
            amount,
            0, // amountOutMinimum ignored for intermediate swap
            path,
            false // payerIsUser (wrap ETH to WETH)
        );
        // V4 Swap
        // Encode V4 Swap Actions
        bytes memory v4Actions = abi.encodePacked(
            uint8(Actions.SETTLE),
            uint8(Actions.SWAP_EXACT_IN_SINGLE),
            uint8(Actions.TAKE_ALL)
        );
        bytes[] memory v4ActionParams = new bytes[](3);
        v4ActionParams[0] = abi.encode(quote.path[0].intermediateCurrency, ActionConstants.CONTRACT_BALANCE, false); // Open delta for intermediateCurrency

        (Currency v4Currency0, Currency v4Currency1) = quote.path[0].intermediateCurrency <
            quote.path[1].intermediateCurrency
            ? (quote.path[0].intermediateCurrency, quote.path[1].intermediateCurrency)
            : (quote.path[1].intermediateCurrency, quote.path[0].intermediateCurrency);
        v4ActionParams[1] = abi.encode(
            IV4Router.ExactInputSingleParams({
                poolKey: PoolKey({
                    currency0: v4Currency0,
                    currency1: v4Currency1,
                    fee: quote.path[1].fee,
                    tickSpacing: quote.path[1].tickSpacing,
                    hooks: quote.path[1].hooks
                }), // convert last path to PoolKey
                zeroForOne: v4Currency0 == quote.path[0].intermediateCurrency,
                amountIn: ActionConstants.OPEN_DELTA,
                amountOutMinimum: uint128(quote.variableAmount),
                hookData: quote.path[1].hookData
            })
        );
        v4ActionParams[2] = abi.encode(currencyOut, quote.variableAmount); // Take output
        // Encode Universal Router Commands
        bytes memory routerCommands = abi.encodePacked(
            uint8(Commands.WRAP_ETH),
            uint8(Commands.V3_SWAP_EXACT_IN),
            uint8(Commands.V4_SWAP)
        );
        bytes[] memory routerCommandInputs = new bytes[](3);
        routerCommandInputs[0] = abi.encode(ActionConstants.ADDRESS_THIS, ActionConstants.CONTRACT_BALANCE); // Wrap ETH to WETH (input to v3 swap)
        routerCommandInputs[1] = v3Swap;
        routerCommandInputs[2] = abi.encode(v4Actions, v4ActionParams);
        // Execute Swap
        uint256 currencyInBalanceBeforeSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceBeforeSwap = currencyOut.balanceOf(msg.sender);
        uint256 deadline = block.timestamp + 20;
        router.execute{value: metaQuoteParams.exactAmount}(routerCommands, routerCommandInputs, deadline);
        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceAfterSwap = currencyOut.balanceOf(msg.sender);
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - metaQuoteParams.exactAmount); // Input balance decreased by exact amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + quote.variableAmount); // Output balance increased by variable amount
    }

    // A -> WETH/ETH (unwrap) -> B (ETH-intermediate)
    function test_V3V4_A_ETH_B() public {
        PoolUtils.createV3Pool(tokenA, weth9, v3Factory, v3PositionManager, 10 ether);
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
        assertEq(address(quote.path[0].hooks), address(3)); // V3 Pool
        assertEq(address(quote.path[1].hooks), address(0)); // V4 Pool

        // V3 Swap
        // Encode V3 Swap
        bytes memory path = abi.encodePacked(
            Currency.unwrap(currencyIn),
            quote.path[0].fee,
            Currency.unwrap(_mapCurrencyToWeth9(quote.path[0].intermediateCurrency))
        );
        bytes memory v3Swap = abi.encode(
            ActionConstants.ADDRESS_THIS, // recipient
            amount,
            0, // amountOutMinimum ignored for intermediate swap
            path,
            true // payerIsUser
        );
        // V4 Swap
        // Encode V4 Swap Actions
        bytes memory v4Actions = abi.encodePacked(
            uint8(Actions.SETTLE),
            uint8(Actions.SWAP_EXACT_IN_SINGLE),
            uint8(Actions.TAKE_ALL)
        );
        bytes[] memory v4ActionParams = new bytes[](3);
        v4ActionParams[0] = abi.encode(quote.path[0].intermediateCurrency, ActionConstants.CONTRACT_BALANCE, false); // Open delta for intermediateCurrency

        (Currency v4Currency0, Currency v4Currency1) = quote.path[0].intermediateCurrency <
            quote.path[1].intermediateCurrency
            ? (quote.path[0].intermediateCurrency, quote.path[1].intermediateCurrency)
            : (quote.path[1].intermediateCurrency, quote.path[0].intermediateCurrency);
        v4ActionParams[1] = abi.encode(
            IV4Router.ExactInputSingleParams({
                poolKey: PoolKey({
                    currency0: v4Currency0,
                    currency1: v4Currency1,
                    fee: quote.path[1].fee,
                    tickSpacing: quote.path[1].tickSpacing,
                    hooks: quote.path[1].hooks
                }), // convert last path to PoolKey
                zeroForOne: v4Currency0 == quote.path[0].intermediateCurrency,
                amountIn: ActionConstants.OPEN_DELTA,
                amountOutMinimum: uint128(quote.variableAmount),
                hookData: quote.path[1].hookData
            })
        );
        v4ActionParams[2] = abi.encode(currencyOut, quote.variableAmount); // Take output
        // Encode Universal Router Commands
        bytes memory routerCommands = abi.encodePacked(
            uint8(Commands.V3_SWAP_EXACT_IN),
            uint8(Commands.UNWRAP_WETH),
            uint8(Commands.V4_SWAP)
        );
        bytes[] memory routerCommandInputs = new bytes[](3);
        routerCommandInputs[0] = v3Swap;
        routerCommandInputs[1] = abi.encode(ActionConstants.ADDRESS_THIS, 0); // Unwrap WETH to ETH (input to v4 swap)
        routerCommandInputs[2] = abi.encode(v4Actions, v4ActionParams);
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

    /***** V4 -> V3  *****/
    // A -> L4 -> B (ERC20-only)
    function test_V4V3_A_L4_B() public {
        PoolUtils.createV4Pool(tokenA, liq4, v4PositionManager, 10 ether);
        PoolUtils.createV3Pool(liq4, tokenB, v3Factory, v3PositionManager, 10 ether);

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
        assertEq(address(quote.path[1].hooks), address(3)); // V3 Pool

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
        // V3 Swap
        // Encode V3 Swap
        bytes memory path = abi.encodePacked(
            Currency.unwrap(quote.path[0].intermediateCurrency),
            quote.path[1].fee,
            Currency.unwrap(quote.path[1].intermediateCurrency)
        );
        bytes memory v3Swap = abi.encode(
            ActionConstants.MSG_SENDER, // recipient
            ActionConstants.CONTRACT_BALANCE, // amountIn = contract balance
            quote.variableAmount, // amountOutMinimum
            path,
            false // payerIsUser
        );
        // Encode Universal Router Commands
        bytes memory routerCommands = abi.encodePacked(uint8(Commands.V4_SWAP), uint8(Commands.V3_SWAP_EXACT_IN));
        bytes[] memory routerCommandInputs = new bytes[](2);
        routerCommandInputs[0] = abi.encode(v4Actions, v4ActionParams);
        routerCommandInputs[1] = v3Swap;
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
    function test_V4V3_A_B_ETH() public {
        PoolUtils.createV4Pool(tokenA, tokenB, v4PositionManager, 10 ether);
        PoolUtils.createV3Pool(tokenB, weth9, v3Factory, v3PositionManager, 10 ether);

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
        assertEq(address(quote.path[1].hooks), address(3)); // V3 Pool

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
        // V3 Swap
        // Encode V3 Swap
        bytes memory path = abi.encodePacked(
            Currency.unwrap(quote.path[0].intermediateCurrency),
            quote.path[1].fee,
            Currency.unwrap(_mapCurrencyToWeth9(quote.path[1].intermediateCurrency))
        );
        bytes memory v3Swap = abi.encode(
            ActionConstants.ADDRESS_THIS, // recipient
            ActionConstants.CONTRACT_BALANCE, // amountIn = contract balance
            quote.variableAmount, // amountOutMinimum
            path,
            false // payerIsUser
        );
        // Encode Universal Router Commands
        bytes memory routerCommands = abi.encodePacked(
            uint8(Commands.V4_SWAP),
            uint8(Commands.V3_SWAP_EXACT_IN),
            uint8(Commands.UNWRAP_WETH)
        );
        bytes[] memory routerCommandInputs = new bytes[](3);
        routerCommandInputs[0] = abi.encode(v4Actions, v4ActionParams);
        routerCommandInputs[1] = v3Swap;
        routerCommandInputs[2] = abi.encode(ActionConstants.MSG_SENDER, quote.variableAmount); // Unwrap WETH to ETH (input to v3 swap)
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

    // ETH -> B -> A (ETH-input)
    function test_V4V3_ETH_B_A() public {
        PoolUtils.createV4Pool(eth, tokenB, v4PositionManager, 10 ether);
        PoolUtils.createV3Pool(tokenB, tokenA, v3Factory, v3PositionManager, 10 ether);

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
        assertEq(address(quote.path[1].hooks), address(3)); // V3 Pool

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
        );
        // Take output to router
        // V3 Swap
        // Encode V3 Swap
        bytes memory path = abi.encodePacked(
            Currency.unwrap(quote.path[0].intermediateCurrency),
            quote.path[1].fee,
            Currency.unwrap(quote.path[1].intermediateCurrency)
        );
        bytes memory v3Swap = abi.encode(
            ActionConstants.MSG_SENDER, // recipient
            ActionConstants.CONTRACT_BALANCE, // amountIn = contract balance
            quote.variableAmount, // amountOutMinimum
            path,
            false // payerIsUser
        );
        // Encode Universal Router Commands
        bytes memory routerCommands = abi.encodePacked(uint8(Commands.V4_SWAP), uint8(Commands.V3_SWAP_EXACT_IN));
        bytes[] memory routerCommandInputs = new bytes[](2);
        routerCommandInputs[0] = abi.encode(v4Actions, v4ActionParams);
        routerCommandInputs[1] = v3Swap;
        // Execute Swap
        uint256 currencyInBalanceBeforeSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceBeforeSwap = currencyOut.balanceOf(msg.sender);
        uint256 deadline = block.timestamp + 20;
        router.execute{value: metaQuoteParams.exactAmount}(routerCommands, routerCommandInputs, deadline);
        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceAfterSwap = currencyOut.balanceOf(msg.sender);
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - metaQuoteParams.exactAmount); // Input balance decreased by exact amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + quote.variableAmount); // Output balance increased by variable amount
    }

    // A -> ETH/WETH (wrap) -> B (ETH-intermediate)
    function test_V4V3_A_ETH_B() public {
        PoolUtils.createV4Pool(tokenA, eth, v4PositionManager, 10 ether);
        PoolUtils.createV3Pool(weth9, tokenB, v3Factory, v3PositionManager, 10 ether);

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
        assertEq(address(quote.path[1].hooks), address(3)); // V3 Pool

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
        // V3 Swap
        // Encode V3 Swap
        bytes memory path = abi.encodePacked(
            Currency.unwrap(_mapCurrencyToWeth9(quote.path[0].intermediateCurrency)),
            quote.path[1].fee,
            Currency.unwrap(quote.path[1].intermediateCurrency)
        );
        bytes memory v3Swap = abi.encode(
            ActionConstants.MSG_SENDER, // recipient
            ActionConstants.CONTRACT_BALANCE, // amountIn = contract balance
            quote.variableAmount, // amountOutMinimum
            path,
            false // payerIsUser
        );
        // Encode Universal Router Commands
        bytes memory routerCommands = abi.encodePacked(
            uint8(Commands.V4_SWAP),
            uint8(Commands.WRAP_ETH),
            uint8(Commands.V3_SWAP_EXACT_IN)
        );
        bytes[] memory routerCommandInputs = new bytes[](3);
        routerCommandInputs[0] = abi.encode(v4Actions, v4ActionParams);
        routerCommandInputs[1] = abi.encode(ActionConstants.ADDRESS_THIS, ActionConstants.CONTRACT_BALANCE); // Wrap ETH to WETH (input to v3 swap)
        routerCommandInputs[2] = v3Swap;
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
}
