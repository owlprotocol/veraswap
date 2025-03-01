// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {Create2Utils} from "./Create2Utils.sol";
import {UniversalRouterApprovedReentrant} from "contracts/UniversalRouterApprovedReentrant.sol";

library UniversalRouterApprovedReentrantUtils {
    function getDeployBytecode(RouterParameters memory params) internal pure returns (bytes memory) {
        return abi.encodePacked(type(UniversalRouterApprovedReentrant).creationCode, abi.encode(params));
    }

    function getOrCreate2(RouterParameters memory params) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode(params));
        if (!exists) {
            addr = address(new UniversalRouterApprovedReentrant{salt: Create2Utils.BYTES32_ZERO}(params));
        }
    }
}
