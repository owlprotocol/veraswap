// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {StateView} from "@uniswap/universal-router/lib/v4-periphery/src/lens/StateView.sol";
import {Create2Utils} from "./Create2Utils.sol";

library StateViewUtils {
    function getDeployBytecode(address poolManager) internal pure returns (bytes memory) {
        return abi.encodePacked(type(StateView).creationCode, abi.encode(poolManager));
    }

    function getOrCreate2(address poolManager) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode(poolManager));
        if (!exists) {
            addr = address(new StateView{salt: Create2Utils.BYTES32_ZERO}(IPoolManager(poolManager)));
        }
    }
}
