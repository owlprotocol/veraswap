// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {OwnableSignatureExecutor} from "../../contracts/executors/OwnableSignatureExecutor.sol";
import {Create2Utils} from "./Create2Utils.sol";

library OwnableSignatureExecutorUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode() internal pure returns (bytes memory) {
        return abi.encodePacked(type(OwnableSignatureExecutor).creationCode);
    }

    function getOrCreate2() internal returns (address addr, bool exists) {
        return getOrCreate2(Create2Utils.BYTES32_ZERO);
    }

    function getOrCreate2(bytes32 salt) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode(), salt);
        if (!exists) {
            address deployed = address(new OwnableSignatureExecutor{salt: salt}());
            vm.assertEq(deployed, addr);
        }
    }
}
