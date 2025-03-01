// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {StateView} from "@uniswap/universal-router/lib/v4-periphery/src/lens/StateView.sol";
import {Create2Utils} from "./Create2Utils.sol";

library StateViewUtils {
    address constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

    function getDeployBytecode(address poolManager) internal returns (bytes memory) {
        return abi.encodePacked(type(StateView).creationCode, poolManager);
    }

    function getOrCreate2(address owner) internal returns (address expected, bool exists) {
        return Create2Utils.getOrCreate2(getDeployBytecode(owner));
    }
}
