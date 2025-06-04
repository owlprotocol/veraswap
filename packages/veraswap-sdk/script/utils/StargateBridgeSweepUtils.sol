// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {StargateBridgeSweep} from "contracts/stargate/StargateBridgeSweep.sol";
import {Create2Utils} from "./Create2Utils.sol";

library StargateBridgeSweepUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode() internal pure returns (bytes memory) {
        return abi.encodePacked(type(StargateBridgeSweep).creationCode);
    }

    function getOrCreate2() internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode());
        if (!exists) {
            address deployed = address(new StargateBridgeSweep{salt: Create2Utils.BYTES32_ZERO}());
            vm.assertEq(deployed, addr);
        }
    }

    function getAddressExists() internal view returns (address expected, bool contractExists) {
        return Create2Utils.getAddressExists(getDeployBytecode());
    }
}
