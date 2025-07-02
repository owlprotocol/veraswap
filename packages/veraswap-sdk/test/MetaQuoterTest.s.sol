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
// Uniswap V2 Core
import {IUniswapV2Factory} from "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
// Uniswap V3 Core
import {IUniswapV3Factory} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import {V3PositionManagerMock} from "../contracts/uniswap/v3/V3PositionManagerMock.sol";
// Uniswap V4 Core
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
// Uniswap V4 Periphery
import {IPositionManager} from "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import {IV4MetaQuoter} from "../contracts/uniswap/IV4MetaQuoter.sol";
import {IV4Router} from "@uniswap/v4-periphery/src/interfaces/IV4Router.sol";
import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";
import {ActionConstants} from "@uniswap/v4-periphery/src/libraries/ActionConstants.sol";
// Uniswap Universal Router
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import {Commands} from "@uniswap/universal-router/contracts/libraries/Commands.sol";
// Liquidity Pools
import {LocalTokens, LocalTokensLibrary} from "../script/libraries/LocalTokens.sol";
import {LocalPoolsLibrary, LocalV4Pools} from "../script/libraries/LocalPools.sol";
import {ContractsUniswapLibrary} from "../script/libraries/ContractsUniswap.sol";
import {UniswapContracts} from "../script/Structs.sol";

// V3/V4 paths
// A -> liq34/ETH
// A -> liq34/ETH -> B

// V3-only paths
// A -> liq3
// A -> liq3 -> B

// V4-only paths
// A -> liq4
// A -> liq4 -> B

