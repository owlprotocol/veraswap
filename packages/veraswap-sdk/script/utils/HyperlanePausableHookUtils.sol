// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Create2Utils} from "./Create2Utils.sol";
import {PausableHook} from "@hyperlane-xyz/core/hooks/PausableHook.sol";

library HyperlanePausableHookUtils {
    function getDeployBytecode() internal pure returns (bytes memory) {
        return abi.encodePacked(type(PausableHook).creationCode);
    }

    function getOrCreate2() internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode());
        if (!exists) {
            addr = address(new PausableHook{salt: Create2Utils.BYTES32_ZERO}());
        }
    }
}
