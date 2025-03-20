// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {KernelFactory} from "@zerodev/kernel/factory/KernelFactory.sol";
import {Create2Utils} from "./Create2Utils.sol";

library KernelFactoryUtils {
    function getDeployBytecode(address implementation) internal pure returns (bytes memory) {
        return abi.encodePacked(type(KernelFactory).creationCode, abi.encode(implementation));
    }

    function getOrCreate2(address implementation) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode(implementation));
        if (!exists) {
            addr = address(new KernelFactory{salt: Create2Utils.BYTES32_ZERO}(implementation));
        }
    }
}
