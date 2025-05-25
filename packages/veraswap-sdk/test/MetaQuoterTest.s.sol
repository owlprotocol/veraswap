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
// Uniswap V3 Core
import {IUniswapV3Factory} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {UniswapV3Pool} from "@uniswap/v3-core/contracts/UniswapV3Pool.sol";
import {UniswapV3FactoryUtils} from "../script/utils/UniswapV3FactoryUtils.sol";
// Uniswap V3 Periphery
import {V3PositionManagerMock} from "../contracts/uniswap/v3/V3PositionManagerMock.sol";
import {V3PositionManagerMockUtils} from "../script/utils/V3PositionManagerMockUtils.sol";
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
import {MetaQuoterUtils} from "../script/utils/MetaQuoterUtils.sol";
// Uniswap Universal Router
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import {Commands} from "@uniswap/universal-router/contracts/libraries/Commands.sol";
import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {UnsupportedProtocolUtils} from "../script/utils/UnsupportedProtocolUtils.sol";
import {UniversalRouterUtils} from "../script/utils/UniversalRouterUtils.sol";
// Liquidity Pools
import {PoolUtils} from "../script/utils/PoolUtils.sol";

contract MetaQuoterTest is Test {
    bytes32 constant BYTES32_ZERO = bytes32(0);
    uint128 constant amount = 0.01 ether;

    // Tokens
    IERC20 internal tokenA;
    IERC20 internal tokenB;
    IERC20 internal tokenC;
    // Uniswap V3 Core
    IUniswapV3Factory internal v3Factory;
    // Uniswap V4 Core
    IPoolManager internal v4PoolManager;
    IPositionManager internal v4PositionManager;
    // Uniswap V4 Periphery
    IStateView internal v4StateView;
    IV4MetaQuoter internal metaQuoter;
    // Uniswap Universal Router
    IUniversalRouter internal router;

    function setUp() public {
        // Sets proper address for Create2 & transaction sender
        vm.startBroadcast();
        // Tokens
        (address _tokenA, ) = MockERC20Utils.getOrCreate2("Token A", "A", 18);
        (address _tokenB, ) = MockERC20Utils.getOrCreate2("Token B", "B", 18);
        (address _tokenC, ) = MockERC20Utils.getOrCreate2("Token C", "C", 18);
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
        tokenC = IERC20(_tokenC);
        // Mint tokens
        MockERC20(address(tokenA)).mint(msg.sender, 100_000 ether);
        MockERC20(address(tokenB)).mint(msg.sender, 100_000 ether);
        MockERC20(address(tokenC)).mint(msg.sender, 100_000 ether);
        // Permit2
        (address permit2, ) = Permit2Utils.getOrCreate2();
        // Approve Permit2
        tokenA.approve(permit2, type(uint256).max);
        tokenB.approve(permit2, type(uint256).max);
        tokenC.approve(permit2, type(uint256).max);

        //TODO: Add WETH9

        // Uniswap V3 Core
        bytes32 poolInitCodeHash = keccak256(abi.encodePacked(type(UniswapV3Pool).creationCode));
        (address _v3Factory, ) = UniswapV3FactoryUtils.getOrCreate2();
        v3Factory = IUniswapV3Factory(_v3Factory);
        (address _v3Posm, ) = V3PositionManagerMockUtils.getOrCreate2(address(v3Factory), poolInitCodeHash);
        V3PositionManagerMock v3Posm = V3PositionManagerMock(_v3Posm);

        // Uniswap V4 Core
        (address _v4PoolManager, ) = PoolManagerUtils.getOrCreate2(address(0));
        v4PoolManager = IPoolManager(_v4PoolManager);
        (address _v4PositionManager, ) = PositionManagerUtils.getOrCreate2(_v4PoolManager);
        v4PositionManager = IPositionManager(_v4PositionManager);

        // Uniswap V4 Periphery
        (address _v4StateView, ) = StateViewUtils.getOrCreate2(_v4PoolManager);
        v4StateView = IStateView(_v4StateView);
        (address _metaQuoter, ) = MetaQuoterUtils.getOrCreate2(address(v3Factory), poolInitCodeHash, _v4PoolManager);
        metaQuoter = IV4MetaQuoter(_metaQuoter);

        // Uniswap Universal Router
        (address unsupported, ) = UnsupportedProtocolUtils.getOrCreate2();
        RouterParameters memory routerParams = RouterParameters({
            permit2: permit2,
            weth9: 0x4200000000000000000000000000000000000006,
            v2Factory: unsupported,
            v3Factory: address(v3Factory),
            pairInitCodeHash: BYTES32_ZERO,
            poolInitCodeHash: poolInitCodeHash,
            v4PoolManager: address(v4PoolManager),
            v3NFTPositionManager: unsupported,
            v4PositionManager: address(v4PositionManager)
        });
        (address _router, ) = UniversalRouterUtils.getOrCreate2(routerParams);
        router = IUniversalRouter(_router);
        IAllowanceTransfer(permit2).approve(address(tokenA), address(router), type(uint160).max, type(uint48).max);
        IAllowanceTransfer(permit2).approve(address(tokenB), address(router), type(uint160).max, type(uint48).max);
        IAllowanceTransfer(permit2).approve(address(tokenC), address(router), type(uint160).max, type(uint48).max);

        // Create V4 Pools
        PoolUtils.createV4Pool(
            Currency.wrap(address(tokenA)),
            Currency.wrap(address(tokenB)),
            v4PositionManager,
            10 ether
        );
        PoolUtils.createV4Pool(
            Currency.wrap(address(tokenB)),
            Currency.wrap(address(tokenC)),
            v4PositionManager,
            10 ether
        );
        // Create V3 Pools
        PoolUtils.createV3Pool(
            Currency.wrap(address(tokenA)),
            Currency.wrap(address(tokenB)),
            v3Factory,
            v3Posm,
            10 ether
        );
        PoolUtils.createV3Pool(
            Currency.wrap(address(tokenB)),
            Currency.wrap(address(tokenC)),
            v3Factory,
            v3Posm,
            10 ether
        );
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

    // A (exact) -> B (variable)
    function testExactInputSingleAB() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (Currency.wrap(address(tokenA)), Currency.wrap(address(tokenB)));
        // V4 Quote
        IV4MetaQuoter.MetaQuoteExactSingleParams memory metaQuoteParams = IV4MetaQuoter.MetaQuoteExactSingleParams({
            exactCurrency: currencyIn,
            variableCurrency: currencyOut,
            exactAmount: amount,
            poolKeyOptions: getDefaultPoolKeyOptions()
        });
        IV4MetaQuoter.MetaQuoteExactSingleResult[] memory metaQuoteResults = metaQuoter.metaQuoteExactInputSingle(
            metaQuoteParams
        );
        assertEq(metaQuoteResults.length, 2); // 2 pools
        assertEq(address(metaQuoteResults[0].poolKey.hooks), address(0)); // V4 Pool
        assertEq(address(metaQuoteResults[1].poolKey.hooks), address(3)); // V3 Pool

        IV4MetaQuoter.MetaQuoteExactSingleResult memory quote = metaQuoteResults[0];
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
                amountIn: metaQuoteParams.exactAmount,
                amountOutMinimum: uint128(quote.variableAmount),
                hookData: quote.hookData
            })
        );
        v4ActionParams[1] = abi.encode(currencyIn, metaQuoteParams.exactAmount); // Settle input
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
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - metaQuoteParams.exactAmount); // Input balance decreased by exact amount
        assertGt(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap); // Output balance increased (can't check amount due to gas cost)
    }

    // A (variable) -> B (exact)
    function testExactOutputSingleAB() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (Currency.wrap(address(tokenA)), Currency.wrap(address(tokenB)));
        // V4 Quote
        IV4MetaQuoter.MetaQuoteExactSingleParams memory metaQuoteParams = IV4MetaQuoter.MetaQuoteExactSingleParams({
            exactCurrency: currencyOut,
            variableCurrency: currencyIn,
            exactAmount: amount,
            poolKeyOptions: getDefaultPoolKeyOptions()
        });
        IV4MetaQuoter.MetaQuoteExactSingleResult[] memory metaQuoteResults = metaQuoter.metaQuoteExactOutputSingle(
            metaQuoteParams
        );
        assertEq(metaQuoteResults.length, 2); // 2 pools
        assertEq(address(metaQuoteResults[0].poolKey.hooks), address(0)); // V4 Pool
        assertEq(address(metaQuoteResults[1].poolKey.hooks), address(3)); // V3 Pool

        IV4MetaQuoter.MetaQuoteExactSingleResult memory quote = metaQuoteResults[0];
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
                amountOut: metaQuoteParams.exactAmount,
                amountInMaximum: uint128(quote.variableAmount),
                hookData: quote.hookData
            })
        );
        v4ActionParams[1] = abi.encode(currencyIn, quote.variableAmount); // Settle input
        v4ActionParams[2] = abi.encode(currencyOut, metaQuoteParams.exactAmount); // Take output
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

    // A (exact) -> B -> C (variable)
    function testExactInputABC() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (Currency.wrap(address(tokenA)), Currency.wrap(address(tokenC)));
        // V4 Quote
        Currency[] memory hopCurrencies = new Currency[](1);
        hopCurrencies[0] = Currency.wrap(address(tokenB));
        IV4MetaQuoter.MetaQuoteExactParams memory metaQuoteParams = IV4MetaQuoter.MetaQuoteExactParams({
            exactCurrency: currencyIn,
            variableCurrency: currencyOut,
            hopCurrencies: hopCurrencies,
            exactAmount: amount,
            poolKeyOptions: getDefaultPoolKeyOptions()
        });
        IV4MetaQuoter.MetaQuoteExactResult[] memory metaQuoteResults = metaQuoter.metaQuoteExactInput(metaQuoteParams);
        assertEq(metaQuoteResults.length, 1); // Finds optimal A -> B -> C path

        IV4MetaQuoter.MetaQuoteExactResult memory quote = metaQuoteResults[0];
        assertGt(quote.variableAmount, 0);
        assertEq(address(quote.path[0].hooks), address(0)); // V4 Pool
        assertEq(address(quote.path[1].hooks), address(0)); // V4 Pool

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
                currencyIn: metaQuoteParams.exactCurrency,
                path: quote.path,
                amountIn: metaQuoteParams.exactAmount,
                amountOutMinimum: uint128(quote.variableAmount)
            })
        ); // Swap
        v4ActionParams[1] = abi.encode(currencyIn, metaQuoteParams.exactAmount); // Settle input
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
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - metaQuoteParams.exactAmount); // Input balance decreased by exact amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + quote.variableAmount); // Output balance increased by variable amount
    }

    // A (variable) -> B -> C (exact)
    function testExactOutputABC() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (Currency.wrap(address(tokenA)), Currency.wrap(address(tokenC)));
        // V4 Quote
        Currency[] memory hopCurrencies = new Currency[](1);
        hopCurrencies[0] = Currency.wrap(address(tokenB));
        IV4MetaQuoter.MetaQuoteExactParams memory metaQuoteParams = IV4MetaQuoter.MetaQuoteExactParams({
            exactCurrency: currencyOut,
            variableCurrency: currencyIn,
            hopCurrencies: hopCurrencies,
            exactAmount: amount,
            poolKeyOptions: getDefaultPoolKeyOptions()
        });
        IV4MetaQuoter.MetaQuoteExactResult[] memory metaQuoteResults = metaQuoter.metaQuoteExactOutput(metaQuoteParams);
        assertEq(metaQuoteResults.length, 1); // Finds optimal A -> B -> C path
        IV4MetaQuoter.MetaQuoteExactResult memory quote = metaQuoteResults[0];

        assertGt(quote.variableAmount, 0);
        assertEq(address(quote.path[0].hooks), address(0)); // V4 Pool
        assertEq(address(quote.path[1].hooks), address(0)); // V4 Pool

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
                currencyOut: metaQuoteParams.exactCurrency,
                path: quote.path,
                amountOut: metaQuoteParams.exactAmount,
                amountInMaximum: uint128(quote.variableAmount)
            })
        ); // Swap
        v4ActionParams[1] = abi.encode(currencyIn, quote.variableAmount); // Settle input
        v4ActionParams[2] = abi.encode(currencyOut, metaQuoteParams.exactAmount); // Take output
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
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + metaQuoteParams.exactAmount); // Output balance increased by exact amount
    }
}
