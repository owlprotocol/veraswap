// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import "forge-std/console2.sol";

// ERC20
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";
import {MockERC20Utils} from "../script/utils/MockERC20Utils.sol";
// Permit2
import {IAllowanceTransfer} from "permit2/src/interfaces/IAllowanceTransfer.sol";
import {Permit2Utils} from "../script/utils/Permit2Utils.sol";
// Uniswap V4 Core
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IPositionManager} from "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolManagerUtils} from "../script/utils/PoolManagerUtils.sol";
import {PositionManagerUtils} from "../script/utils/PositionManagerUtils.sol";
// Uniswap V4 Periphery
import {IStateView} from "@uniswap/v4-periphery/src/interfaces/IStateView.sol";
import {IV4Quoter} from "@uniswap/v4-periphery/src/interfaces/IV4Quoter.sol";
import {IV4Router} from "@uniswap/v4-periphery/src/interfaces/IV4Router.sol";
import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";
import {PathKey} from "@uniswap/v4-periphery/src/libraries/PathKey.sol";
import {StateViewUtils} from "../script/utils/StateViewUtils.sol";
import {V4QuoterUtils} from "../script/utils/V4QuoterUtils.sol";
// Uniswap Universal Router
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import {Commands} from "@uniswap/universal-router/contracts/libraries/Commands.sol";
import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {UnsupportedProtocolUtils} from "../script/utils/UnsupportedProtocolUtils.sol";
import {UniversalRouterUtils} from "../script/utils/UniversalRouterUtils.sol";
// Liquidity Pools
import {PoolUtils} from "../script/utils/PoolUtils.sol";

contract V4QuoterTest is Test {
    bytes32 constant BYTES32_ZERO = bytes32(0);
    uint128 constant amount = 0.01 ether;

    struct PoolKeyOptions {
        uint24 fee;
        int24 tickSpacing;
        IHooks hooks;
    }
    PoolKeyOptions internal poolKeyOptions;

    // Tokens
    IERC20 internal tokenA;
    IERC20 internal tokenB;
    // Uniswap V4 Core
    IPoolManager internal v4PoolManager;
    IPositionManager internal v4PositionManager;
    // Uniswap V4 Periphery
    IStateView internal v4StateView;
    IV4Quoter internal v4Quoter;
    // Uniswap Universal Router
    IUniversalRouter internal router;

    function setUp() public {
        // Global poolKey options
        poolKeyOptions = PoolKeyOptions({fee: 3000, tickSpacing: 60, hooks: IHooks(address(0))});
        // Sets proper address for Create2 & transaction sender
        vm.startBroadcast();
        // Tokens
        (address _tokenA, ) = MockERC20Utils.getOrCreate2("Token A", "A", 18);
        (address _tokenB, ) = MockERC20Utils.getOrCreate2("Token B", "B", 18);
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
        // Mint tokens
        MockERC20(address(tokenA)).mint(msg.sender, 100_000 ether);
        MockERC20(address(tokenB)).mint(msg.sender, 100_000 ether);
        // Permit2
        (address permit2, ) = Permit2Utils.getOrCreate2();
        // Approve Permit2
        tokenA.approve(permit2, type(uint256).max);
        tokenB.approve(permit2, type(uint256).max);

        // Uniswap V4 Core
        (address _v4PoolManager, ) = PoolManagerUtils.getOrCreate2(address(0));
        v4PoolManager = IPoolManager(_v4PoolManager);
        (address _v4PositionManager, ) = PositionManagerUtils.getOrCreate2(_v4PoolManager);
        v4PositionManager = IPositionManager(_v4PositionManager);

        // Uniswap V4 Periphery
        (address _v4StateView, ) = StateViewUtils.getOrCreate2(_v4PoolManager);
        v4StateView = IStateView(_v4StateView);
        (address _v4Quoter, ) = V4QuoterUtils.getOrCreate2(_v4PoolManager);
        v4Quoter = IV4Quoter(_v4Quoter);

        // Uniswap Universal Router
        (address unsupported, ) = UnsupportedProtocolUtils.getOrCreate2();
        RouterParameters memory routerParams = RouterParameters({
            permit2: permit2,
            weth9: 0x4200000000000000000000000000000000000006,
            v2Factory: unsupported,
            v3Factory: unsupported,
            pairInitCodeHash: BYTES32_ZERO,
            poolInitCodeHash: BYTES32_ZERO,
            v4PoolManager: address(v4PoolManager),
            v3NFTPositionManager: unsupported,
            v4PositionManager: address(v4PositionManager)
        });
        (address _router, ) = UniversalRouterUtils.getOrCreate2(routerParams);
        router = IUniversalRouter(_router);
        IAllowanceTransfer(permit2).approve(address(tokenA), address(router), type(uint160).max, type(uint48).max);
        IAllowanceTransfer(permit2).approve(address(tokenB), address(router), type(uint160).max, type(uint48).max);

        // Create V4 Pools
        PoolUtils.createV4Pool(Currency.wrap(address(tokenA)), Currency.wrap(address(0)), v4PositionManager, 10 ether);
        PoolUtils.createV4Pool(Currency.wrap(address(tokenB)), Currency.wrap(address(0)), v4PositionManager, 10 ether);
    }

    // A (exact) -> ETH (variable)
    function testExactInputSingle() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (Currency.wrap(address(tokenA)), Currency.wrap(address(0)));
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
        (Currency currencyIn, Currency currencyOut) = (Currency.wrap(address(tokenA)), Currency.wrap(address(0)));
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
        (Currency currencyIn, Currency currencyOut) = (Currency.wrap(address(tokenA)), Currency.wrap(address(tokenB)));
        // V4 Quote
        PathKey[] memory path = new PathKey[](2);
        PathKey memory pathKeyIntermediate = PathKey({
            intermediateCurrency: Currency.wrap(address(0)),
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
        (Currency currencyIn, Currency currencyOut) = (Currency.wrap(address(tokenA)), Currency.wrap(address(tokenB)));
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
            intermediateCurrency: Currency.wrap(address(0)),
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
