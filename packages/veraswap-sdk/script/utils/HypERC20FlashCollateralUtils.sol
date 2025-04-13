// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {HypERC20FlashCollateral} from "contracts/token/HypERC20FlashCollateral.sol";
import {Create2Utils} from "./Create2Utils.sol";

library HypERC20FlashCollateralUtils {
    function getDeployBytecode(address token, address mailbox) internal pure returns (bytes memory) {
        return abi.encodePacked(type(HypERC20FlashCollateral).creationCode, abi.encode(token, mailbox));
    }

    function getOrCreate2(address token, address mailbox) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode(token, mailbox));
        if (!exists) {
            addr = address(new HypERC20FlashCollateral{salt: Create2Utils.BYTES32_ZERO}(token, mailbox));
            // initialize with msg.sender as owner
            HypERC20FlashCollateral(addr).initialize(address(0), address(0), msg.sender);
        }
    }

    function getAddress(address token, address mailbox) internal pure returns (address addr) {
        addr = Create2Utils.getAddress(getDeployBytecode(token, mailbox));
    }
}
