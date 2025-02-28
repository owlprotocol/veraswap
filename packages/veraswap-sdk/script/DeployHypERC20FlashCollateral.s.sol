// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {HypERC20FlashCollateral} from "../contracts/token/HypERC20FlashCollateral.sol";
import {DeployParameters} from "./DeployParameters.s.sol";

abstract contract DeployHypERC20FlashCollateral is DeployParameters {
    function deployHypERC20FlashCollaterals() internal {
        for (uint256 i = 0; i < tokens.length; i++) {
            tokenCollaterals.push(deployHypERC20FlashCollateral(address(tokens[i]), hyperlaneParams.mailbox));
        }
    }

    function deployHypERC20FlashCollateral(
        address token,
        address mailbox
    ) internal returns (HypERC20FlashCollateral collateral) {
        address collateralAddress = Create2.computeAddress(
            BYTES32_ZERO,
            keccak256(abi.encodePacked(type(HypERC20FlashCollateral).creationCode, abi.encode(token, mailbox))),
            DETERMINISTIC_DEPLOYER
        );
        collateral = HypERC20FlashCollateral(collateralAddress);

        if (collateralAddress.code.length == 0) {
            address deployed = address(new HypERC20FlashCollateral{salt: BYTES32_ZERO}(token, mailbox));
            assertEq(deployed, collateralAddress);
        }
    }
}
