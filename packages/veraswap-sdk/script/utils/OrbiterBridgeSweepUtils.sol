// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {OrbiterBridgeSweep} from "contracts/orbiter/OrbiterBridgeSweep.sol";
import {Create2Utils} from "./Create2Utils.sol";

library OrbiterBridgeSweepUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode() internal pure returns (bytes memory) {
        return abi.encodePacked(type(OrbiterBridgeSweep).creationCode);
    }

    function getOrCreate2() internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode());
        if (!exists) {
            address deployed = address(new OrbiterBridgeSweep{salt: Create2Utils.BYTES32_ZERO}());
            vm.assertEq(deployed, addr);
        }
    }
}
