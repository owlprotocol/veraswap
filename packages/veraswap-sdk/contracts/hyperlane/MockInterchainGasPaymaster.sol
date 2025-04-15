// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IInterchainGasPaymaster} from "@hyperlane-xyz/core/interfaces/IInterchainGasPaymaster.sol";

/**
 * @title MockInterchainGasPaymaster
 * @dev Mock implementation of InterchainGasPaymaster for local testing
 */
contract MockInterchainGasPaymaster is IInterchainGasPaymaster {
    // 1 * 10^6 gas * 10^-9 eth (1 gwei) = 0.001 ether
    uint256 public constant FIXED_GAS_PAYMENT = 0.001 ether;

    function quoteGasPayment(uint32 _destinationDomain, uint256 _gasAmount) external pure override returns (uint256) {
        return FIXED_GAS_PAYMENT;
    }

    function payForGas(
        bytes32 _messageId,
        uint32 _destinationDomain,
        uint256 _gasAmount,
        address _refundAddress
    ) external payable override {
        revert("MockInterchainGasPaymaster: payForGas not implemented");
    }
}
