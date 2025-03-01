// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {UnsupportedProtocol} from "@uniswap/universal-router/contracts/deploy/UnsupportedProtocol.sol";
import {Create2Utils} from "./Create2Utils.sol";

library UnsupportedProtocolUtils {
    function getDeployBytecode() internal pure returns (bytes memory) {
        return type(UnsupportedProtocol).creationCode;
    }

    function getOrCreate2() internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode());
        if (!exists) {
            addr = address(new UnsupportedProtocol{salt: Create2Utils.BYTES32_ZERO}());
        }
    }
}
