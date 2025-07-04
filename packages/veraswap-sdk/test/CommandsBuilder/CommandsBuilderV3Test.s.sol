// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

// Uniswap V4 Core
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
// Uniswap V4 Periphery
import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";
import {ActionConstants} from "@uniswap/v4-periphery/src/libraries/ActionConstants.sol";
import {PathKey} from "@uniswap/v4-periphery/src/libraries/PathKey.sol";
// Uniswap Universal Router
import {Commands} from "@uniswap/universal-router/contracts/libraries/Commands.sol";
// Pools
import {PoolUtils} from "../../script/utils/PoolUtils.sol";
import {CommandsBuilderLibrary} from "../../contracts/uniswap/CommandsBuilder.sol";
// Base Test
import {UniswapBaseTest} from "../UniswapBaseTest.sol";

contract CommandsBuilderV3Test is UniswapBaseTest {
    uint128 constant amountIn = 0.01 ether;

    function setUp() public virtual override {
        super.setUp();
    }

    /***** V3 *****/
    // A -> B
    function test_V3_A_B() public {
        PoolUtils.createV3Pool(tokenA, tokenB, v3Factory, v3PositionManager, 10 ether);

        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, tokenB);
        PathKey[] memory path = new PathKey[](1);
        path[0] = PathKey({
            intermediateCurrency: currencyOut,
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(address(3)),
            hookData: ""
        });

        (bytes memory commands, bytes[] memory commandInputs) = CommandsBuilderLibrary.getSwapExactInCommands(
            weth9,
            currencyIn,
            currencyOut,
            path,
            amountIn,
            0, // amountOutMinimum
            ActionConstants.MSG_SENDER // recipient
        );
        assertEq(commands.length, 1);
        assertEq(commands[0], bytes1(uint8(Commands.V3_SWAP_EXACT_IN)));

        // Execute Swap
        uint256 currencyInBalanceBeforeSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceBeforeSwap = currencyOut.balanceOf(msg.sender);
        uint256 deadline = block.timestamp + 20;
        router.execute(commands, commandInputs, deadline);
        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceAfterSwap = currencyOut.balanceOf(msg.sender);
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - amountIn); // Input balance decreased by exact amount
        assertGt(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap); // Output balance increased
    }

    // A -> ETH
    function test_V3_A_ETH() public {
        PoolUtils.createV3Pool(tokenA, weth9, v3Factory, v3PositionManager, 10 ether);

        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, eth);
        PathKey[] memory path = new PathKey[](1);
        path[0] = PathKey({
            intermediateCurrency: weth9,
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(address(3)),
            hookData: ""
        });

        (bytes memory commands, bytes[] memory commandInputs) = CommandsBuilderLibrary.getSwapExactInCommands(
            weth9,
            currencyIn,
            currencyOut,
            path,
            amountIn,
            0, // amountOutMinimum
            ActionConstants.MSG_SENDER // recipient
        );
        assertEq(commands.length, 2);
        assertEq(commands[0], bytes1(uint8(Commands.V3_SWAP_EXACT_IN)));
        assertEq(commands[1], bytes1(uint8(Commands.UNWRAP_WETH)));

        // Execute Swap
        uint256 currencyInBalanceBeforeSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceBeforeSwap = currencyOut.balanceOf(msg.sender);
        uint256 deadline = block.timestamp + 20;
        router.execute(commands, commandInputs, deadline);
        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceAfterSwap = currencyOut.balanceOf(msg.sender);
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - amountIn); // Input balance decreased by exact amount
        assertGt(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap); // Output balance increased
    }

    // ETH -> A
    function test_V3_ETH_A() public {
        PoolUtils.createV3Pool(weth9, tokenA, v3Factory, v3PositionManager, 10 ether);

        // Currency
        (Currency currencyIn, Currency currencyOut) = (eth, tokenA);
        PathKey[] memory path = new PathKey[](1);
        path[0] = PathKey({
            intermediateCurrency: currencyOut,
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(address(3)),
            hookData: ""
        });

        (bytes memory commands, bytes[] memory commandInputs) = CommandsBuilderLibrary.getSwapExactInCommands(
            weth9,
            currencyIn,
            currencyOut,
            path,
            amountIn,
            0, // amountOutMinimum
            ActionConstants.MSG_SENDER // recipient
        );
        assertEq(commands.length, 2);
        assertEq(commands[0], bytes1(uint8(Commands.WRAP_ETH)));
        assertEq(commands[1], bytes1(uint8(Commands.V3_SWAP_EXACT_IN)));

        // Execute Swap
        uint256 currencyInBalanceBeforeSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceBeforeSwap = currencyOut.balanceOf(msg.sender);
        uint256 deadline = block.timestamp + 20;
        router.execute{value: amountIn}(commands, commandInputs, deadline);
        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceAfterSwap = currencyOut.balanceOf(msg.sender);
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - amountIn); // Input balance decreased by exact amount
        assertGt(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap); // Output balance increased
    }

    // A -> L3 -> B
    function test_V3_A_L3_B() public {
        PoolUtils.createV3Pool(tokenA, liq3, v3Factory, v3PositionManager, 10 ether);
        PoolUtils.createV3Pool(liq3, tokenB, v3Factory, v3PositionManager, 10 ether);

        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, tokenB);
        PathKey[] memory path = new PathKey[](2);
        path[0] = PathKey({
            intermediateCurrency: liq3,
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(address(3)),
            hookData: ""
        });
        path[1] = PathKey({
            intermediateCurrency: currencyOut,
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(address(3)),
            hookData: ""
        });

        (bytes memory commands, bytes[] memory commandInputs) = CommandsBuilderLibrary.getSwapExactInCommands(
            weth9,
            currencyIn,
            currencyOut,
            path,
            amountIn,
            0, // amountOutMinimum
            ActionConstants.MSG_SENDER // recipient
        );
        assertEq(commands.length, 1);
        assertEq(commands[0], bytes1(uint8(Commands.V3_SWAP_EXACT_IN)));

        // Execute Swap
        uint256 currencyInBalanceBeforeSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceBeforeSwap = currencyOut.balanceOf(msg.sender);
        uint256 deadline = block.timestamp + 20;
        router.execute(commands, commandInputs, deadline);
        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceAfterSwap = currencyOut.balanceOf(msg.sender);
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - amountIn); // Input balance decreased by exact amount
        assertGt(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap); // Output balance increased
    }
}
