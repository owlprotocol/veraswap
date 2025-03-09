// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {PoolManager} from "@uniswap/v4-core/src/PoolManager.sol";
import {Create2Utils} from "./Create2Utils.sol";

library PoolManagerUtils {
    function getDeployBytecode(address owner) internal pure returns (bytes memory) {
        return abi.encodePacked(type(PoolManager).creationCode, abi.encode(owner));
    }

    function getOrCreate2(address owner) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode(owner));
        if (!exists) {
            addr = address(new PoolManager{salt: Create2Utils.BYTES32_ZERO}(owner));
        }
    }
}