// Mixed route paths
// A -> liq4 -> liq34 (V4 -> V3)
// A -> liq3 -> liq34 (V3 -> V4)
// ETH -> liq3 -> A (V4 -> V3)
// ETH -> liq4 -> A (V3 -> V4)
contract MetaQuoterTest is Test {
    using LocalTokensLibrary for LocalTokens;

    uint128 constant amount = 0.01 ether;

    // Liquid tokens
    // eth/weth: Has V3 and V4 pools with all tokens
    // liq34: Has V3 and V4 pools with all tokens
    // liq2: Has V2 pools with all tokens
    // liq3: Has V3 pools with all tokens
    // liq4: Has V4 pools with all tokens
    Currency internal constant eth = Currency.wrap(address(0));
    Currency internal weth9;
    Currency internal liq34;
    Currency internal liq2;
    Currency internal liq3;
    Currency internal liq4;
    Currency internal tokenA;
    Currency internal tokenB;

    IV4MetaQuoter internal metaQuoter;
    IUniversalRouter internal router;

    function setUp() public {
        // Sets proper address for Create2 & transaction sender
        vm.startBroadcast();
        // WETH9
        // Set weth9 code to Optimism pre-deploy for anvil local chains that don't have pre-deploy (used by Uniswap V3)
        (address _weth9, ) = WETHUtils.getOrEtch(WETHUtils.opStackPreDeploy);
        LocalTokens memory tokens = LocalTokensLibrary.deploy(_weth9);

        // Tokens
        weth9 = Currency.wrap(address(tokens.weth9));
        liq34 = Currency.wrap(address(tokens.liq34));
        liq2 = Currency.wrap(address(tokens.liq2));
        liq3 = Currency.wrap(address(tokens.liq3));
        liq4 = Currency.wrap(address(tokens.liq4));

        tokenA = Currency.wrap(address(tokens.tokenA));
        tokenB = Currency.wrap(address(tokens.tokenB));

        UniswapContracts memory contracts = ContractsUniswapLibrary.deploy(_weth9);
        router = IUniversalRouter(contracts.universalRouter);
        metaQuoter = IV4MetaQuoter(contracts.metaQuoter);
        tokens.permit2Approve(contracts.universalRouter);
        // Create V4 Pools
        LocalPoolsLibrary.deployV4Pools(IPositionManager(contracts.v4PositionManager), tokens);
        // Create V3 Pools
        LocalPoolsLibrary.deployV3Pools(
            IUniswapV3Factory(contracts.v3Factory),
            V3PositionManagerMock(contracts.v3NFTPositionManager),
            tokens
        );
        // Create V2 Pools
        LocalPoolsLibrary.deployV2Pools(IUniswapV2Factory(contracts.v2Factory), tokens);
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

    /***** Exact Single Quotes *****/
    // A (exact) -> L2 (variable)
    function testExactInputSingle_A_L2() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, liq2);
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
        assertEq(address(metaQuoteResults[0].poolKey.hooks), address(2)); // V2 Pool

        IV4MetaQuoter.MetaQuoteExactSingleResult memory quote = metaQuoteResults[0];
        assertGt(quote.variableAmount, 0);
        // V2 Swap
        // Encode V2 Swap
        address[] memory path = new address[](2);
        path[0] = Currency.unwrap(currencyIn);
        path[1] = Currency.unwrap(currencyOut);

        bytes memory v2Swap = abi.encode(
            ActionConstants.MSG_SENDER, // recipient
            amount,
            uint256(quote.variableAmount), // amountOutMinimum
            path,
            true // payerIsUser
        );
        // Encode Universal Router Commands
        bytes memory routerCommands = abi.encodePacked(uint8(Commands.V2_SWAP_EXACT_IN));
        bytes[] memory routerCommandInputs = new bytes[](1);
        routerCommandInputs[0] = v2Swap;
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

    // A (exact) -> L3 (variable)
    function testExactInputSingle_A_L3() public {
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

    // A (exact) -> L4 (variable)
    function testExactInputSingle_A_L4() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, liq4);
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
        assertEq(address(metaQuoteResults[0].poolKey.hooks), address(0)); // V4 Pool

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
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + quote.variableAmount); // Output balance increased by variable amount
    }

    // A (exact) -> L34 (variable)
    function testExactInputSingle_A_L34() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, liq34);
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
        assertEq(metaQuoteResults.length, 3); // 3 pools
        assertEq(address(metaQuoteResults[0].poolKey.hooks), address(0)); // V4 Pool
        assertEq(address(metaQuoteResults[1].poolKey.hooks), address(3)); // V3 Pool
        assertEq(address(metaQuoteResults[2].poolKey.hooks), address(2)); // V2 Pool

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
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + quote.variableAmount); // Output balance increased by variable amount
    }

    // ETH (exact) -> A (variable)
    function testExactInputSingle_ETH_A() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (eth, tokenA);
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
        assertEq(metaQuoteResults.length, 3); // 3 pools
        assertEq(address(metaQuoteResults[0].poolKey.hooks), address(0)); // V4 Pool
        assertEq(address(metaQuoteResults[1].poolKey.hooks), address(3)); // V3 Pool
        assertEq(address(metaQuoteResults[2].poolKey.hooks), address(2)); // V2 Pool

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
        router.execute{value: metaQuoteParams.exactAmount}(routerCommands, routerCommandInputs, deadline);
        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceAfterSwap = currencyOut.balanceOf(msg.sender);
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - metaQuoteParams.exactAmount); // Input balance decreased by exact amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + quote.variableAmount); // Output balance increased by variable amount
    }

    // A (variable) -> L2 (exact)
    function testExactOutputSingle_A_L2() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, liq2);
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
        assertEq(address(metaQuoteResults[0].poolKey.hooks), address(2)); // V2 Pool

        IV4MetaQuoter.MetaQuoteExactSingleResult memory quote = metaQuoteResults[0];
        assertGt(quote.variableAmount, 0);
        // V2 Swap
        // Encode V2 Swap
        address[] memory path = new address[](2);
        path[0] = Currency.unwrap(currencyIn);
        path[1] = Currency.unwrap(currencyOut);

        bytes memory v2Swap = abi.encode(
            ActionConstants.MSG_SENDER, // recipient
            amount,
            uint256(quote.variableAmount), // amountInMaximum
            path,
            true // payerIsUser
        );
        // Encode Universal Router Commands
        bytes memory routerCommands = abi.encodePacked(uint8(Commands.V2_SWAP_EXACT_OUT));
        bytes[] memory routerCommandInputs = new bytes[](1);
        routerCommandInputs[0] = v2Swap;
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

    // A (variable) -> L3 (exact)
    function testExactOutputSingle_A_L3() public {
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

    // A (variable) -> L4 (exact)
    function testExactOutputSingle_A_L4() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, liq4);
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
        assertEq(address(metaQuoteResults[0].poolKey.hooks), address(0)); // V4 Pool

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
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + metaQuoteParams.exactAmount); // Output balance increased by exact amount
    }

    // A (variable) -> L34 (exact)
    function testExactOutputSingle_A_L34() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, liq34);
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
        assertEq(metaQuoteResults.length, 3); // 3 pools
        assertEq(address(metaQuoteResults[0].poolKey.hooks), address(0)); // V4 Pool
        assertEq(address(metaQuoteResults[1].poolKey.hooks), address(3)); // V3 Pool
        assertEq(address(metaQuoteResults[2].poolKey.hooks), address(2)); // V2 Pool

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
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + metaQuoteParams.exactAmount); // Output balance increased by exact amount
    }

    // ETH (variable) -> A (exact)
    function testExactOutputSingle_ETH_A() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (eth, tokenA);
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
        assertEq(metaQuoteResults.length, 3); // 3 pools
        assertEq(address(metaQuoteResults[0].poolKey.hooks), address(0)); // V4 Pool
        assertEq(address(metaQuoteResults[1].poolKey.hooks), address(3)); // V3 Pool
        assertEq(address(metaQuoteResults[2].poolKey.hooks), address(2)); // V2 Pool

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
        router.execute{value: quote.variableAmount}(routerCommands, routerCommandInputs, deadline);
        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceAfterSwap = currencyOut.balanceOf(msg.sender);
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - quote.variableAmount); // Input balance decreased by variable amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + metaQuoteParams.exactAmount); // Output balance increased by exact amount
    }

    /***** Exact Quotes *****/
    // A (exact) -> L34 -> B (variable)
    function testExactInput_A_L34_B() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, tokenB);
        // Quote
        Currency[] memory hopCurrencies = new Currency[](1);
        hopCurrencies[0] = liq34;
        IV4MetaQuoter.MetaQuoteExactParams memory metaQuoteParams = IV4MetaQuoter.MetaQuoteExactParams({
            exactCurrency: currencyIn,
            variableCurrency: currencyOut,
            hopCurrencies: hopCurrencies,
            exactAmount: amount,
            poolKeyOptions: getDefaultPoolKeyOptions()
        });
        IV4MetaQuoter.MetaQuoteExactResult[] memory metaQuoteResults = metaQuoter.metaQuoteExactInput(metaQuoteParams);
        assertEq(metaQuoteResults.length, 1); // Finds optimal A -> L34 -> B path

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

    // A (variable) -> L34 -> B (exact)
    function testExactOutput_A_L34_B() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, tokenB);
        // Quote
        Currency[] memory hopCurrencies = new Currency[](1);
        hopCurrencies[0] = liq34;
        IV4MetaQuoter.MetaQuoteExactParams memory metaQuoteParams = IV4MetaQuoter.MetaQuoteExactParams({
            exactCurrency: currencyOut,
            variableCurrency: currencyIn,
            hopCurrencies: hopCurrencies,
            exactAmount: amount,
            poolKeyOptions: getDefaultPoolKeyOptions()
        });
        IV4MetaQuoter.MetaQuoteExactResult[] memory metaQuoteResults = metaQuoter.metaQuoteExactOutput(metaQuoteParams);
        assertEq(metaQuoteResults.length, 1); // Finds optimal A -> L34 -> B path
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

    /***** Exact Input Mixed Routes V3 -> V4 *****/
    // A (exact) -> L3 -> L34 (variable)
    function testExactInput_A_L3_L34() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, liq34);
        // Quote
        Currency[] memory hopCurrencies = new Currency[](1);
        hopCurrencies[0] = liq3;
        IV4MetaQuoter.MetaQuoteExactParams memory metaQuoteParams = IV4MetaQuoter.MetaQuoteExactParams({
            exactCurrency: currencyIn,
            variableCurrency: currencyOut,
            hopCurrencies: hopCurrencies,
            exactAmount: amount,
            poolKeyOptions: getDefaultPoolKeyOptions()
        });
        IV4MetaQuoter.MetaQuoteExactResult[] memory metaQuoteResults = metaQuoter.metaQuoteExactInput(metaQuoteParams);
        assertEq(metaQuoteResults.length, 1); // Finds optimal A -> L3 -> L34 path

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

    // ETH (exact) -> L4 -> A (variable)
    function testExactInput_ETH_L4_A() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (eth, tokenA);
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
        assertEq(metaQuoteResults.length, 1); // Finds optimal A -> L3 -> L34 path

        IV4MetaQuoter.MetaQuoteExactResult memory quote = metaQuoteResults[0];
        assertGt(quote.variableAmount, 0);
        assertEq(address(quote.path[0].hooks), address(3)); // V3 Pool
        assertEq(address(quote.path[1].hooks), address(0)); // V4 Pool

        // V3 Swap
        // Encode V3 Swap
        bytes memory path = abi.encodePacked(
            address(Currency.unwrap(weth9)), // ETH is wrapped to WETH
            quote.path[0].fee,
            Currency.unwrap(quote.path[0].intermediateCurrency)
        );
        bytes memory v3Swap = abi.encode(
            ActionConstants.ADDRESS_THIS, // recipient
            amount,
            0, // amountOutMinimum ignored for intermediate swap
            path,
            false // payerIsUser (we wrap ETH first)
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
        routerCommandInputs[0] = abi.encode(ActionConstants.ADDRESS_THIS, ActionConstants.CONTRACT_BALANCE); // Wrap ETH for v3 Swap
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

    /***** Exact Input Mixed Routes V4 -> V3 *****/
    // A (exact) -> L4 -> L34 (variable)
    function testExactInput_A_L4_L34C() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, liq34);
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
        assertEq(metaQuoteResults.length, 1); // Finds optimal A -> L4 -> L34 path

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

    // ETH (exact) -> L3 -> A (variable)
    function testExactInput_ETH_L3_A() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (eth, tokenA);
        // Quote
        Currency[] memory hopCurrencies = new Currency[](1);
        hopCurrencies[0] = liq3;
        IV4MetaQuoter.MetaQuoteExactParams memory metaQuoteParams = IV4MetaQuoter.MetaQuoteExactParams({
            exactCurrency: currencyIn,
            variableCurrency: currencyOut,
            hopCurrencies: hopCurrencies,
            exactAmount: amount,
            poolKeyOptions: getDefaultPoolKeyOptions()
        });
        IV4MetaQuoter.MetaQuoteExactResult[] memory metaQuoteResults = metaQuoter.metaQuoteExactInput(metaQuoteParams);
        assertEq(metaQuoteResults.length, 1); // Finds optimal ETH -> L3 -> A path

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
        bytes memory routerCommands = abi.encodePacked(
            uint8(Commands.V4_SWAP),
            uint8(Commands.WRAP_ETH),
            uint8(Commands.V3_SWAP_EXACT_IN)
        );
        bytes[] memory routerCommandInputs = new bytes[](3);
        routerCommandInputs[0] = abi.encode(v4Actions, v4ActionParams);
        routerCommandInputs[1] = abi.encode(ActionConstants.ADDRESS_THIS, ActionConstants.CONTRACT_BALANCE); // Wrap ETH for v3 Swap
        routerCommandInputs[2] = v3Swap;
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

    //TODO: Implement true exact output mixed route using ERC20_BALANCE_CHECK refund subplan
    /***** Exact Output Mixed Routes V3 -> V4 *****/
    // A (variable) -> L3 -> L34 (exact)
    function testExactOutput_A_L3_L34() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, liq34);
        // Quote
        Currency[] memory hopCurrencies = new Currency[](1);
        hopCurrencies[0] = liq3;
        IV4MetaQuoter.MetaQuoteExactParams memory metaQuoteParams = IV4MetaQuoter.MetaQuoteExactParams({
            exactCurrency: currencyOut,
            variableCurrency: currencyIn,
            hopCurrencies: hopCurrencies,
            exactAmount: amount,
            poolKeyOptions: getDefaultPoolKeyOptions()
        });
        IV4MetaQuoter.MetaQuoteExactResult[] memory metaQuoteResults = metaQuoter.metaQuoteExactOutput(metaQuoteParams);
        assertEq(metaQuoteResults.length, 1); // Finds optimal A -> L3 -> L34 path
        IV4MetaQuoter.MetaQuoteExactResult memory quote = metaQuoteResults[0];

        assertGt(quote.variableAmount, 0);
        assertEq(address(quote.path[0].hooks), address(3)); // V3 Pool
        assertEq(address(quote.path[1].hooks), address(0)); // V4 Pool

        // Swaps get re-encoded as exact input because that is only way to support a mixed route
        // V3 Swap
        // Encode V3 Swap
        bytes memory path = abi.encodePacked(
            Currency.unwrap(quote.path[0].intermediateCurrency),
            quote.path[0].fee,
            Currency.unwrap(quote.path[1].intermediateCurrency)
        );
        bytes memory v3Swap = abi.encode(
            ActionConstants.ADDRESS_THIS, // recipient
            quote.variableAmount,
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
        v4ActionParams[0] = abi.encode(quote.path[1].intermediateCurrency, ActionConstants.CONTRACT_BALANCE, false); // Open delta for intermediateCurrency

        (Currency v4Currency0, Currency v4Currency1) = quote.path[1].intermediateCurrency < currencyOut
            ? (quote.path[1].intermediateCurrency, currencyOut)
            : (currencyOut, quote.path[1].intermediateCurrency);
        v4ActionParams[1] = abi.encode(
            IV4Router.ExactInputSingleParams({
                poolKey: PoolKey({
                    currency0: v4Currency0,
                    currency1: v4Currency1,
                    fee: quote.path[1].fee,
                    tickSpacing: quote.path[1].tickSpacing,
                    hooks: quote.path[1].hooks
                }), // convert last path to PoolKey
                zeroForOne: v4Currency0 == quote.path[1].intermediateCurrency,
                amountIn: ActionConstants.OPEN_DELTA,
                amountOutMinimum: uint128(amount),
                hookData: quote.path[1].hookData
            })
        );
        v4ActionParams[2] = abi.encode(currencyOut, uint256(amount)); // Take output
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
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - quote.variableAmount); // Input balance decreased by variable amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + metaQuoteParams.exactAmount); // Output balance increased by exact amount
    }

    /***** Exact Output Mixed Routes V4 -> V3 *****/
    // A (variable) -> L4 -> L34 (exact)
    function testExactOutput_A_L4_L34C() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, liq34);
        // Quote
        Currency[] memory hopCurrencies = new Currency[](1);
        hopCurrencies[0] = liq4;
        IV4MetaQuoter.MetaQuoteExactParams memory metaQuoteParams = IV4MetaQuoter.MetaQuoteExactParams({
            exactCurrency: currencyOut,
            variableCurrency: currencyIn,
            hopCurrencies: hopCurrencies,
            exactAmount: amount,
            poolKeyOptions: getDefaultPoolKeyOptions()
        });
        IV4MetaQuoter.MetaQuoteExactResult[] memory metaQuoteResults = metaQuoter.metaQuoteExactOutput(metaQuoteParams);
        assertEq(metaQuoteResults.length, 1); // Finds optimal A -> L4 -> L34 path
        IV4MetaQuoter.MetaQuoteExactResult memory quote = metaQuoteResults[0];

        assertGt(quote.variableAmount, 0);
        assertEq(address(quote.path[0].hooks), address(0)); // V4 Pool
        assertEq(address(quote.path[1].hooks), address(3)); // V3 Pool

        // Swaps get re-encoded as exact input because that is only way to support a mixed route
        // V4 Swap
        // Encode V4 Swap Actions
        bytes memory v4Actions = abi.encodePacked(
            uint8(Actions.SWAP_EXACT_IN_SINGLE),
            uint8(Actions.SETTLE_ALL),
            uint8(Actions.TAKE)
        );
        bytes[] memory v4ActionParams = new bytes[](3);
        (Currency v4Currency0, Currency v4Currency1) = quote.path[0].intermediateCurrency <
            quote.path[1].intermediateCurrency
            ? (quote.path[0].intermediateCurrency, quote.path[1].intermediateCurrency)
            : (quote.path[1].intermediateCurrency, quote.path[0].intermediateCurrency);

        v4ActionParams[0] = abi.encode(
            IV4Router.ExactInputSingleParams({
                poolKey: PoolKey({
                    currency0: v4Currency0,
                    currency1: v4Currency1,
                    fee: quote.path[0].fee,
                    tickSpacing: quote.path[0].tickSpacing,
                    hooks: quote.path[0].hooks
                }), // convert first path to PoolKey
                zeroForOne: v4Currency0 == quote.path[0].intermediateCurrency,
                amountIn: uint128(quote.variableAmount),
                amountOutMinimum: 0, // amountOutMinimum ignored for intermediate swap
                hookData: quote.path[0].hookData
            })
        );
        v4ActionParams[1] = abi.encode(quote.path[0].intermediateCurrency, quote.variableAmount); // Settle input
        v4ActionParams[2] = abi.encode(
            quote.path[1].intermediateCurrency,
            ActionConstants.ADDRESS_THIS,
            ActionConstants.OPEN_DELTA
        ); // Take output to router
        // V3 Swap
        // Encode V3 Swap
        bytes memory path = abi.encodePacked(
            Currency.unwrap(quote.path[1].intermediateCurrency),
            quote.path[1].fee,
            Currency.unwrap(currencyOut)
        );
        bytes memory v3Swap = abi.encode(
            ActionConstants.MSG_SENDER, // recipient
            ActionConstants.CONTRACT_BALANCE, // amountIn = contract balance
            amount, // amountOutMinimum
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
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - quote.variableAmount); // Input balance decreased by variable amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + metaQuoteParams.exactAmount); // Output balance increased by exact amount
    }
}
