// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {HypTokenRouterSweep} from "contracts/hyperlane/HypTokenRouterSweep.sol";
import {Create2Utils} from "./Create2Utils.sol";

library HypTokenRouterSweepUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode() internal pure returns (bytes memory) {
        return abi.encodePacked(type(HypTokenRouterSweep).creationCode);
    }

    function getOrCreate2() internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode());
        if (!exists) {
            address deployed = address(new HypTokenRouterSweep{salt: Create2Utils.BYTES32_ZERO}());
            vm.assertEq(deployed, addr);
        }
    }
}
