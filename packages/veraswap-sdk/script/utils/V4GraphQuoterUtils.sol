// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {V4GraphQuoter} from "../../contracts/uniswap/V4GraphQuoter.sol";
import {Create2Utils} from "./Create2Utils.sol";

library V4GraphQuoterUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode(address poolManager) internal pure returns (bytes memory) {
        return abi.encodePacked(type(V4GraphQuoter).creationCode, abi.encode(poolManager));
    }

    function getOrCreate2(address poolManager) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode(poolManager));
        if (!exists) {
            address deployed = address(new V4GraphQuoter{salt: Create2Utils.BYTES32_ZERO}(IPoolManager(poolManager)));
            vm.assertEq(deployed, addr);
        }
    }
}
