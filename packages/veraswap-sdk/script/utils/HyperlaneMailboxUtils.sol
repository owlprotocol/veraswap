// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {Create2Utils} from "./Create2Utils.sol";
import {Mailbox} from "@hyperlane-xyz/core/Mailbox.sol";

library HyperlaneMailboxUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode(uint32 chainId) internal pure returns (bytes memory) {
        return abi.encodePacked(type(Mailbox).creationCode, abi.encode(chainId));
    }

    function getOrCreate2(uint32 chainId, address ism, address hook) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode(chainId));

        if (!exists) {
            address deployed = address(new Mailbox{salt: Create2Utils.BYTES32_ZERO}(chainId));
            vm.assertEq(deployed, addr);

            Mailbox(addr).initialize(msg.sender, ism, hook, hook);
        }
    }
}
