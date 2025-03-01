// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {PoolManager} from "@uniswap/v4-core/src/PoolManager.sol";
import {Create2Utils} from "./Create2Utils.sol";

library PoolManagerUtils {
    function getDeployBytecode(address owner) internal returns (bytes memory) {
        return abi.encodePacked(type(PoolManager).creationCode, owner);
    }

    function getOrCreate2(address owner) internal returns (address expected, bool exists) {
        return Create2Utils.getOrCreate2(getDeployBytecode(owner));
    }
}
