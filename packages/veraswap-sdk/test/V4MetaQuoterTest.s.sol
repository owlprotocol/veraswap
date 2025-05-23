// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import "forge-std/console2.sol";

// ERC20
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {MockERC20Utils} from "../script/utils/MockERC20Utils.sol";
// Permit2
import {Permit2Utils} from "../script/utils/Permit2Utils.sol";
// Uniswap V4 Core
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IPositionManager} from "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {PoolManagerUtils} from "../script/utils/PoolManagerUtils.sol";
import {PositionManagerUtils} from "../script/utils/PositionManagerUtils.sol";
// Uniswap V4 Periphery
import {IStateView} from "@uniswap/v4-periphery/src/interfaces/IStateView.sol";
import {IV4MetaQuoter} from "../contracts/uniswap/IV4MetaQuoter.sol";
import {IV4Router} from "@uniswap/v4-periphery/src/interfaces/IV4Router.sol";
import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";
import {StateViewUtils} from "../script/utils/StateViewUtils.sol";
import {V4MetaQuoterUtils} from "../script/utils/V4MetaQuoterUtils.sol";
// Uniswap Universal Router
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import {Commands} from "@uniswap/universal-router/contracts/libraries/Commands.sol";
import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {UnsupportedProtocolUtils} from "../script/utils/UnsupportedProtocolUtils.sol";
import {UniversalRouterUtils} from "../script/utils/UniversalRouterUtils.sol";
// Liquidity Pools
import {PoolUtils} from "../script/utils/PoolUtils.sol";

