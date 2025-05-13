// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title SelfDestructTransfer
/// @notice Transfers ETH to `to` using selfdestruct to bypass fallback/receive
contract SelfDestructTransfer {
    constructor(address payable to) payable {
        selfdestruct(to);
    }
}
