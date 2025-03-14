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
        address router = 0x6aa638Fe70021Cf4A9Ce34c2E7718b99d4360efD;

        // Deploy canonical tokens
        // (address tokenAAddr, ) = MockERC20Utils.getOrCreate2("Token A", "A", 18);
        // (address tokenBAddr, ) = MockERC20Utils.getOrCreate2("Token B", "B", 18);
        address v4PositionManager = 0x97b4242a6CDe1437E7C8B3e79F3F2e99Cf90899A;
        address v4StateView = 0xC3E8977ebaB56512E16194ee84A895b15987fb22;
        // MockERC20
        // address tokenAAddr = 0xFA306dFDe7632a6c74bdaBbBB19fA59c7A78D73B;
        // address tokenBAddr = 0xf79509E6faDC7254D59d49Bcd976d5523177ec4f;
        // SuperchainERC20
        address tokenAAddr = 0x48824f0345964D1002bF4Ddd1F72BA99B5dbE5d5;
        address tokenBAddr = 0x5710586e8D18F2e1c54c7a2247c1977578B11809;
        IERC20 tokenA = IERC20(tokenAAddr);
        IERC20 tokenB = IERC20(tokenBAddr);

        PoolUtils.setupToken(tokenA, IPositionManager(v4PositionManager), IUniversalRouter(router));
        PoolUtils.setupToken(tokenB, IPositionManager(v4PositionManager), IUniversalRouter(router));
        PoolUtils.deployPool(tokenA, tokenB, IPositionManager(v4PositionManager), IStateView(v4StateView));

        vm.stopBroadcast();
    }
}
