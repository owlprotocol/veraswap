// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ECDSAValidator} from "@zerodev/kernel/validator/ECDSAValidator.sol";
import {Create2Utils} from "./Create2Utils.sol";

library ECDSAValidatorUtils {
    function getDeployBytecode() internal pure returns (bytes memory) {
        return abi.encodePacked(type(ECDSAValidator).creationCode);
    }

    function getOrCreate2() internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode());
        if (!exists) {
            addr = address(new ECDSAValidator{salt: Create2Utils.BYTES32_ZERO}());
        }
    }
}
