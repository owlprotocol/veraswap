// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

// Uniswap V4 Core
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
// Uniswap V4 Periphery
import {ActionConstants} from "@uniswap/v4-periphery/src/libraries/ActionConstants.sol";
import {PathKey} from "@uniswap/v4-periphery/src/libraries/PathKey.sol";
// Pools
import {PoolUtils} from "../script/utils/PoolUtils.sol";
import {CommandsBuilderLibrary} from "../contracts/uniswap/CommandsBuilder.sol";
// Base Test
import {UniswapBaseTest} from "./UniswapBaseTest.sol";

contract CommandsBuilderTest is UniswapBaseTest {
    uint128 constant amountIn = 0.01 ether;

    function setUp() public virtual override {
        super.setUp();
    }

    /***** V2 *****/
    // A -> B
    function test_V2_A_B() public {
        PoolUtils.createV2Pool(tokenA, tokenB, v2Factory, 10 ether);

        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, tokenB);
        PathKey[] memory path = new PathKey[](1);
        path[0] = PathKey({
            intermediateCurrency: currencyOut,
            fee: 3000,
            tickSpacing: 0,
            hooks: IHooks(address(2)),
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

    // A -> L2 -> B
    function test_V2_A_L2_B() public {
        PoolUtils.createV2Pool(tokenA, liq2, v2Factory, 10 ether);
        PoolUtils.createV2Pool(liq2, tokenB, v2Factory, 10 ether);

        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, tokenB);
        PathKey[] memory path = new PathKey[](2);
        path[0] = PathKey({
            intermediateCurrency: liq2,
            fee: 3000,
            tickSpacing: 0,
            hooks: IHooks(address(2)),
            hookData: ""
        });
        path[1] = PathKey({
            intermediateCurrency: currencyOut,
            fee: 3000,
            tickSpacing: 0,
            hooks: IHooks(address(2)),
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
