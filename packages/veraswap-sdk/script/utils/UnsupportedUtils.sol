// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {UnsupportedProtocol} from "@uniswap/universal-router/contracts/deploy/UnsupportedProtocol.sol";
import {Create2Utils} from "./Create2Utils.sol";

library UnsupportedProtocolUtils {
    function getDeployBytecode() internal returns (bytes memory) {
        return type(UnsupportedProtocol).creationCode;
    }

    function getOrCreate2() internal returns (address expected, bool exists) {
        return Create2Utils.getOrCreate2(getDeployBytecode());
    }
}