contract V4MetaQuoterTest is Test {
    bytes32 constant BYTES32_ZERO = bytes32(0);
    uint128 constant amount = 0.01 ether;

    // Tokens
    IERC20 internal tokenA;
    IERC20 internal tokenB;
    // Uniswap V4 Core
    IPoolManager internal v4PoolManager;
    IPositionManager internal v4PositionManager;
    // Uniswap V4 Periphery
    IStateView internal v4StateView;
    IV4MetaQuoter internal v4MetaQuoter;
    // Uniswap Universal Router
    IUniversalRouter internal router;

    function setUp() public {
        // Sets proper address for Create2 & transaction sender
        vm.startBroadcast();
        // Tokens
        (address _tokenA, ) = MockERC20Utils.getOrCreate2("Token A", "A", 18);
        (address _tokenB, ) = MockERC20Utils.getOrCreate2("Token B", "B", 18);
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);

        // Permit2
        (address permit2, ) = Permit2Utils.getOrCreate2();

        // Uniswap V4 Core
        (address _v4PoolManager, ) = PoolManagerUtils.getOrCreate2(address(0));
        v4PoolManager = IPoolManager(_v4PoolManager);
        (address _v4PositionManager, ) = PositionManagerUtils.getOrCreate2(_v4PoolManager);
        v4PositionManager = IPositionManager(_v4PositionManager);

        // Uniswap V4 Periphery
        (address _v4StateView, ) = StateViewUtils.getOrCreate2(_v4PoolManager);
        v4StateView = IStateView(_v4StateView);
        (address _v4MetaQuoter, ) = V4MetaQuoterUtils.getOrCreate2(_v4PoolManager);
        v4MetaQuoter = IV4MetaQuoter(_v4MetaQuoter);

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

        // Setup Liquidity Pools
        PoolUtils.setupToken(tokenA, v4PositionManager, router);
        PoolUtils.setupToken(tokenB, v4PositionManager, router);
        PoolUtils.deployPool(address(tokenA), address(0), v4PositionManager, v4StateView);
        PoolUtils.deployPool(address(tokenB), address(0), v4PositionManager, v4StateView);
    }

    function getDefaultPoolKeyOptions()
        internal
        view
        returns (IV4MetaQuoter.PoolKeyOptions[] memory defaultPoolKeyOptions)
    {
        defaultPoolKeyOptions = new IV4MetaQuoter.PoolKeyOptions[](4);
        defaultPoolKeyOptions[0] = IV4MetaQuoter.PoolKeyOptions({fee: 100, tickSpacing: 1, hooks: address(0)});
        defaultPoolKeyOptions[1] = IV4MetaQuoter.PoolKeyOptions({fee: 500, tickSpacing: 10, hooks: address(0)});
        defaultPoolKeyOptions[2] = IV4MetaQuoter.PoolKeyOptions({fee: 3_000, tickSpacing: 60, hooks: address(0)});
        defaultPoolKeyOptions[3] = IV4MetaQuoter.PoolKeyOptions({fee: 10_000, tickSpacing: 200, hooks: address(0)});
    }

    // A (exact) -> ETH (variable)
    function testExactInputSingle() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (Currency.wrap(address(tokenA)), Currency.wrap(address(0)));
        // V4 Quote
        IV4MetaQuoter.MetaQuoteExactSingleParams memory v4MetaQuoteParams = IV4MetaQuoter.MetaQuoteExactSingleParams({
            exactCurrency: currencyIn,
            variableCurrency: currencyOut,
            exactAmount: amount,
            poolKeyOptions: getDefaultPoolKeyOptions()
        });
        IV4MetaQuoter.MetaQuoteExactSingleResult[] memory v4MetaQuoteResults = v4MetaQuoter.metaQuoteExactInputSingle(
            v4MetaQuoteParams
        );
        assertEq(v4MetaQuoteResults.length, 1); // Only active pool
        IV4MetaQuoter.MetaQuoteExactSingleResult memory quote = v4MetaQuoteResults[0];
        assertGt(quote.variableAmount, 0);
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
                poolKey: quote.poolKey,
                zeroForOne: quote.zeroForOne,
                amountIn: v4MetaQuoteParams.exactAmount,
                amountOutMinimum: uint128(quote.variableAmount),
                hookData: quote.hookData
            })
        );
        v4ActionParams[1] = abi.encode(currencyIn, v4MetaQuoteParams.exactAmount); // Settle input
        v4ActionParams[2] = abi.encode(currencyOut, quote.variableAmount); // Take output
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
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - v4MetaQuoteParams.exactAmount); // Input balance decreased by exact amount
        assertGt(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap); // Output balance increased (can't check amount due to gas cost)
    }

    // A (variable) -> ETH (exact)
    function testExactOutputSingle() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (Currency.wrap(address(tokenA)), Currency.wrap(address(0)));
        // V4 Quote
        IV4MetaQuoter.MetaQuoteExactSingleParams memory v4MetaQuoteParams = IV4MetaQuoter.MetaQuoteExactSingleParams({
            exactCurrency: currencyOut,
            variableCurrency: currencyIn,
            exactAmount: amount,
            poolKeyOptions: getDefaultPoolKeyOptions()
        });
        IV4MetaQuoter.MetaQuoteExactSingleResult[] memory v4MetaQuoteResults = v4MetaQuoter.metaQuoteExactOutputSingle(
            v4MetaQuoteParams
        );
        assertEq(v4MetaQuoteResults.length, 1); // Only active pool
        IV4MetaQuoter.MetaQuoteExactSingleResult memory quote = v4MetaQuoteResults[0];
        assertGt(quote.variableAmount, 0);
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
                poolKey: quote.poolKey,
                zeroForOne: quote.zeroForOne,
                amountOut: v4MetaQuoteParams.exactAmount,
                amountInMaximum: uint128(quote.variableAmount),
                hookData: quote.hookData
            })
        );
        v4ActionParams[1] = abi.encode(currencyIn, quote.variableAmount); // Settle input
        v4ActionParams[2] = abi.encode(currencyOut, v4MetaQuoteParams.exactAmount); // Take output
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
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - quote.variableAmount); // Input balance decreased by variable amount
        assertGt(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap); // Output balance increased (can't check amount due to gas cost)
    }

    // A (exact) -> ETH -> B (variable)
    function testExactInput() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (Currency.wrap(address(tokenA)), Currency.wrap(address(tokenB)));
        // V4 Quote
        Currency[] memory hopCurrencies = new Currency[](1);
        hopCurrencies[0] = Currency.wrap(address(0));
        IV4MetaQuoter.MetaQuoteExactParams memory v4MetaQuoteParams = IV4MetaQuoter.MetaQuoteExactParams({
            exactCurrency: currencyIn,
            variableCurrency: currencyOut,
            hopCurrencies: hopCurrencies,
            exactAmount: amount,
            poolKeyOptions: getDefaultPoolKeyOptions()
        });
        IV4MetaQuoter.MetaQuoteExactResult[] memory v4MetaQuoteResults = v4MetaQuoter.metaQuoteExactInput(
            v4MetaQuoteParams
        );
        assertEq(v4MetaQuoteResults.length, 1); // Only active pool
        IV4MetaQuoter.MetaQuoteExactResult memory quote = v4MetaQuoteResults[0];
        assertGt(quote.variableAmount, 0);
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
                currencyIn: v4MetaQuoteParams.exactCurrency,
                path: quote.path,
                amountIn: v4MetaQuoteParams.exactAmount,
                amountOutMinimum: uint128(quote.variableAmount)
            })
        ); // Swap
        v4ActionParams[1] = abi.encode(currencyIn, v4MetaQuoteParams.exactAmount); // Settle input
        v4ActionParams[2] = abi.encode(currencyOut, quote.variableAmount); // Take output
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
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - v4MetaQuoteParams.exactAmount); // Input balance decreased by exact amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + quote.variableAmount); // Output balance increased by variable amount
    }

    // A (variable) -> ETH -> B (exact)
    function testExactOutput() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (Currency.wrap(address(tokenA)), Currency.wrap(address(tokenB)));
        // V4 Quote
        Currency[] memory hopCurrencies = new Currency[](1);
        hopCurrencies[0] = Currency.wrap(address(0));
        IV4MetaQuoter.MetaQuoteExactParams memory v4MetaQuoteParams = IV4MetaQuoter.MetaQuoteExactParams({
            exactCurrency: currencyOut,
            variableCurrency: currencyIn,
            hopCurrencies: hopCurrencies,
            exactAmount: amount,
            poolKeyOptions: getDefaultPoolKeyOptions()
        });
        IV4MetaQuoter.MetaQuoteExactResult[] memory v4MetaQuoteResults = v4MetaQuoter.metaQuoteExactOutput(
            v4MetaQuoteParams
        );
        assertEq(v4MetaQuoteResults.length, 1); // Only active pool
        IV4MetaQuoter.MetaQuoteExactResult memory quote = v4MetaQuoteResults[0];
        assertGt(quote.variableAmount, 0);
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
                currencyOut: v4MetaQuoteParams.exactCurrency,
                path: quote.path,
                amountOut: v4MetaQuoteParams.exactAmount,
                amountInMaximum: uint128(quote.variableAmount)
            })
        ); // Swap
        v4ActionParams[1] = abi.encode(currencyIn, quote.variableAmount); // Settle input
        v4ActionParams[2] = abi.encode(currencyOut, v4MetaQuoteParams.exactAmount); // Take output
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
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - quote.variableAmount); // Input balance decreased by variable amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + v4MetaQuoteParams.exactAmount); // Output balance increased by exact amount
    }
}
