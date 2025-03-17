// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Create2Utils} from "./Create2Utils.sol";
import {Mailbox} from "@hyperlane-xyz/core/Mailbox.sol";
import {NoopIsm} from "@hyperlane-xyz/core/isms/NoopIsm.sol";
import {PausableHook} from "@hyperlane-xyz/core/hooks/PausableHook.sol";

library HyperlaneUtils {
    function getISMDeployBytecode() internal pure returns (bytes memory) {
        return abi.encodePacked(type(NoopIsm).creationCode);
    }

    function getHookDeployBytecode() internal pure returns (bytes memory) {
        return abi.encodePacked(type(PausableHook).creationCode);
    }

    function getMailboxDeployBytecode(uint32 chainId) internal pure returns (bytes memory) {
        return abi.encodePacked(type(Mailbox).creationCode, abi.encode(chainId));
    }

    function getOrCreateISM() internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getISMDeployBytecode());
        if (!exists) {
            addr = address(new NoopIsm{salt: Create2Utils.BYTES32_ZERO}());
        }
    }

    function getOrCreateHook() internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getHookDeployBytecode());
        if (!exists) {
            addr = address(new PausableHook{salt: Create2Utils.BYTES32_ZERO}());
        }
    }

    function getOrCreateMailbox(uint32 chainId) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getMailboxDeployBytecode(chainId));
        if (!exists) {
            addr = address(new Mailbox{salt: Create2Utils.BYTES32_ZERO}(chainId));
        }
    }
}
