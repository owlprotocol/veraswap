// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/console2.sol";
import "forge-std/Script.sol";

import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";

import {MockERC20Utils} from "./utils/MockERC20Utils.sol";
import {UnsupportedProtocolUtils} from "./utils/UnsupportedProtocolUtils.sol";
import {PoolManagerUtils} from "./utils/PoolManagerUtils.sol";
import {PositionManagerUtils} from "./utils/PositionManagerUtils.sol";
import {StateViewUtils} from "./utils/StateViewUtils.sol";
import {V4QuoterUtils} from "./utils/V4QuoterUtils.sol";
import {UniversalRouterApprovedReentrantUtils} from "./utils/UniversalRouterApprovedReentrantUtils.sol";

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IPositionManager} from "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import {IStateView} from "@uniswap/v4-periphery/src/interfaces/IStateView.sol";
import {PoolUtils} from "./utils/PoolUtils.sol";

contract DeployUniswap is Script {
    bytes32 constant BYTES32_ZERO = bytes32(0);
    address constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

    function run() external virtual {
        vm.startBroadcast();

        (address unsupported, ) = UnsupportedProtocolUtils.getOrCreate2();
        (address v4PoolManager, ) = PoolManagerUtils.getOrCreate2(address(0));
        (address v4PositionManager, ) = PositionManagerUtils.getOrCreate2(v4PoolManager);
        (address v4StateView, ) = StateViewUtils.getOrCreate2(v4PoolManager);
        (address v4Quoter, ) = V4QuoterUtils.getOrCreate2(v4PoolManager);

        RouterParameters memory routerParams = RouterParameters({
            permit2: PERMIT2,
            weth9: 0x4200000000000000000000000000000000000006,
            v2Factory: unsupported,
            v3Factory: unsupported,
            pairInitCodeHash: BYTES32_ZERO,
            poolInitCodeHash: BYTES32_ZERO,
            v4PoolManager: v4PoolManager,
            v3NFTPositionManager: unsupported,
            v4PositionManager: v4PositionManager
        });
        // (address router, ) = UniversalRouterApprovedReentrantUtils.getOrCreate2(routerParams);

        console2.log("unsupported:", unsupported);
        console2.log("v4PoolManager:", v4PoolManager);
        console2.log("v4PositionManager:", v4PositionManager);
        console2.log("v4StateView:", v4StateView);
        console2.log("v4Quoter:", v4Quoter);

        // console2.log("router:", router);
        // address router = 0x6aa638Fe70021Cf4A9Ce34c2E7718b99d4360efD;

        // Deploy canonical tokens
        // (address tokenAAddr, ) = MockERC20Utils.getOrCreate2("Token A", "A", 18);
        // (address tokenBAddr, ) = MockERC20Utils.getOrCreate2("Token B", "B", 18);
        /*
        address tokenAAddr = 0xFA306dFDe7632a6c74bdaBbBB19fA59c7A78D73B;
        address tokenBAddr = 0xf79509E6faDC7254D59d49Bcd976d5523177ec4f;
        IERC20 tokenA = IERC20(tokenAAddr);
        IERC20 tokenB = IERC20(tokenBAddr);

        PoolUtils.setupToken(tokenA, IPositionManager(v4PositionManager), IUniversalRouter(router));
        PoolUtils.setupToken(tokenB, IPositionManager(v4PositionManager), IUniversalRouter(router));
        PoolUtils.deployPool(tokenA, tokenB, IPositionManager(v4PositionManager), IStateView(v4StateView));
        */
        vm.stopBroadcast();
    }
}
