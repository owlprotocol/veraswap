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
import {IV3Quoter} from "../contracts/uniswap/v3/IV3Quoter.sol";
import {V3QuoterUtils} from "../script/utils/V3QuoterUtils.sol";
import {V3PositionManagerMock} from "../contracts/uniswap/v3/V3PositionManagerMock.sol";
import {V3PositionManagerMockUtils} from "../script/utils/V3PositionManagerMockUtils.sol";
import {V3PoolKey, V3PoolKeyLibrary} from "../contracts/uniswap/v3/V3PoolKey.sol";
import {V3PathKey} from "../contracts/uniswap/v3/V3PathKey.sol";

// Uniswap V4 Core
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {Constants} from "@uniswap/v4-core/test/utils/Constants.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {LiquidityAmounts} from "@uniswap/v4-core/test/utils/LiquidityAmounts.sol";
// Uniswap V4 Periphery
import {PathKey} from "@uniswap/v4-periphery/src/libraries/PathKey.sol";
import {ActionConstants} from "@uniswap/v4-periphery/src/libraries/ActionConstants.sol";
// Uniswap Universal Router
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import {Commands} from "@uniswap/universal-router/contracts/libraries/Commands.sol";
import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {UnsupportedProtocolUtils} from "../script/utils/UnsupportedProtocolUtils.sol";
import {UniversalRouterUtils} from "../script/utils/UniversalRouterUtils.sol";
// Liquidity Pools
import {PoolUtils} from "../script/utils/PoolUtils.sol";

