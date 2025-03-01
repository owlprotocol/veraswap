// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {V4Quoter} from "@uniswap/universal-router/lib/v4-periphery/src/lens/V4Quoter.sol";
import {Create2Utils} from "./Create2Utils.sol";

library V4QuoterUtils {
    address constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

    function getDeployBytecode(address poolManager) internal returns (bytes memory) {
        return abi.encodePacked(type(V4Quoter).creationCode, poolManager);
    }

    function getOrCreate2(address poolManager) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode(poolManager));
        if (!exists) {
            addr = address(new V4Quoter{salt: Create2Utils.BYTES32_ZERO}(poolManager));
        }
    }
}
