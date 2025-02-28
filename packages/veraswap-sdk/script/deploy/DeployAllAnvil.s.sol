// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/console2.sol";
import {DeployAll} from "../DeployAll.s.sol";

contract DeployAllAnvil is DeployAll {
    function setUp() public virtual override {}

    function run() external virtual override {
        vm.startBroadcast();

        deployCoreContracts();
        logParams();

        deployTokensAndPools();
        deployHypERC20FlashCollaterals();
        deployRouter();

        logDeployments();
        vm.stopBroadcast();
    }
}
