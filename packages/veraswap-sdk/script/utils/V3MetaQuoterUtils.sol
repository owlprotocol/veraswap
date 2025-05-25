// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {V3MetaQuoter} from "../../contracts/uniswap/v3/V3MetaQuoter.sol";
import {Create2Utils} from "./Create2Utils.sol";

library V3MetaQuoterUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode(address factory, bytes32 poolInitCodeHash) internal pure returns (bytes memory) {
        return abi.encodePacked(type(V3MetaQuoter).creationCode, abi.encode(factory, poolInitCodeHash));
    }

    function getOrCreate2(address factory, bytes32 poolInitCodeHash) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode(factory, poolInitCodeHash));
        if (!exists) {
            address deployed = address(new V3MetaQuoter{salt: Create2Utils.BYTES32_ZERO}(factory, poolInitCodeHash));
            vm.assertEq(deployed, addr);
        }
    }
}
