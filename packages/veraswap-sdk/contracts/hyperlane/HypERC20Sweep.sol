// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.24;

import {HypERC20} from "@hyperlane-xyz/core/token/HypERC20.sol";

/// @notice Middleware contract designed to call `transferRemote` on HypERC20 with full balance
/// The contract is designed for modularity by supporting any custom HypERC20 passed in as the first parameter
/// This contract is useful for EOA batching of swap + bridge by setting the receiver as this contract and
/// then sending the full token balance to the user on the destination chain
/// This contract is more generally useful if the bridge amount is dynamic and we just wish to send all tokens
contract HypERC20Sweep {
    error BalanceZero();

    /// @notice Call HypERC20 with `transferRemote` using this contract's full balance. (msg.value is forwarded for relay payment)
    /// @dev Contract balance MUST be > 0 to work. Do NOT keep balance on this contract between transactions as they can be taken by anyone
    /// @param token The HypERC20 token
    /// @param destination The identifier of the destination chain.
    /// @param recipient The address of the recipient on the destination chain.
    /// @return messageId The identifier of the dispatched message.
    function transferRemote(
        address token,
        uint32 destination,
        bytes32 recipient
    ) external payable returns (bytes32 messageId) {
        uint256 balance = HypERC20(token).balanceOf(address(this));
        if (balance == 0) revert BalanceZero();

        return HypERC20(token).transferRemote{value: msg.value}(destination, recipient, balance);
    }

    /// @notice Call HypERC20 with `transferRemote` using this contract's full balance. (msg.value is forwarded for relay payment)
    /// @dev Contract balance MUST be > 0 to work. Do NOT keep balance on this contract between transactions as they can be taken by anyone
    /// @param token The HypERC20 token
    /// @param destination The identifier of the destination chain.
    /// @param recipient The address of the recipient on the destination chain.
    /// @param hookMetadata The metadata passed into the hook
    /// @param hook The post dispatch hook to be called by the Mailbox
    /// @return messageId The identifier of the dispatched message.
    function transferRemote(
        address token,
        uint32 destination,
        bytes32 recipient,
        bytes calldata hookMetadata,
        address hook
    ) external payable returns (bytes32 messageId) {
        uint256 balance = HypERC20(token).balanceOf(address(this));
        if (balance == 0) revert BalanceZero();

        return HypERC20(token).transferRemote{value: msg.value}(destination, recipient, balance, hookMetadata, hook);
    }
}
