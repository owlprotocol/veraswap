// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {TokenRouter} from "@hyperlane-xyz/core/token/libs/TokenRouter.sol";

/// @notice Middleware contract designed to call `transferRemote` on TokenRouter with full balance
/// The contract is designed for modularity by supporting any custom TokenRouter passed in as the first parameter
/// This contract is useful for EOA batching of swap + bridge by setting the receiver as this contract and
/// then sending the full token balance to the user on the destination chain
/// This contract is more generally useful if the bridge amount is dynamic and we just wish to send all tokens
contract HypTokenRouterSweep {
    error BalanceZero();

    uint256 constant MAX_INT = 2 ** 256 - 1;

    /// @notice Call any ERC20 and approve all balance to the recipient, useful for collateral based routers that require approvals
    /// @dev Do NOT keep balance on this contract between transactions as they can be taken by anyone
    /// @param token The token
    /// @param spender The spender
    /// @return bool if succeeded
    function approveAll(address token, address spender) external returns (bool) {
        // Approve infinite balance to router
        return IERC20(token).approve(address(spender), MAX_INT);
    }

    /// @notice Call TokenRouter with `transferRemote` using this contract's full balance. (msg.value is forwarded for relay payment)
    /// @dev Contract balance MUST be > 0 to work. Do NOT keep balance on this contract between transactions as they can be taken by anyone
    /// @param router The TokenRouter
    /// @param destination The identifier of the destination chain.
    /// @param recipient The address of the recipient on the destination chain.
    /// @return messageId The identifier of the dispatched message.
    function transferRemote(
        address router,
        uint32 destination,
        bytes32 recipient
    ) external payable returns (bytes32 messageId) {
        uint256 balance = TokenRouter(router).balanceOf(address(this));
        if (balance == 0) revert BalanceZero();

        return TokenRouter(router).transferRemote{value: msg.value}(destination, recipient, balance);
    }

    /// @notice Call TokenRouter with `transferRemote` using this contract's full balance. (msg.value is forwarded for relay payment)
    /// @dev Contract balance MUST be > 0 to work. Do NOT keep balance on this contract between transactions as they can be taken by anyone
    /// @param router The TokenRouter
    /// @param destination The identifier of the destination chain.
    /// @param recipient The address of the recipient on the destination chain.
    /// @param hookMetadata The metadata passed into the hook
    /// @param hook The post dispatch hook to be called by the Mailbox
    /// @return messageId The identifier of the dispatched message.
    function transferRemote(
        address router,
        uint32 destination,
        bytes32 recipient,
        bytes calldata hookMetadata,
        address hook
    ) external payable returns (bytes32 messageId) {
        uint256 balance = TokenRouter(router).balanceOf(address(this));
        if (balance == 0) revert BalanceZero();

        return
            TokenRouter(router).transferRemote{value: msg.value}(destination, recipient, balance, hookMetadata, hook);
    }
}
