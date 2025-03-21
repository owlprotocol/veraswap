// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {OwnableSignatureExecutor} from "@rhinestone/core-modules/OwnableSignatureExecutor/OwnableSignatureExecutor.sol";
import {Create2Utils} from "./Create2Utils.sol";

library OwnableSignatureExecutorUtils {
    function getDeployBytecode() internal pure returns (bytes memory) {
        return abi.encodePacked(type(OwnableSignatureExecutor).creationCode);
    }

    function getOrCreate2() internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode());
        if (!exists) {
            addr = address(new OwnableSignatureExecutor{salt: Create2Utils.BYTES32_ZERO}());
        }
    }
}
