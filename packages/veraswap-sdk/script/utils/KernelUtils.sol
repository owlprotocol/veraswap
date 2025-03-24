// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {Kernel} from "@zerodev/kernel/Kernel.sol";
import {IEntryPoint} from "@zerodev/kernel/interfaces/IEntryPoint.sol";
import {Create2Utils} from "./Create2Utils.sol";

library KernelUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode(address entrypoint) internal pure returns (bytes memory) {
        return abi.encodePacked(type(Kernel).creationCode, abi.encode(entrypoint));
    }

    function getOrCreate2(address entrypoint) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode(entrypoint));
        if (!exists) {
            address deployed = address(new Kernel{salt: Create2Utils.BYTES32_ZERO}(IEntryPoint(entrypoint)));
            vm.assertEq(deployed, addr);
        }
    }
}
