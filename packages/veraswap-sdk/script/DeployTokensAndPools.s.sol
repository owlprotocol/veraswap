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
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";
import {IAllowanceTransfer} from "permit2/src/interfaces/IAllowanceTransfer.sol";

import {StateView} from "@uniswap/universal-router/lib/v4-periphery/src/lens/StateView.sol";

import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {DeployParameters} from "./DeployParameters.s.sol";

abstract contract DeployTokensAndPools is DeployParameters {
    MockERC20[] tokens;

    function deployTokensAndPools() internal {
        tokens.push(deployToken("Token A", "A", 18));
        tokens.push(deployToken("Token B", "B", 18));
        deployPool(tokens[0], tokens[1]);
    }

    function deployToken(string memory name, string memory symbol, uint8 decimals) internal returns (MockERC20 token) {
        address tokenAddress = Create2.computeAddress(
            BYTES32_ZERO,
            keccak256(abi.encodePacked(type(MockERC20).creationCode, abi.encode(name, symbol, decimals)))
        );
        token = MockERC20(tokenAddress);

        if (tokenAddress.code.length == 0) {
            address deployed = address(new MockERC20{salt: BYTES32_ZERO}(name, symbol, decimals));
            assertEq(deployed, address(token));

            // Mint
            token.mint(msg.sender, 100_000 ether);
            // Approve Permit2
            token.approve(address(params.permit2), type(uint256).max);
            // Approve PositionManager using Permit2
            IAllowanceTransfer(params.permit2).approve(
                address(token),
                params.v4PositionManager,
                type(uint160).max,
                type(uint48).max
            );
            // Approve UnversalRouter using Permit2
            IAllowanceTransfer(params.permit2).approve(
                address(token),
                address(router),
                type(uint160).max,
                type(uint48).max
            );
        }

        //TODO: Log token deployment
        // console2.log("Token", name, symbol, decimals, address(token));
    }

    // TODO: Check liquidity
    function deployPool(MockERC20 tokenA, MockERC20 tokenB) internal {
        MockERC20 token0;
        MockERC20 token1;
        if (uint160(address(tokenA)) < uint160(address(tokenB))) {
            token0 = tokenA;
            token1 = tokenB;
        } else {
            token0 = tokenB;
            token1 = tokenA;
        }

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
        //WANING UNCOMMENT
        multicallParams[0] = abi.encodeWithSelector(
            IPositionManager(params.v4PositionManager).initializePool.selector,
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
            IPositionManager.modifyLiquidities.selector,
            abi.encode(mintActions, mintParams),
            deadline
        );
        // 8. Approve the tokens
        // Done Above
        // 9. Execute the multicall
        IPositionManager(params.v4PositionManager).multicall(multicallParams);
        uint256 currentLiquidity = v4StateView.getLiquidity(PoolIdLibrary.toId(poolKey));
        assertGt(currentLiquidity, 0);
    }
}
