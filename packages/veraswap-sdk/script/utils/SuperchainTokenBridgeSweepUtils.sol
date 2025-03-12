// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {SuperchainTokenBridgeSweep} from "contracts/superchain/SuperchainTokenBridgeSweep.sol";
import {Create2Utils} from "./Create2Utils.sol";

library SuperchainTokenBridgeSweepUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode() internal pure returns (bytes memory) {
        return abi.encodePacked(type(SuperchainTokenBridgeSweep).creationCode);
    }

    function getOrCreate2() internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode());
        if (!exists) {
            address deployed = address(new SuperchainTokenBridgeSweep{salt: Create2Utils.BYTES32_ZERO}());
            vm.assertEq(deployed, addr);
        }
    }
}
