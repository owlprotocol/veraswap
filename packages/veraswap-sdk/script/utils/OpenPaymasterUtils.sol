// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {OpenPaymaster} from "../../contracts/account-abstraction/OpenPaymaster.sol";
import {IEntryPoint} from "@ERC4337/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {Create2Utils} from "./Create2Utils.sol";

library OpenPaymasterUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode(address entryPoint, address owner) internal pure returns (bytes memory) {
        return abi.encodePacked(type(OpenPaymaster).creationCode, abi.encode(entryPoint, owner));
    }

    function getOrCreate2(address entryPoint, address owner) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode(entryPoint, owner));
        if (!exists) {
            address deployed = address(
                new OpenPaymaster{salt: Create2Utils.BYTES32_ZERO}(IEntryPoint(entryPoint), owner)
            );
            vm.assertEq(deployed, addr);
        }
    }
}
