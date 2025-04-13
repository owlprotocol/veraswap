// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {StateView} from "@uniswap/universal-router/lib/v4-periphery/src/lens/StateView.sol";
import {Create2Utils} from "./Create2Utils.sol";

library StateViewUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode(address poolManager) internal pure returns (bytes memory) {
        return abi.encodePacked(type(StateView).creationCode, abi.encode(poolManager));
    }

    function getOrCreate2(address poolManager) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode(poolManager));
        if (!exists) {
            address deployed = address(new StateView{salt: Create2Utils.BYTES32_ZERO}(IPoolManager(poolManager)));
            vm.assertEq(deployed, addr);
        }
    }
}
