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
import {IV3MetaQuoter} from "../contracts/uniswap/v3/IV3MetaQuoter.sol";
import {V3MetaQuoterUtils} from "../script/utils/V3MetaQuoterUtils.sol";
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

    // Tokens
    IERC20 internal tokenA;
    IERC20 internal tokenB;
    IERC20 internal tokenC;
    // Uniswap V3 Core
    IUniswapV3Factory internal v3Factory;
    // Uniswap V3 Periphery
    IV3MetaQuoter internal v3MetaQuoter;
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

        // Permit2
        (address permit2, ) = Permit2Utils.getOrCreate2();

        // Uniswap V3 Core
        (address _v3Factory, ) = UniswapV3FactoryUtils.getOrCreate2();
        v3Factory = IUniswapV3Factory(_v3Factory);

        // Uniswap V3 Periphery
        bytes32 poolInitCodeHash = keccak256(abi.encodePacked(type(UniswapV3Pool).creationCode));
        address weth9 = address(0x4200000000000000000000000000000000000006); //TODO: Add WETH9 address
        (address _v3MetaQuoter, ) = V3MetaQuoterUtils.getOrCreate2(address(v3Factory), poolInitCodeHash);
        v3MetaQuoter = IV3MetaQuoter(_v3MetaQuoter);

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

        // Setup approvals
        MockERC20(address(tokenA)).mint(msg.sender, 100_000 ether);
        tokenA.approve(permit2, type(uint256).max);
        IAllowanceTransfer(permit2).approve(address(tokenA), address(router), type(uint160).max, type(uint48).max);
        MockERC20(address(tokenB)).mint(msg.sender, 100_000 ether);
        tokenB.approve(permit2, type(uint256).max);
        IAllowanceTransfer(permit2).approve(address(tokenB), address(router), type(uint160).max, type(uint48).max);
        MockERC20(address(tokenC)).mint(msg.sender, 100_000 ether);
        tokenC.approve(permit2, type(uint256).max);
        IAllowanceTransfer(permit2).approve(address(tokenC), address(router), type(uint160).max, type(uint48).max);

        // Create & Initialize Pools
        uint24 fee = 500;
        int24 tickSpacing = 60;
        uint160 startingPrice = Constants.SQRT_PRICE_1_1;
        IUniswapV3Pool poolAB = IUniswapV3Pool(v3Factory.createPool(address(tokenA), address(tokenB), fee));
        IUniswapV3Pool poolBC = IUniswapV3Pool(v3Factory.createPool(address(tokenB), address(tokenC), fee));
        poolAB.initialize(startingPrice);
        poolBC.initialize(startingPrice);
        // Setup Position Manager
        (address _v3Posm, ) = V3PositionManagerMockUtils.getOrCreate2(address(v3Factory), poolInitCodeHash);
        V3PositionManagerMock v3Posm = V3PositionManagerMock(_v3Posm);
        IAllowanceTransfer(permit2).approve(address(tokenA), address(v3Posm), type(uint160).max, type(uint48).max);
        IAllowanceTransfer(permit2).approve(address(tokenB), address(v3Posm), type(uint160).max, type(uint48).max);
        IAllowanceTransfer(permit2).approve(address(tokenC), address(v3Posm), type(uint160).max, type(uint48).max);
        // Pool Add Liquidity
        int24 tickLower = (TickMath.getTickAtSqrtPrice(Constants.SQRT_PRICE_1_2) / tickSpacing) * tickSpacing;
        int24 tickUpper = (TickMath.getTickAtSqrtPrice(Constants.SQRT_PRICE_2_1) / tickSpacing) * tickSpacing;
        uint256 liquidity = LiquidityAmounts.getLiquidityForAmounts(
            startingPrice,
            TickMath.getSqrtPriceAtTick(tickLower),
            TickMath.getSqrtPriceAtTick(tickUpper),
            100 ether,
            100 ether
        );
        V3PoolKey memory poolKeyAB = V3PoolKeyLibrary.getPoolKey(
            Currency.wrap(address(tokenA)),
            Currency.wrap(address(tokenB)),
            fee
        );
        v3Posm.addLiquidity(poolKeyAB, tickLower, tickUpper, uint128(liquidity), msg.sender);
        V3PoolKey memory poolKeyBC = V3PoolKeyLibrary.getPoolKey(
            Currency.wrap(address(tokenB)),
            Currency.wrap(address(tokenC)),
            fee
        );
        v3Posm.addLiquidity(poolKeyBC, tickLower, tickUpper, uint128(liquidity), msg.sender);
    }

    function getDefaultFeeOptions() internal pure returns (uint24[] memory defaultFeeOptions) {
        defaultFeeOptions = new uint24[](3);
        defaultFeeOptions[0] = 500;
        defaultFeeOptions[1] = 3_000;
        defaultFeeOptions[2] = 10_000;
    }

    // A (exact) -> B (variable)
    function testExactInputSingle() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (Currency.wrap(address(tokenA)), Currency.wrap(address(tokenB)));

        // V3 Quote
        IV3MetaQuoter.MetaQuoteExactSingleParams memory v3MetaQuoteParams = IV3MetaQuoter.MetaQuoteExactSingleParams({
            exactCurrency: currencyIn,
            variableCurrency: currencyOut,
            exactAmount: uint128(amount),
            feeOptions: getDefaultFeeOptions()
        });
        IV3MetaQuoter.MetaQuoteExactSingleResult[] memory v3MetaQuoteResults = v3MetaQuoter.metaQuoteExactInputSingle(
            v3MetaQuoteParams
        );
        assertEq(v3MetaQuoteResults.length, 1); // Only active pool
        IV3MetaQuoter.MetaQuoteExactSingleResult memory quote = v3MetaQuoteResults[0];
        assertGt(quote.variableAmount, 0);

        // V3 Swap
        // Encode V3 Swap
        bytes memory path = abi.encodePacked(
            Currency.unwrap(currencyIn),
            quote.poolKey.fee,
            Currency.unwrap(currencyOut)
        );
        bytes memory v3Swap = abi.encode(
            msg.sender, // recipient
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
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - v3MetaQuoteParams.exactAmount); // Input balance decreased by exact amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + quote.variableAmount); // Output balance increased by variable amount
    }

    // A (variable) -> B (exact)
    function testExactOutputSingle() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (Currency.wrap(address(tokenA)), Currency.wrap(address(tokenB)));

        // V3 Quote
        IV3MetaQuoter.MetaQuoteExactSingleParams memory v3MetaQuoteParams = IV3MetaQuoter.MetaQuoteExactSingleParams({
            exactCurrency: currencyOut,
            variableCurrency: currencyIn,
            exactAmount: amount,
            feeOptions: getDefaultFeeOptions()
        });
        IV3MetaQuoter.MetaQuoteExactSingleResult[] memory v3MetaQuoteResults = v3MetaQuoter.metaQuoteExactOutputSingle(
            v3MetaQuoteParams
        );
        assertEq(v3MetaQuoteResults.length, 1); // Only active pool
        IV3MetaQuoter.MetaQuoteExactSingleResult memory quote = v3MetaQuoteResults[0];
        assertGt(quote.variableAmount, 0);

        // V3 Swap
        // Encode V3 Swap
        bytes memory path = abi.encodePacked(
            Currency.unwrap(currencyOut),
            quote.poolKey.fee,
            Currency.unwrap(currencyIn)
        );
        bytes memory v3Swap = abi.encode(
            msg.sender, // recipient
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
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + v3MetaQuoteParams.exactAmount); // Output balance increased by exact amount
    }

    // A (exact) -> B -> C (variable)
    function testExactInput() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (Currency.wrap(address(tokenA)), Currency.wrap(address(tokenC)));

        // V3 Quote
        Currency[] memory hopCurrencies = new Currency[](1);
        hopCurrencies[0] = Currency.wrap(address(tokenB));
        IV3MetaQuoter.MetaQuoteExactParams memory v3MetaQuoteParams = IV3MetaQuoter.MetaQuoteExactParams({
            exactCurrency: currencyIn,
            variableCurrency: currencyOut,
            hopCurrencies: hopCurrencies,
            exactAmount: amount,
            feeOptions: getDefaultFeeOptions()
        });
        IV3MetaQuoter.MetaQuoteExactResult[] memory v3MetaQuoteResults = v3MetaQuoter.metaQuoteExactInput(
            v3MetaQuoteParams
        );
        assertEq(v3MetaQuoteResults.length, 1); // Only active pool
        IV3MetaQuoter.MetaQuoteExactResult memory quote = v3MetaQuoteResults[0];
        assertGt(quote.variableAmount, 0);

        // V3 Swap
        // Encode V3 Swap
        bytes memory path = abi.encodePacked(
            Currency.unwrap(currencyIn),
            quote.path[0].fee,
            Currency.unwrap(quote.path[0].intermediateCurrency),
            quote.path[1].fee,
            Currency.unwrap(quote.path[1].intermediateCurrency)
        );
        bytes memory v3Swap = abi.encode(
            msg.sender, // recipient
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
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - v3MetaQuoteParams.exactAmount); // Input balance decreased by exact amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + quote.variableAmount); // Output balance increased by variable amount
    }

    // A (variable) -> B -> C (exact)
    function testExactOutput() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (Currency.wrap(address(tokenA)), Currency.wrap(address(tokenC)));

        // V3 Quote
        Currency[] memory hopCurrencies = new Currency[](1);
        hopCurrencies[0] = Currency.wrap(address(tokenB));
        IV3MetaQuoter.MetaQuoteExactParams memory v3MetaQuoteParams = IV3MetaQuoter.MetaQuoteExactParams({
            exactCurrency: currencyOut,
            variableCurrency: currencyIn,
            hopCurrencies: hopCurrencies,
            exactAmount: amount,
            feeOptions: getDefaultFeeOptions()
        });
        IV3MetaQuoter.MetaQuoteExactResult[] memory v3MetaQuoteResults = v3MetaQuoter.metaQuoteExactOutput(
            v3MetaQuoteParams
        );
        assertEq(v3MetaQuoteResults.length, 1); // Only active pool
        IV3MetaQuoter.MetaQuoteExactResult memory quote = v3MetaQuoteResults[0];
        assertGt(quote.variableAmount, 0);

        // V3 Swap
        // Encode V3 Swap
        bytes memory path = abi.encodePacked(
            Currency.unwrap(currencyOut),
            quote.path[1].fee,
            Currency.unwrap(quote.path[1].intermediateCurrency),
            quote.path[0].fee,
            Currency.unwrap(quote.path[0].intermediateCurrency)
        );
        bytes memory v3Swap = abi.encode(
            msg.sender, // recipient
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
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + v3MetaQuoteParams.exactAmount); // Output balance increased by exact amount
    }
}
