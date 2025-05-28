// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {WETH} from "solmate/src/tokens/WETH.sol";

library WETHUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    bytes32 internal constant BYTES32_ZERO = bytes32(0);
    address constant weth9 = 0x4200000000000000000000000000000000000006; // Optimism pre-deploy WETH9

    function getOrEtch() internal returns (address addr, bool exists) {
        addr = weth9;
        exists = weth9.code.length > 0;

        if (!exists) {
            // Deploy WETH9 using Create2
            address deployed = address(new WETH{salt: BYTES32_ZERO}());
            // Etch code to the pre-deployed address
            vm.etch(weth9, deployed.code);
            vm.assertGt(weth9.code.length, 0);
        }
    }

    function getOrSetCode() internal returns (address addr, bool exists) {
        addr = weth9;
        exists = weth9.code.length > 0;

        if (!exists) {
            // Deploy WETH9 using Create2
            address deployed = address(new WETH{salt: BYTES32_ZERO}());
            // Set code to the pre-deployed address
            vm.rpc(
                "anvil_setCode",
                string.concat('["', vm.toString(address(weth9)), '","', vm.toString(deployed.code), '"]')
            );
            // vm.assertGt(weth9.code.length, 0);
        }
    }
}
