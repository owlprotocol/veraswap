// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {HypERC20} from "@hyperlane-xyz/core/token/HypERC20.sol";
import {DeployParameters} from "./DeployParameters.s.sol";

abstract contract DeployHypERC20Synthetic is DeployParameters {
    function deployHypERC20Synthetics() internal {
        for (uint256 i = 0; i < tokens.length; i++) {
            tokenSynthetics.push(deployHypERC20Synthetic(address(tokens[i]), hyperlaneParams.mailbox));
        }
    }

    function deployHypERC20Synthetic(
        address mailbox,
        string memory name,
        string memory symbol,
        uint8 decimals
    ) internal returns (HypERC20 synthetic) {
        address syntheticAddress = Create2.computeAddress(
            BYTES32_ZERO,
            keccak256(abi.encodePacked(type(HypERC20).creationCode, abi.encode(decimals, mailbox))),
            DETERMINISTIC_DEPLOYER
        );
        synthetic = HypERC20(syntheticAddress);

        if (syntheticAddress.code.length == 0) {
            address deployed = address(new HypERC20{salt: BYTES32_ZERO}(decimals, mailbox));
            assertEq(deployed, syntheticAddress);
            synthetic.initialize(0, name, symbol, address(0), address(0), msg.sender);
        }
    }
}
