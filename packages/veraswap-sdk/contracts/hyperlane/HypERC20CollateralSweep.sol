// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {HypERC20Collateral} from "@hyperlane-xyz/core/token/HypERC20Collateral.sol";

/// @notice Middleware contract designed to call `transferRemote` on HypERC20Collateral with full balance
/// This contract approves its full `wrappedToken` balance to the HypERC20Collateral on deployment
/// This contract is useful for EOA batching of swap + bridge by setting the receiver as this contract and
/// then sending the full token balance to the user on the destination chain
/// This contract is more generally useful if the bridge amount is dynamic and we just wish to send all tokens
contract HypERC20CollateralSweep {
    IERC20 public immutable wrappedToken;
    HypERC20Collateral public immutable collateral;

    error BalanceZero();

    constructor(HypERC20Collateral _collateral) {
        collateral = _collateral;

        wrappedToken = IERC20(_collateral.wrappedToken());
        // Approve infinite balance to router
        wrappedToken.approve(address(_collateral), uint256(-1));
    }

    /// @notice Call HypERC20Collateral with `transferRemote` using this contract's full balance. (msg.value is forwarded for relay payment)
    /// @dev Contract balance MUST be > 0 to work. Do NOT keep balance on this contract between transactions as they can be taken by anyone
    /// @param destination The identifier of the destination chain.
    /// @param recipient The address of the recipient on the destination chain.
    /// @return messageId The identifier of the dispatched message.
    function transferRemote(uint32 destination, bytes32 recipient) external payable returns (bytes32 messageId) {
        uint256 balance = wrappedToken.balanceOf(address(this));
        if (balance == 0) revert BalanceZero();

        return collateral.transferRemote{value: msg.value}(destination, recipient, balance);
    }

    /// @notice Call HypERC20Collateral with `transferRemote` using this contract's full balance. (msg.value is forwarded for relay payment)
    /// @dev Contract balance MUST be > 0 to work. Do NOT keep balance on this contract between transactions as they can be taken by anyone
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
        uint256 balance = wrappedToken.balanceOf(address(this));
        if (balance == 0) revert BalanceZero();

        return collateral.transferRemote{value: msg.value}(destination, recipient, balance, hookMetadata, hook);
    }
}
