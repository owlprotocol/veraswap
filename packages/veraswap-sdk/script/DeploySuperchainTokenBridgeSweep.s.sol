// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "forge-std/console2.sol";
import "forge-std/Test.sol";

import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {DeployParameters} from "./DeployParameters.s.sol";
import {SuperchainTokenBridgeSweep} from "../contracts/superchain/SuperchainTokenBridgeSweep.sol";

contract DeploySuperchainTokenBridgeSweep is DeployParameters {
    function run() external virtual override {
        vm.startBroadcast();
        deploySuperchainTokenBridgeSweep();
        vm.stopBroadcast();
    }

    function deploySuperchainTokenBridgeSweep() internal returns (address) {
        address sweepAddress = Create2.computeAddress(
            BYTES32_ZERO,
            keccak256(bytes.concat(type(SuperchainTokenBridgeSweep).creationCode)),
            DETERMINISTIC_DEPLOYER
        );

        if (sweepAddress.code.length == 0) {
            address deployed = address(new SuperchainTokenBridgeSweep{salt: BYTES32_ZERO}());
            assertEq(deployed, address(sweepAddress));
        }

        console2.log("Sweep Address:", sweepAddress);
        vm.stopBroadcast();
    }
}
