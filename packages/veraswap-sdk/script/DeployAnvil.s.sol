// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "forge-std/console2.sol";
import "forge-std/Test.sol";

import {VmSafe} from "forge-std/Vm.sol";

import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";

import {IAllowanceTransfer} from "permit2/src/interfaces/IAllowanceTransfer.sol";

import {PoolManager} from "@uniswap/v4-core/src/PoolManager.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Constants} from "@uniswap/v4-core/test/utils/Constants.sol";

import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {CurrencyLibrary, Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {LiquidityAmounts} from "@uniswap/v4-core/test/utils/LiquidityAmounts.sol";

import {IPositionManager} from "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import {PositionManager} from "@uniswap/v4-periphery/src/PositionManager.sol";
import {IPositionDescriptor} from "@uniswap/v4-periphery/src/interfaces/IPositionDescriptor.sol";
import {IV4Router} from "@uniswap/v4-periphery/src/interfaces/IV4Router.sol";
import {IV4Quoter} from "@uniswap/v4-periphery/src/interfaces/IV4Quoter.sol";
import {IStateView} from "@uniswap/v4-periphery/src/interfaces/IStateView.sol";
import {IWETH9} from "@uniswap/v4-periphery/src/interfaces/external/IWETH9.sol";
import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";

import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {UnsupportedProtocol} from "@uniswap/universal-router/contracts/deploy/UnsupportedProtocol.sol";
import {UniversalRouter} from "@uniswap/universal-router/contracts/UniversalRouter.sol";
import {Commands} from "@uniswap/universal-router/contracts/libraries/Commands.sol";
import {V4Quoter} from "@uniswap/universal-router/lib/v4-periphery/src/lens/V4Quoter.sol";
import {StateView} from "@uniswap/universal-router/lib/v4-periphery/src/lens/StateView.sol";

import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";

import {DeployPermit2} from "../test/utils/forks/DeployPermit2.sol";
import {DeployCreate2Deployer} from "../test/utils/forks/DeployCreate2Deployer.sol";

struct UniswapContracts {
    IAllowanceTransfer permit2;
    UnsupportedProtocol unsupported;
    IPoolManager v4PoolManager;
    IPositionManager v4PositionManager;
    UniversalRouter router;
    IV4Quoter v4Quoter;
    IStateView stateView;
}

/// @notice Forge script for deploying v4 & hooks to **anvil**
/// @dev This script only works on an anvil RPC because v4 exceeds bytecode limits
contract DeployUniswapV4 is Script, Test, DeployCreate2Deployer, DeployPermit2 {
    bytes32 constant BYTES32_ZERO = bytes32(0);
    bytes constant ZERO_BYTES = new bytes(0);

    function setUp() public {}

    function run() external {
        vm.startBroadcast();
        UniswapContracts memory contracts = deployUniswapContracts();

        console2.log("permit2:", address(contracts.permit2));
        // console2.log("weth9:", params.weth9);
        // console2.log("v2Factory:", params.v2Factory);
        // console2.log("v3Factory:", params.v3Factory);
        console2.log("v4PoolManager:", address(contracts.v4PoolManager));
        // console2.log("v3NFTPositionManager:", params.v3NFTPositionManager);
        console2.log(
            "v4PositionManager:",
            address(contracts.v4PositionManager)
        );
        console2.log("router:", address(contracts.router));
        console2.log("v4Quoter:", address(contracts.v4Quoter));
        console2.log("stateView:", address(contracts.stateView));

        testLifeCycle(contracts);

        vm.stopBroadcast();
    }

    function testLifeCycle(UniswapContracts memory contracts) public {
        // Deploy Tokens
        MockERC20 tokenA = new MockERC20("MockA", "A", 18);
        MockERC20 tokenB = new MockERC20("MockB", "B", 18);
        MockERC20 token0;
        MockERC20 token1;
        if (uint160(address(tokenA)) < uint160(address(tokenB))) {
            token0 = tokenA;
            token1 = tokenB;
        } else {
            token0 = tokenB;
            token1 = tokenA;
        }
        // Mint
        token0.mint(msg.sender, 100_000 ether);
        token1.mint(msg.sender, 100_000 ether);
        // Approve Permit2
        token0.approve(address(permit2), type(uint256).max);
        token1.approve(address(permit2), type(uint256).max);
        // Approve PositionManager using Permit2
        permit2.approve(
            address(token0),
            address(contracts.v4PositionManager),
            type(uint160).max,
            type(uint48).max
        );
        permit2.approve(
            address(token1),
            address(contracts.v4PositionManager),
            type(uint160).max,
            type(uint48).max
        );
        // Approve UnversalRouter using Permit2
        permit2.approve(
            address(token0),
            address(contracts.router),
            type(uint160).max,
            type(uint48).max
        );
        permit2.approve(
            address(token1),
            address(contracts.router),
            type(uint160).max,
            type(uint48).max
        );

        // Initialize Pool & Mint Liquidity
        // See https://docs.uniswap.org/contracts/v4/quickstart/create-pool
        bytes[] memory multicallParams = new bytes[](2);

        // 1. Initialize the parameters provided to multicall()
        int24 tickSpacing = 60;
        PoolKey memory poolKey = PoolKey(
            Currency.wrap(address(token0)),
            Currency.wrap(address(token1)),
            3000,
            tickSpacing,
            IHooks(address(0))
        );
        // 3. Encode the initializePool parameters
        uint160 startingPrice = Constants.SQRT_PRICE_1_1;
        multicallParams[0] = abi.encodeWithSelector(
            contracts.v4PositionManager.initializePool.selector,
            poolKey,
            startingPrice
        );
        // 4. Initialize the mint-liquidity parameters
        bytes memory mintActions = abi.encodePacked(
            uint8(Actions.MINT_POSITION),
            uint8(Actions.SETTLE_PAIR)
        );
        // 5. Encode the MINT_POSITION parameters
        int24 tickLower = (TickMath.getTickAtSqrtPrice(
            Constants.SQRT_PRICE_1_2
        ) / tickSpacing) * tickSpacing;
        int24 tickUpper = (TickMath.getTickAtSqrtPrice(
            Constants.SQRT_PRICE_2_1
        ) / tickSpacing) * tickSpacing;
        uint256 liquidity = LiquidityAmounts.getLiquidityForAmounts(
            startingPrice,
            TickMath.getSqrtPriceAtTick(tickLower),
            TickMath.getSqrtPriceAtTick(tickUpper),
            100 ether,
            100 ether
        ); // Encodes a 100/100 position at 1:1 price across the entire tick range
        bytes[] memory mintParams = new bytes[](2);
        mintParams[0] = abi.encode(
            poolKey,
            tickLower,
            tickUpper,
            liquidity,
            50_000 ether,
            50_000 ether,
            msg.sender,
            ZERO_BYTES
        );
        // 6. Encode the SETTLE_PAIR parameters
        mintParams[1] = abi.encode(poolKey.currency0, poolKey.currency1);
        // 7. Encode the modifyLiquidites call
        uint256 deadline = block.timestamp + 60;
        multicallParams[1] = abi.encodeWithSelector(
            contracts.v4PositionManager.modifyLiquidities.selector,
            abi.encode(mintActions, mintParams),
            deadline
        );
        // 8. Approve the tokens
        // Done Above
        // 9. Execute the multicall
        contracts.v4PositionManager.multicall(multicallParams);
        uint256 currentLiquidity = contracts.stateView.getLiquidity(
            PoolIdLibrary.toId(poolKey)
        );
        assertGt(currentLiquidity, 0);

        console2.log("liquidity:", currentLiquidity);
        console2.log("tokenA:", tokenA.balanceOf(msg.sender));
        console2.log("tokenB:", tokenB.balanceOf(msg.sender));

        // Swap
        // See https://docs.uniswap.org/contracts/v4/quickstart/swap
        // 3.2: Encoding the Swap Command
        bytes memory routerCommands = abi.encodePacked(uint8(Commands.V4_SWAP));
        bytes[] memory routerInputs = new bytes[](1);
        // 3.3: Action Encoding
        // Encode V4Router actions
        bytes memory swapActions = abi.encodePacked(
            uint8(Actions.SWAP_EXACT_IN_SINGLE),
            uint8(Actions.SETTLE_ALL),
            uint8(Actions.TAKE_ALL)
        );
        // 3.4: Preparing the Swap Inputs
        bytes[] memory swapParams = new bytes[](3);

        // SWAP_EXACT_IN_SINGLE: swap configuration
        uint128 amountIn = 1_000_000;
        uint128 minAmountOut = 0;
        swapParams[0] = abi.encode(
            IV4Router.ExactInputSingleParams({
                poolKey: poolKey,
                zeroForOne: true, // true if we're swapping token0 for token1
                amountIn: amountIn, // amount of tokens we're swapping
                amountOutMinimum: minAmountOut, // minimum amount we expect to receive
                hookData: bytes("") // no hook data needed
            })
        );
        console2.log("swapParams[0]:");
        console2.logBytes(swapParams[0]);

        // SETTLE_ALL: specify input tokens for the swap
        swapParams[1] = abi.encode(poolKey.currency0, amountIn);
        // TAKE_ALL: specify output tokens from the swap
        swapParams[2] = abi.encode(poolKey.currency1, minAmountOut);

        // 3.5: Executing the Swap
        // Combine actions and params into inputs
        routerInputs[0] = abi.encode(swapActions, swapParams);
        // Execute the swap
        contracts.router.execute(
            routerCommands,
            routerInputs,
            block.timestamp + 60
        );

        // 3.6: (Optional) Verifying the Swap Output
        console2.log("tokenA:", tokenA.balanceOf(msg.sender));
        console2.log("tokenB:", tokenB.balanceOf(msg.sender));
    }

    function deployUniswapContracts() public returns (UniswapContracts memory) {
        // deployCreate2Deployer();
        IAllowanceTransfer permit2 = deployPermit2();

        UnsupportedProtocol unsupported = new UnsupportedProtocol{
            salt: BYTES32_ZERO
        }();

        IPoolManager v4PoolManager = IPoolManager(
            address(new PoolManager{salt: BYTES32_ZERO}(address(0)))
        );

        IPositionManager v4PositionManager = IPositionManager(
            new PositionManager(
                v4PoolManager,
                permit2,
                300_000,
                IPositionDescriptor(address(0)),
                IWETH9(address(0))
            )
        );

        RouterParameters memory routerParams = RouterParameters({
            permit2: address(permit2),
            weth9: address(0),
            v2Factory: address(0),
            v3Factory: address(0),
            pairInitCodeHash: BYTES32_ZERO,
            poolInitCodeHash: BYTES32_ZERO,
            v4PoolManager: address(v4PoolManager),
            v3NFTPositionManager: address(0),
            v4PositionManager: address(v4PositionManager)
        });

        UniversalRouter router = new UniversalRouter{salt: BYTES32_ZERO}(
            routerParams
        );

        IV4Quoter v4Quoter = IV4Quoter(
            address(new V4Quoter{salt: BYTES32_ZERO}(v4PoolManager))
        );
        IStateView stateView = IStateView(
            address(new StateView{salt: BYTES32_ZERO}(v4PoolManager))
        );

        return
            UniswapContracts({
                permit2: permit2,
                unsupported: unsupported,
                v4PoolManager: v4PoolManager,
                v4PositionManager: v4PositionManager,
                router: router,
                v4Quoter: v4Quoter,
                stateView: stateView
            });
    }
}
