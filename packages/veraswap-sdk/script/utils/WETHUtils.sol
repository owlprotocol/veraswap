// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";
import {WETH} from "solmate/src/tokens/WETH.sol";
import {Create2Utils} from "./Create2Utils.sol";

library WETHUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    address constant opStackPreDeploy = 0x4200000000000000000000000000000000000006; // Optimism pre-deploy WETH9

    function getOrCreate2() internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(abi.encodePacked(type(WETH).creationCode));
        if (!exists) {
            address deployed = address(new WETH{salt: Create2Utils.BYTES32_ZERO}());
            vm.assertEq(deployed, addr);
        }
    }

    function getOrEtch(address target) internal returns (address addr, bool exists) {
        addr = target;
        exists = target.code.length > 0;

        if (!exists) {
            // Deploy WETH9 using Create2
            (address deployed, ) = getOrCreate2();
            // Etch code to the pre-deployed address
            vm.etch(target, deployed.code);
            vm.assertGt(target.code.length, 0);
        }
    }

    // TODO: Figure out why getOrSetCode does not work with Anvil on first run
    function getOrSetCode(address target) internal returns (address addr, bool exists) {
        addr = target;
        exists = target.code.length > 0;

        if (!exists) {
            // Deploy WETH9 using Create2
            (address deployed, ) = getOrCreate2();
            // Set code to the pre-deployed address
            vm.rpc(
                "anvil_setCode",
                string.concat('["', vm.toString(address(target)), '","', vm.toString(deployed.code), '"]')
            );
            // vm.assertGt(weth9.code.length, 0);
        }
    }
}
