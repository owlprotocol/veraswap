// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IInterchainGasPaymaster} from "@hyperlane-xyz/core/interfaces/IInterchainGasPaymaster.sol";

/**
 * @title MockInterchainGasPaymaster
 * @dev Mock implementation of InterchainGasPaymaster for local testing
 */
contract MockInterchainGasPaymaster is IInterchainGasPaymaster {
    // Fixed gas price of 1 gwei
    uint256 public constant FIXED_GAS_PRICE = 1 gwei;

    function quoteGasPayment(uint32 _destinationDomain, uint256 _gasAmount) external pure override returns (uint256) {
        return _gasAmount * FIXED_GAS_PRICE;
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
