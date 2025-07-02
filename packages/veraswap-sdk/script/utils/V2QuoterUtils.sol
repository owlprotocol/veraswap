// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {V2Quoter} from "../../contracts/uniswap/v2/V2Quoter.sol";
import {Create2Utils} from "./Create2Utils.sol";

library V2QuoterUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode(address v2Factory, bytes32 v2PoolInitCodeHash) internal pure returns (bytes memory) {
        return abi.encodePacked(type(V2Quoter).creationCode, abi.encode(v2Factory, v2PoolInitCodeHash));
    }

    function getOrCreate2(address v2Factory, bytes32 v2PoolInitCodeHash) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode(v2Factory, v2PoolInitCodeHash));
        if (!exists) {
            address deployed = address(new V2Quoter{salt: Create2Utils.BYTES32_ZERO}(v2Factory, v2PoolInitCodeHash));
            vm.assertEq(deployed, addr);
        }
    }
}
