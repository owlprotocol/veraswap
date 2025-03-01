// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/console2.sol";
import "forge-std/Script.sol";

import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {UnsupportedProtocolUtils} from "./utils/UnsupportedProtocolUtils.sol";
import {PoolManagerUtils} from "./utils/PoolManagerUtils.sol";
import {PositionManagerUtils} from "./utils/PositionManagerUtils.sol";
import {StateViewUtils} from "./utils/StateViewUtils.sol";
import {V4QuoterUtils} from "./utils/V4QuoterUtils.sol";
import {UniversalRouterApprovedReentrantUtils} from "./utils/UniversalRouterApprovedReentrantUtils.sol";

contract DeployParameters is Script {
    bytes32 constant BYTES32_ZERO = bytes32(0);
    address constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

    function run() external virtual {
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
        (address router, ) = UniversalRouterApprovedReentrantUtils.getOrCreate2(routerParams);

        console2.log("unsupported:", unsupported);
        console2.log("v4PoolManager:", v4PoolManager);
        console2.log("v4PositionManager:", v4PositionManager);
        console2.log("v4StateView:", v4StateView);
        console2.log("v4Quoter:", v4Quoter);
        console2.log("router:", router);
    }
}
