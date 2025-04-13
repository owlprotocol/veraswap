// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {Create2Utils} from "./Create2Utils.sol";
import {UniversalRouterApprovedReentrant} from "contracts/UniversalRouterApprovedReentrant.sol";

library UniversalRouterApprovedReentrantUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode(RouterParameters memory params) internal pure returns (bytes memory) {
        return abi.encodePacked(type(UniversalRouterApprovedReentrant).creationCode, abi.encode(params));
    }

    function getOrCreate2(RouterParameters memory params) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode(params));
        if (!exists) {
            address deployed = address(new UniversalRouterApprovedReentrant{salt: Create2Utils.BYTES32_ZERO}(params));
            vm.assertEq(deployed, addr);
        }
    }
}
