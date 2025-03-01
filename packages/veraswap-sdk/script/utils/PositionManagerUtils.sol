// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {PositionManager} from "@uniswap/v4-periphery/src/PositionManager.sol";
import {Create2Utils} from "./Create2Utils.sol";

library PositionManagerUtils {
    address constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

    function getDeployBytecode(address poolManager) internal returns (bytes memory) {
        return
            abi.encodePacked(
                type(PositionManager).creationCode,
                poolManager,
                PERMIT2,
                uint256(300_000),
                address(0),
                address(0)
            );
    }

    function getOrCreate2(address owner) internal returns (address expected, bool exists) {
        return Create2Utils.getOrCreate2(getDeployBytecode(owner));
    }
}