contract V3QuoterTest is Test {
    bytes32 constant BYTES32_ZERO = bytes32(0);
    uint128 constant amount = 0.01 ether;

    uint24 internal fee = 3000;
    int24 internal tickSpacing = 60;

    // Tokens
    IERC20 internal tokenA;
    IERC20 internal tokenB;
    IERC20 internal tokenC;
    // Uniswap V3 Core
    IUniswapV3Factory internal v3Factory;
    // Uniswap V3 Periphery
    IV3Quoter internal v3Quoter;
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

        // Uniswap V3 Core
        bytes32 poolInitCodeHash = keccak256(abi.encodePacked(type(UniswapV3Pool).creationCode));
        (address _v3Factory, ) = UniswapV3FactoryUtils.getOrCreate2();
        v3Factory = IUniswapV3Factory(_v3Factory);
        (address _v3Posm, ) = V3PositionManagerMockUtils.getOrCreate2(address(v3Factory), poolInitCodeHash);
        V3PositionManagerMock v3Posm = V3PositionManagerMock(_v3Posm);

        // Uniswap V3 Periphery
        address weth9 = address(0x4200000000000000000000000000000000000006); //TODO: Add WETH9 address
        (address _v3Quoter, ) = V3QuoterUtils.getOrCreate2(address(v3Factory), poolInitCodeHash);
        v3Quoter = IV3Quoter(_v3Quoter);

        // Uniswap Universal Router
        (address unsupported, ) = UnsupportedProtocolUtils.getOrCreate2();
        RouterParameters memory routerParams = RouterParameters({
            permit2: permit2,
            weth9: weth9,
            v2Factory: unsupported,
            v3Factory: address(v3Factory),
            pairInitCodeHash: BYTES32_ZERO,
            poolInitCodeHash: poolInitCodeHash,
            v4PoolManager: unsupported,
            v3NFTPositionManager: unsupported,
            v4PositionManager: unsupported
        });
        (address _router, ) = UniversalRouterUtils.getOrCreate2(routerParams);
        router = IUniversalRouter(_router);
        IAllowanceTransfer(permit2).approve(address(tokenA), address(router), type(uint160).max, type(uint48).max);
        IAllowanceTransfer(permit2).approve(address(tokenB), address(router), type(uint160).max, type(uint48).max);
        IAllowanceTransfer(permit2).approve(address(tokenC), address(router), type(uint160).max, type(uint48).max);

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

    // A (exact) -> B (variable)
    function testExactInputSingle() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (Currency.wrap(address(tokenA)), Currency.wrap(address(tokenB)));
        // PoolKey
        (Currency currency0, Currency currency1) = currencyIn < currencyOut
            ? (currencyIn, currencyOut)
            : (currencyOut, currencyIn);
        V3PoolKey memory poolKey = V3PoolKey({currency0: currency0, currency1: currency1, fee: fee});

        // V3 Quote
        bool zeroForOne = currency0 == currencyIn;
        IV3Quoter.QuoteExactSingleParams memory v3QuoteParams = IV3Quoter.QuoteExactSingleParams({
            poolKey: poolKey,
            exactAmount: uint128(amount),
            zeroForOne: zeroForOne
        });
        (uint256 amountOut, ) = v3Quoter.quoteExactInputSingle(v3QuoteParams);
        assertGt(amountOut, 0);

        // V3 Swap
        // Encode V3 Swap
        bytes memory path = abi.encodePacked(Currency.unwrap(currencyIn), poolKey.fee, Currency.unwrap(currencyOut));
        bytes memory v3Swap = abi.encode(
            ActionConstants.MSG_SENDER, // recipient
            amount,
            amountOut, // amountOutMinimum
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
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - v3QuoteParams.exactAmount); // Input balance decreased by exact amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + amountOut); // Output balance increased by variable amount
    }

    // A (variable) -> B (exact)
    function testExactOutputSingle() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (Currency.wrap(address(tokenA)), Currency.wrap(address(tokenB)));
        // PoolKey
        (Currency currency0, Currency currency1) = currencyIn < currencyOut
            ? (currencyIn, currencyOut)
            : (currencyOut, currencyIn);
        V3PoolKey memory poolKey = V3PoolKey({currency0: currency0, currency1: currency1, fee: fee});

        // V3 Quote
        bool zeroForOne = currency0 == currencyIn;
        IV3Quoter.QuoteExactSingleParams memory v3QuoteParams = IV3Quoter.QuoteExactSingleParams({
            poolKey: poolKey,
            exactAmount: uint128(amount),
            zeroForOne: zeroForOne
        });
        (uint256 amountIn, ) = v3Quoter.quoteExactOutputSingle(v3QuoteParams);
        assertGt(amountIn, 0);

        // V3 Swap
        // Encode V3 Swap
        bytes memory path = abi.encodePacked(Currency.unwrap(currencyOut), poolKey.fee, Currency.unwrap(currencyIn));
        bytes memory v3Swap = abi.encode(
            ActionConstants.MSG_SENDER, // recipient
            amount,
            amountIn, // amountInMaximum
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
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - amountIn); // Input balance decreased by variable amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + v3QuoteParams.exactAmount); // Output balance increased by exact amount
    }

    // A (exact) -> B -> C (variable)
    function testExactInput() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (Currency.wrap(address(tokenA)), Currency.wrap(address(tokenC)));
        // V3 Quote
        V3PathKey[] memory pathQuote = new V3PathKey[](2);
        V3PathKey memory pathKeyIntermediate = V3PathKey({
            intermediateCurrency: Currency.wrap(address(tokenB)),
            fee: fee
        });
        V3PathKey memory pathKeyOutput = V3PathKey({intermediateCurrency: currencyOut, fee: fee});
        pathQuote[0] = pathKeyIntermediate;
        pathQuote[1] = pathKeyOutput;

        IV3Quoter.QuoteExactParams memory v3QuoteParams = IV3Quoter.QuoteExactParams({
            exactCurrency: currencyIn,
            path: pathQuote,
            exactAmount: amount
        });

        (uint256 amountOut, ) = v3Quoter.quoteExactInput(v3QuoteParams);
        assertGt(amountOut, 0);

        // V3 Swap
        // Encode V3 Swap
        bytes memory path = abi.encodePacked(
            Currency.unwrap(currencyIn),
            fee,
            address(tokenB),
            fee,
            Currency.unwrap(currencyOut)
        );
        bytes memory v3Swap = abi.encode(
            ActionConstants.MSG_SENDER, // recipient
            amount,
            amountOut, // amountOutMinimum
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
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - v3QuoteParams.exactAmount); // Input balance decreased by exact amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + amountOut); // Output balance increased by variable amount
    }

    // A (variable) -> B -> C (exact)
    function testExactOutput() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (Currency.wrap(address(tokenA)), Currency.wrap(address(tokenC)));
        // V3 Quote
        V3PathKey[] memory pathQuote = new V3PathKey[](2);
        V3PathKey memory pathKeyInput = V3PathKey({intermediateCurrency: currencyIn, fee: fee});
        V3PathKey memory pathKeyIntermediate = V3PathKey({
            intermediateCurrency: Currency.wrap(address(tokenB)),
            fee: fee
        });
        pathQuote[0] = pathKeyInput;
        pathQuote[1] = pathKeyIntermediate;

        IV3Quoter.QuoteExactParams memory v3QuoteParams = IV3Quoter.QuoteExactParams({
            exactCurrency: currencyOut,
            path: pathQuote,
            exactAmount: amount
        });

        (uint256 amountIn, ) = v3Quoter.quoteExactOutput(v3QuoteParams);
        assertGt(amountIn, 0);

        // V3 Swap
        // Encode V3 Swap
        bytes memory path = abi.encodePacked(
            Currency.unwrap(currencyOut),
            fee,
            address(tokenB),
            fee,
            Currency.unwrap(currencyIn)
        );
        bytes memory v3Swap = abi.encode(
            ActionConstants.MSG_SENDER, // recipient
            amount,
            amountIn, // amountInMaximum
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
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - amountIn); // Input balance decreased by variable amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + v3QuoteParams.exactAmount); // Output balance increased by exact amount
    }
}
