// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "forge-std/console2.sol";

import {SuperchainTokenBridgeSweepUtils} from "./utils/SuperchainTokenBridgeSweepUtils.sol";

contract DeploySuperchainTokenBridgeSweep is Script {
    function run() external {
        vm.startBroadcast();
        deploySuperchainTokenBridgeSweep();
        vm.stopBroadcast();
    }

    function deploySuperchainTokenBridgeSweep() internal returns (address addr, bool exists) {
        (addr, exists) = SuperchainTokenBridgeSweepUtils.getOrCreate2();
        console2.log("SuperchainTokenBridgeSweep:", addr);
    }
}
