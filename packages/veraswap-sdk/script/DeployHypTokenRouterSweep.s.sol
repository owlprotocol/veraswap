// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "forge-std/console2.sol";

import {HypTokenRouterSweepUtils} from "./utils/HypTokenRouterSweepUtils.sol";

contract DeployHypTokenRouterSweep is Script {
    function run() external {
        vm.startBroadcast();
        deployHypTokenRouterSweep();
        vm.stopBroadcast();
    }

    function deployHypTokenRouterSweep() internal returns (address addr, bool exists) {
        (addr, exists) = HypTokenRouterSweepUtils.getOrCreate2();
        console2.log("HypTokenRouterSweep:", addr);
    }
}
