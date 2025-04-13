// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {HypERC20Collateral} from "@hyperlane-xyz/core/token/HypERC20Collateral.sol";

import {Create2Utils} from "./Create2Utils.sol";

library HypERC20CollateralUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode(address token, address mailbox) internal pure returns (bytes memory) {
        return abi.encodePacked(type(HypERC20Collateral).creationCode, abi.encode(token, mailbox));
    }

    function getOrCreate2(address token, address mailbox) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode(token, mailbox));
        if (!exists) {
            address deployed = address(new HypERC20Collateral{salt: Create2Utils.BYTES32_ZERO}(token, mailbox));
            vm.assertEq(deployed, addr);
            // initialivm.assertEq(deployed, addr);ze with msg.sender as owner
            HypERC20Collateral(addr).initialize(address(0), address(0), msg.sender);
        }
    }

    function getAddress(address token, address mailbox) internal pure returns (address addr) {
        addr = Create2Utils.getAddress(getDeployBytecode(token, mailbox));
    }

    function enrollRemoteRouter(address collateral, uint32 remoteChainId, address remoteToken) internal {
        HypERC20Collateral(collateral).enrollRemoteRouter(remoteChainId, bytes32(uint256(uint160(remoteToken))));
    }
}
