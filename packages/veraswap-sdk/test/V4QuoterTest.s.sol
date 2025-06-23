// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import "forge-std/console2.sol";

// ERC20
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
// Permit2
import {Permit2Utils} from "../script/utils/Permit2Utils.sol";
// WETH9
import {WETH} from "solmate/src/tokens/WETH.sol";
import {WETHUtils} from "../script/utils/WETHUtils.sol";
// Uniswap V4 Core
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
// Uniswap V4 Periphery
import {IPositionManager} from "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import {IV4Quoter} from "@uniswap/v4-periphery/src/interfaces/IV4Quoter.sol";
import {IV4Router} from "@uniswap/v4-periphery/src/interfaces/IV4Router.sol";
import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";
import {ActionConstants} from "@uniswap/v4-periphery/src/libraries/ActionConstants.sol";
import {PathKey} from "@uniswap/v4-periphery/src/libraries/PathKey.sol";
// Uniswap Universal Router
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import {Commands} from "@uniswap/universal-router/contracts/libraries/Commands.sol";
// Liquidity Pools
import {LocalTokens, LocalTokensLibrary} from "../script/libraries/LocalTokens.sol";
import {LocalPoolsLibrary, LocalV4Pools} from "../script/libraries/LocalPools.sol";
import {ContractsUniswapLibrary} from "../script/libraries/ContractsUniswap.sol";
import {UniswapContracts} from "../script/Structs.sol";

