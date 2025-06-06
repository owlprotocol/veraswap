// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {HypERC20} from "@hyperlane-xyz/core/token/HypERC20.sol";
import {Create2Utils} from "./Create2Utils.sol";

library HypERC20Utils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode(uint8 decimals, address mailbox) internal pure returns (bytes memory) {
        return abi.encodePacked(type(HypERC20).creationCode, abi.encode(decimals, mailbox));
    }

    function getOrCreate2(
        uint8 decimals,
        address mailbox,
        uint256 totalSupply,
        string memory name,
        string memory symbol
    ) internal returns (address addr, bool exists) {
        // Add init params as additional salt
        bytes32 salt = keccak256(abi.encode(totalSupply, name, symbol, msg.sender));
        bytes memory bytecode = getDeployBytecode(decimals, mailbox);
        addr = Create2.computeAddress(salt, keccak256(bytecode), Create2Utils.DETERMINISTIC_DEPLOYER);
        exists = address(addr).code.length > 0;

        if (!exists) {
            address deployed = address(new HypERC20{salt: salt}(decimals, mailbox));
            vm.assertEq(deployed, addr);
            // initialize with msg.sender as owner
            HypERC20(addr).initialize(0, name, symbol, address(0), address(0), msg.sender);
        }
    }
    function enrollRemoteRouter(address hypERC20, uint32 remoteChainId, address remoteCollateral) internal {
        HypERC20(hypERC20).enrollRemoteRouter(remoteChainId, bytes32(uint256(uint160(remoteCollateral))));
    }
}
