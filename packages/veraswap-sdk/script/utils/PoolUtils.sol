// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {IAllowanceTransfer} from "permit2/src/interfaces/IAllowanceTransfer.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";

import {IUniswapV3Factory} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {V3PoolKey} from "../../contracts/uniswap/v3/V3PoolKey.sol";
import {V3PositionManagerMock} from "../../contracts/uniswap/v3/V3PositionManagerMock.sol";

import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Constants} from "@uniswap/v4-core/test/utils/Constants.sol";

import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {CurrencyLibrary, Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {LiquidityAmounts} from "@uniswap/v4-core/test/utils/LiquidityAmounts.sol";

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";

import {IPositionManager} from "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import {IPositionDescriptor} from "@uniswap/v4-periphery/src/interfaces/IPositionDescriptor.sol";
import {IStateView} from "@uniswap/v4-periphery/src/interfaces/IStateView.sol";

import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";

library PoolUtils {
    address constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;
    bytes constant ZERO_BYTES = new bytes(0);

    function setupToken(IERC20 token, IPositionManager v4PositionManager, IUniversalRouter router) internal {
        // Mint
        MockERC20(address(token)).mint(msg.sender, 100_000 ether);
        // Approve Permit2
        token.approve(address(PERMIT2), type(uint256).max);
        // Approve PositionManager using Permit2
        IAllowanceTransfer(PERMIT2).approve(
            address(token),
            address(v4PositionManager),
            type(uint160).max,
            type(uint48).max
        );
        // Approve UniversalRouter using Permit2
        IAllowanceTransfer(PERMIT2).approve(address(token), address(router), type(uint160).max, type(uint48).max);
    }

    function createV3Pool(
        Currency currencyA,
        Currency currencyB,
        IUniswapV3Factory v3Factory,
        V3PositionManagerMock v3PositionManager,
        uint256 amount
    ) internal returns (IUniswapV3Pool pool) {
        (Currency currency0, Currency currency1) = (currencyA < currencyB)
            ? (currencyA, currencyB)
            : (currencyB, currencyA);

        // Create & Initialize Pool
        uint24 fee = 3000;
        int24 tickSpacing = 60;
        V3PoolKey memory poolKey = V3PoolKey({currency0: currency0, currency1: currency1, fee: fee});
        pool = IUniswapV3Pool(v3Factory.createPool(Currency.unwrap(currency0), Currency.unwrap(currency1), fee));
        uint160 startingPrice = Constants.SQRT_PRICE_1_1;
        pool.initialize(startingPrice);
        // Mint Liquidity
        int24 tickLower = (TickMath.getTickAtSqrtPrice(Constants.SQRT_PRICE_1_2) / tickSpacing) * tickSpacing;
        int24 tickUpper = (TickMath.getTickAtSqrtPrice(Constants.SQRT_PRICE_2_1) / tickSpacing) * tickSpacing;
        uint256 liquidity = LiquidityAmounts.getLiquidityForAmounts(
            startingPrice,
            TickMath.getSqrtPriceAtTick(tickLower),
            TickMath.getSqrtPriceAtTick(tickUpper),
            amount,
            amount
        );
        // Approve tokens
        if (!currency0.isAddressZero()) {
            IAllowanceTransfer(PERMIT2).approve(
                Currency.unwrap(currency0),
                address(v3PositionManager),
                type(uint160).max,
                type(uint48).max
            );
        }
        if (!currency1.isAddressZero()) {
            IAllowanceTransfer(PERMIT2).approve(
                Currency.unwrap(currency1),
                address(v3PositionManager),
                type(uint160).max,
                type(uint48).max
            );
        }
        // Mint Liquidity
        v3PositionManager.addLiquidity(poolKey, tickLower, tickUpper, uint128(liquidity), msg.sender);
    }

    function createV4Pool(
        Currency currencyA,
        Currency currencyB,
        IPositionManager v4PositionManager,
        uint256 amount
    ) internal returns (PoolKey memory poolKey) {
        (Currency currency0, Currency currency1) = (currencyA < currencyB)
            ? (currencyA, currencyB)
            : (currencyB, currencyA);
        bool isNative = currency0.isAddressZero() || currency1.isAddressZero();

        // Initialize Pool & Mint Liquidity
        // See https://docs.uniswap.org/contracts/v4/quickstart/create-pool
        bytes[] memory multicallParams = new bytes[](2);
        // 1. Initialize the parameters provided to multicall()
        uint24 fee = 3000;
        int24 tickSpacing = 60;
        poolKey = PoolKey(currency0, currency1, fee, tickSpacing, IHooks(address(0)));
        // 3. Encode the initializePool parameters
        uint160 startingPrice = Constants.SQRT_PRICE_1_1;
        //WANING UNCOMMENT
        multicallParams[0] = abi.encodeWithSelector(
            IPositionManager(v4PositionManager).initializePool.selector,
            poolKey,
            startingPrice
        );
        // 4. Initialize the mint-liquidity parameters
        bytes memory mintActions = abi.encodePacked(uint8(Actions.MINT_POSITION), uint8(Actions.SETTLE_PAIR));
        // 5. Encode the MINT_POSITION parameters
        int24 tickLower = (TickMath.getTickAtSqrtPrice(Constants.SQRT_PRICE_1_2) / tickSpacing) * tickSpacing;
        int24 tickUpper = (TickMath.getTickAtSqrtPrice(Constants.SQRT_PRICE_2_1) / tickSpacing) * tickSpacing;
        uint256 liquidity = LiquidityAmounts.getLiquidityForAmounts(
            startingPrice,
            TickMath.getSqrtPriceAtTick(tickLower),
            TickMath.getSqrtPriceAtTick(tickUpper),
            amount,
            amount
        );
        // Encodes a amount/amount position at 1:1 price across the entire tick range
        bytes[] memory mintParams = new bytes[](2);
        mintParams[0] = abi.encode(poolKey, tickLower, tickUpper, liquidity, amount, amount, msg.sender, ZERO_BYTES);
        // 6. Encode the SETTLE_PAIR parameters
        mintParams[1] = abi.encode(poolKey.currency0, poolKey.currency1);
        // 7. Encode the modifyLiquidites call
        uint256 deadline = block.timestamp + 60 * 5; // 5 minutes
        multicallParams[1] = abi.encodeWithSelector(
            IPositionManager.modifyLiquidities.selector,
            abi.encode(mintActions, mintParams),
            deadline
        );
        // 8. Approve the tokens
        // TODO: Check if this is needed
        if (!currency0.isAddressZero()) {
            IAllowanceTransfer(PERMIT2).approve(
                Currency.unwrap(currency0),
                address(v4PositionManager),
                type(uint160).max,
                type(uint48).max
            );
        }
        if (!currency1.isAddressZero()) {
            IAllowanceTransfer(PERMIT2).approve(
                Currency.unwrap(currency1),
                address(v4PositionManager),
                type(uint160).max,
                type(uint48).max
            );
        }
        // 9. Execute the multicall
        uint256 ethToSend = isNative ? amount : 0;
        v4PositionManager.multicall{value: ethToSend}(multicallParams);
    }

    function deployPool(
        address tokenA,
        address tokenB,
        IPositionManager v4PositionManager,
        IStateView v4StateView
    ) internal returns (uint256 currentLiquidity) {
        return deployPoolWithLiquidityMultiplier(tokenA, tokenB, v4PositionManager, v4StateView, 1);
    }

    //TODO: Remove this
    function deployPoolWithLiquidityMultiplier(
        address tokenA,
        address tokenB,
        IPositionManager v4PositionManager,
        IStateView v4StateView,
        uint256 liquidityMultiplier
    ) internal returns (uint256 currentLiquidity) {
        address token0 = tokenA;
        address token1 = tokenB;
        if (uint160(tokenA) > uint160(tokenB)) {
            (token0, token1) = (token1, token0);
        }

        Currency currency0 = (token0 == address(0)) ? CurrencyLibrary.ADDRESS_ZERO : Currency.wrap(token0);
        Currency currency1 = (token1 == address(0)) ? CurrencyLibrary.ADDRESS_ZERO : Currency.wrap(token1);

        bool isNative = tokenA == address(0) || tokenB == address(0);

        // Initialize Pool & Mint Liquidity
        // See https://docs.uniswap.org/contracts/v4/quickstart/create-pool
        bytes[] memory multicallParams = new bytes[](2);
        // 1. Initialize the parameters provided to multicall()
        int24 tickSpacing = 60;
        PoolKey memory poolKey = PoolKey(currency0, currency1, 3000, tickSpacing, IHooks(address(0)));
        // 3. Encode the initializePool parameters
        uint160 startingPrice = Constants.SQRT_PRICE_1_1;
        //WANING UNCOMMENT
        multicallParams[0] = abi.encodeWithSelector(
            IPositionManager(v4PositionManager).initializePool.selector,
            poolKey,
            startingPrice
        );
        // 4. Initialize the mint-liquidity parameters
        bytes memory mintActions = abi.encodePacked(uint8(Actions.MINT_POSITION), uint8(Actions.SETTLE_PAIR));

        uint256 liquidityAmount = (isNative ? 1 ether : 100 ether) * liquidityMultiplier;
        // 5. Encode the MINT_POSITION parameters
        int24 tickLower = (TickMath.getTickAtSqrtPrice(Constants.SQRT_PRICE_1_2) / tickSpacing) * tickSpacing;
        int24 tickUpper = (TickMath.getTickAtSqrtPrice(Constants.SQRT_PRICE_2_1) / tickSpacing) * tickSpacing;
        uint256 liquidity = LiquidityAmounts.getLiquidityForAmounts(
            startingPrice,
            TickMath.getSqrtPriceAtTick(tickLower),
            TickMath.getSqrtPriceAtTick(tickUpper),
            liquidityAmount,
            liquidityAmount
        ); // Encodes a 100/100 position at 1:1 price across the entire tick range
        bytes[] memory mintParams = new bytes[](2);
        uint256 mintAmount = (isNative ? 10 ether : 50_000 ether) * liquidityMultiplier;
        mintParams[0] = abi.encode(
            poolKey,
            tickLower,
            tickUpper,
            liquidity,
            mintAmount,
            mintAmount,
            msg.sender,
            ZERO_BYTES
        );
        // 6. Encode the SETTLE_PAIR parameters
        mintParams[1] = abi.encode(poolKey.currency0, poolKey.currency1);
        // 7. Encode the modifyLiquidites call
        uint256 deadline = block.timestamp + 60 * 5; // 5 minutes
        multicallParams[1] = abi.encodeWithSelector(
            IPositionManager.modifyLiquidities.selector,
            abi.encode(mintActions, mintParams),
            deadline
        );
        // 8. Approve the tokens
        // Done Above
        // 9. Execute the multicall

        uint256 ethToSend = isNative ? (10 ether) * liquidityMultiplier : 0;

        v4PositionManager.multicall{value: ethToSend}(multicallParams);

        currentLiquidity = v4StateView.getLiquidity(PoolIdLibrary.toId(poolKey));
    }
}
