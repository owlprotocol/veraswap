// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {KernelFactory} from "@zerodev/kernel/factory/KernelFactory.sol";
import {Create2Utils} from "./Create2Utils.sol";

library KernelFactoryUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode(address implementation) internal pure returns (bytes memory) {
        return abi.encodePacked(type(KernelFactory).creationCode, abi.encode(implementation));
    }

    function getOrCreate2(address implementation) internal returns (address addr, bool exists) {
        return getOrCreate2(implementation, Create2Utils.BYTES32_ZERO);
    }

    function getOrCreate2(address implementation, bytes32 salt) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode(implementation));
        if (!exists) {
            address deployed = address(new KernelFactory{salt: salt}(implementation));
            vm.assertEq(deployed, addr);
        }
    }
}