contract V4QuoterTest is Test {
    using LocalTokensLibrary for LocalTokens;

    uint128 constant amount = 0.01 ether;

    // Liquid tokens
    // weth: Has V3 and V4 pools with all tokens
    // liq34: Has V3 and V4 pools with all tokens
    // liq3: Has V3 pools with all tokens
    // liq4: Has V4 pools with all tokens
    Currency internal constant eth = Currency.wrap(address(0));
    Currency internal weth9;
    Currency internal liq34;
    Currency internal liq3;
    Currency internal liq4;
    Currency internal tokenA;
    Currency internal tokenB;

    IV4Quoter internal v4Quoter;
    IUniversalRouter internal router;

    struct PoolKeyOptions {
        uint24 fee;
        int24 tickSpacing;
        IHooks hooks;
    }
    PoolKeyOptions internal poolKeyOptions;

    function setUp() public {
        // Global poolKey options
        poolKeyOptions = PoolKeyOptions({fee: 3000, tickSpacing: 60, hooks: IHooks(address(0))});
        // Sets proper address for Create2 & transaction sender
        vm.startBroadcast();
        // WETH9
        // Set weth9 code to Optimism pre-deploy for anvil local chains that don't have pre-deploy (used by Uniswap V3)
        (address _weth9, ) = WETHUtils.getOrEtch(WETHUtils.opStackPreDeploy);
        LocalTokens memory tokens = LocalTokensLibrary.deploy(_weth9);

        // Tokens
        weth9 = Currency.wrap(address(tokens.weth9));
        liq34 = Currency.wrap(address(tokens.liq34));
        liq3 = Currency.wrap(address(tokens.liq3));
        liq4 = Currency.wrap(address(tokens.liq4));
        tokenA = Currency.wrap(address(tokens.tokenA));
        tokenB = Currency.wrap(address(tokens.tokenB));

        UniswapContracts memory contracts = ContractsUniswapLibrary.deploy(_weth9);
        router = IUniversalRouter(contracts.universalRouter);
        v4Quoter = IV4Quoter(contracts.v4Quoter);
        tokens.permit2Approve(contracts.universalRouter);
        // Create V4 Pools
        LocalPoolsLibrary.deployV4Pools(IPositionManager(contracts.v4PositionManager), tokens);
    }

    // A (exact) -> ETH (variable)
    function testExactInputSingle() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, eth);
        // PoolKey
        (Currency currency0, Currency currency1) = currencyIn < currencyOut
            ? (currencyIn, currencyOut)
            : (currencyOut, currencyIn);
        PoolKey memory poolKey = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: poolKeyOptions.fee,
            tickSpacing: poolKeyOptions.tickSpacing,
            hooks: poolKeyOptions.hooks
        });

        // V4 Quote
        bool zeroForOne = currency0 == currencyIn;
        assertFalse(zeroForOne);
        IV4Quoter.QuoteExactSingleParams memory v4QuoteParams = IV4Quoter.QuoteExactSingleParams({
            poolKey: poolKey,
            zeroForOne: zeroForOne,
            exactAmount: amount,
            hookData: bytes("")
        });
        (uint256 amountOut, ) = v4Quoter.quoteExactInputSingle(v4QuoteParams);
        assertGt(amountOut, 0);
        // V4 Swap
        // Encode V4 Swap Actions
        bytes memory v4Actions = abi.encodePacked(
            uint8(Actions.SWAP_EXACT_IN_SINGLE),
            uint8(Actions.SETTLE_ALL),
            uint8(Actions.TAKE_ALL)
        );
        bytes[] memory v4ActionParams = new bytes[](3);
        v4ActionParams[0] = abi.encode(
            IV4Router.ExactInputSingleParams({
                poolKey: v4QuoteParams.poolKey,
                zeroForOne: v4QuoteParams.zeroForOne,
                amountIn: v4QuoteParams.exactAmount,
                amountOutMinimum: uint128(amountOut),
                hookData: v4QuoteParams.hookData
            })
        );
        v4ActionParams[1] = abi.encode(currencyIn, v4QuoteParams.exactAmount); // Settle input
        v4ActionParams[2] = abi.encode(currencyOut, amountOut); // Take output
        // Encode Universal Router Commands
        bytes memory routerCommands = abi.encodePacked(uint8(Commands.V4_SWAP));
        bytes[] memory routerCommandInputs = new bytes[](1);
        routerCommandInputs[0] = abi.encode(v4Actions, v4ActionParams);
        // Execute Swap
        uint256 currencyInBalanceBeforeSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceBeforeSwap = currencyOut.balanceOf(msg.sender);
        uint256 deadline = block.timestamp + 20;
        router.execute(routerCommands, routerCommandInputs, deadline);
        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceAfterSwap = currencyOut.balanceOf(msg.sender);
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - v4QuoteParams.exactAmount); // Input balance decreased by exact amount
        assertGt(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap); // Output balance increased (can't check amount due to gas cost)
    }

    // A (variable) -> ETH (exact)
    function testExactOutputSingle() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, eth);
        // PoolKey
        (Currency currency0, Currency currency1) = currencyIn < currencyOut
            ? (currencyIn, currencyOut)
            : (currencyOut, currencyIn);
        PoolKey memory poolKey = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: poolKeyOptions.fee,
            tickSpacing: poolKeyOptions.tickSpacing,
            hooks: poolKeyOptions.hooks
        });

        // V4 Quote
        bool zeroForOne = currency0 == currencyIn;
        assertFalse(zeroForOne);
        IV4Quoter.QuoteExactSingleParams memory v4QuoteParams = IV4Quoter.QuoteExactSingleParams({
            poolKey: poolKey,
            zeroForOne: zeroForOne,
            exactAmount: amount,
            hookData: bytes("")
        });
        (uint256 amountIn, ) = v4Quoter.quoteExactOutputSingle(v4QuoteParams);
        assertGt(amountIn, 0);
        // V4 Swap
        // Encode V4 Swap Actions
        bytes memory v4Actions = abi.encodePacked(
            uint8(Actions.SWAP_EXACT_OUT_SINGLE),
            uint8(Actions.SETTLE_ALL),
            uint8(Actions.TAKE_ALL)
        );
        bytes[] memory v4ActionParams = new bytes[](3);
        v4ActionParams[0] = abi.encode(
            IV4Router.ExactOutputSingleParams({
                poolKey: v4QuoteParams.poolKey,
                zeroForOne: v4QuoteParams.zeroForOne,
                amountOut: v4QuoteParams.exactAmount,
                amountInMaximum: uint128(amountIn),
                hookData: v4QuoteParams.hookData
            })
        );
        v4ActionParams[1] = abi.encode(currencyIn, amountIn); // Settle input
        v4ActionParams[2] = abi.encode(currencyOut, v4QuoteParams.exactAmount); // Take output
        // Encode Universal Router Commands
        bytes memory routerCommands = abi.encodePacked(uint8(Commands.V4_SWAP));
        bytes[] memory routerCommandInputs = new bytes[](1);
        routerCommandInputs[0] = abi.encode(v4Actions, v4ActionParams);
        // Execute Swap
        uint256 currencyInBalanceBeforeSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceBeforeSwap = currencyOut.balanceOf(msg.sender);
        uint256 deadline = block.timestamp + 20;
        router.execute(routerCommands, routerCommandInputs, deadline);
        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceAfterSwap = currencyOut.balanceOf(msg.sender);
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - amountIn); // Input balance decreased by quote amount
        assertGt(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap); // Output balance increased (can't check amount due to gas cost)
    }

    // A (exact) -> ETH -> B (variable)
    function testExactInput() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, tokenB);
        // V4 Quote
        PathKey[] memory path = new PathKey[](2);
        PathKey memory pathKeyIntermediate = PathKey({
            intermediateCurrency: eth,
            fee: poolKeyOptions.fee,
            tickSpacing: poolKeyOptions.tickSpacing,
            hooks: poolKeyOptions.hooks,
            hookData: ""
        });
        PathKey memory pathKeyOutput = PathKey({
            intermediateCurrency: currencyOut,
            fee: poolKeyOptions.fee,
            tickSpacing: poolKeyOptions.tickSpacing,
            hooks: poolKeyOptions.hooks,
            hookData: ""
        });
        path[0] = pathKeyIntermediate;
        path[1] = pathKeyOutput;

        IV4Quoter.QuoteExactParams memory v4QuoteParams = IV4Quoter.QuoteExactParams({
            exactCurrency: currencyIn,
            path: path,
            exactAmount: amount
        });
        (uint256 amountOut, ) = v4Quoter.quoteExactInput(v4QuoteParams);
        assertGt(amountOut, 0);
        // V4 Swap
        // Encode V4 Swap Actions
        bytes memory v4Actions = abi.encodePacked(
            uint8(Actions.SWAP_EXACT_IN),
            uint8(Actions.SETTLE_ALL),
            uint8(Actions.TAKE_ALL)
        );
        bytes[] memory v4ActionParams = new bytes[](3);
        v4ActionParams[0] = abi.encode(
            IV4Router.ExactInputParams({
                currencyIn: v4QuoteParams.exactCurrency,
                path: path,
                amountIn: v4QuoteParams.exactAmount,
                amountOutMinimum: uint128(amountOut)
            })
        ); // Swap
        v4ActionParams[1] = abi.encode(currencyIn, v4QuoteParams.exactAmount); // Settle input
        v4ActionParams[2] = abi.encode(currencyOut, amountOut); // Take output
        // Encode Universal Router Commands
        bytes memory routerCommands = abi.encodePacked(uint8(Commands.V4_SWAP));
        bytes[] memory routerCommandInputs = new bytes[](1);
        routerCommandInputs[0] = abi.encode(v4Actions, v4ActionParams);
        // Execute Swap
        uint256 currencyInBalanceBeforeSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceBeforeSwap = currencyOut.balanceOf(msg.sender);
        uint256 deadline = block.timestamp + 20;
        router.execute(routerCommands, routerCommandInputs, deadline);
        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceAfterSwap = currencyOut.balanceOf(msg.sender);
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - v4QuoteParams.exactAmount); // Input balance decreased by exact amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + amountOut); // Output balance increased by variable amount
    }

    // A (variable) -> ETH -> B (exact)
    function testExactOutput() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, tokenB);
        // V4 Quote
        PathKey[] memory path = new PathKey[](2);
        PathKey memory pathKeyInput = PathKey({
            intermediateCurrency: currencyIn,
            fee: poolKeyOptions.fee,
            tickSpacing: poolKeyOptions.tickSpacing,
            hooks: poolKeyOptions.hooks,
            hookData: ""
        });
        PathKey memory pathKeyIntermediate = PathKey({
            intermediateCurrency: eth,
            fee: poolKeyOptions.fee,
            tickSpacing: poolKeyOptions.tickSpacing,
            hooks: poolKeyOptions.hooks,
            hookData: ""
        });
        path[0] = pathKeyInput;
        path[1] = pathKeyIntermediate;

        IV4Quoter.QuoteExactParams memory v4QuoteParams = IV4Quoter.QuoteExactParams({
            exactCurrency: currencyOut,
            path: path,
            exactAmount: amount
        });
        (uint256 amountIn, ) = v4Quoter.quoteExactOutput(v4QuoteParams);
        assertGt(amountIn, 0);
        // V4 Swap
        // Encode V4 Swap Actions
        bytes memory v4Actions = abi.encodePacked(
            uint8(Actions.SWAP_EXACT_OUT),
            uint8(Actions.SETTLE_ALL),
            uint8(Actions.TAKE_ALL)
        );
        bytes[] memory v4ActionParams = new bytes[](3);
        v4ActionParams[0] = abi.encode(
            IV4Router.ExactOutputParams({
                currencyOut: v4QuoteParams.exactCurrency,
                path: path,
                amountOut: v4QuoteParams.exactAmount,
                amountInMaximum: uint128(amountIn)
            })
        ); // Swap
        v4ActionParams[1] = abi.encode(currencyIn, amountIn); // Settle input
        v4ActionParams[2] = abi.encode(currencyOut, v4QuoteParams.exactAmount); // Take output
        // Encode Universal Router Commands
        bytes memory routerCommands = abi.encodePacked(uint8(Commands.V4_SWAP));
        bytes[] memory routerCommandInputs = new bytes[](1);
        routerCommandInputs[0] = abi.encode(v4Actions, v4ActionParams);
        // Execute Swap
        uint256 currencyInBalanceBeforeSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceBeforeSwap = currencyOut.balanceOf(msg.sender);
        uint256 deadline = block.timestamp + 20;
        router.execute(routerCommands, routerCommandInputs, deadline);
        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceAfterSwap = currencyOut.balanceOf(msg.sender);
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - amountIn); // Input balance decreased by variable amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + v4QuoteParams.exactAmount); // Output balance increased by exact amount
    }
}
