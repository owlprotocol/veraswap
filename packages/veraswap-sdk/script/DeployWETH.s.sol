// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import "forge-std/console2.sol";
import {Script} from "forge-std/Script.sol";

// Contract Structs
import {WETHUtils} from "./utils/WETHUtils.sol";
import {ContractParams} from "./libraries/ContractParams.sol";

contract DeployWETH is Script {
    function run() external virtual {
        vm.startBroadcast();
        (address weth,) = WETHUtils.getOrCreate2();
        console2.log("WETH Deployed:", weth);
        vm.stopBroadcast();
    }
}
