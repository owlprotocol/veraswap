// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {V4Quoter} from "@uniswap/universal-router/lib/v4-periphery/src/lens/V4Quoter.sol";
import {Create2Utils} from "./Create2Utils.sol";

library V4QuoterUtils {
    function getDeployBytecode(address poolManager) internal returns (bytes memory) {
        return abi.encodePacked(type(V4Quoter).creationCode, poolManager);
    }

    function getOrCreate2(address poolManager) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode(poolManager));
        if (!exists) {
            addr = address(new V4Quoter{salt: Create2Utils.BYTES32_ZERO}(IPoolManager(poolManager)));
        }
    }
}
