// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.24;

import {Lock} from "@uniswap/universal-router/contracts/base/Lock.sol";
import {HypERC20Collateral} from "@hyperlane-xyz/core/token/HypERC20Collateral.sol";
import {TokenMessage} from "@hyperlane-xyz/core/token/libs/TokenMessage.sol";
import {TokenRouter} from "@hyperlane-xyz/core/token/libs/TokenRouter.sol";

import {FlashERC20BalanceDelta} from "../libraries/FlashERC20BalanceDelta.sol";

/// @title HypERC20FlashCollateral
/// @notice Extends HypERC20Collateral to support flash accounting based deposits (see https://docs.uniswap.org/contracts/v4/concepts/flash-accounting)
/// @dev To avoid reentrancy, the standard `transferRemote` external functions are protected with a Lock
contract HypERC20FlashCollateral is TokenRouter, HypERC20Collateral, Lock {
    constructor(address erc20, address _mailbox) HypERC20Collateral(erc20, _mailbox) {}

    // Critical: Messages are dispatched to Mailbox
    error TargetIsMailbox();
    // Unclear if these are needed but for good measure
    error TargetIsHook();
    error TargetIsISM();

    error NegativeBalanceDelta();

    /**
     * @notice Transfers token balance delta to `_recipient` on `_destination` domain using flash accounting.
     * @dev Executes arbitrary call data to get ERC20 balance delta
     * @dev Emits `SentTransferRemote` event on the origin chain.
     * @param _destination The identifier of the destination chain.
     * @param _recipient The address of the recipient on the destination chain.
     * @param target The target call address
     * @return messageId The identifier of the dispatched message.
     */
    function transferRemoteFlash(
        uint32 _destination,
        bytes32 _recipient,
        address target,
        uint256 value,
        bytes calldata data
    ) external payable virtual isNotLocked returns (bytes32 messageId) {
        if (target == address(mailbox)) revert error TargetIsMailbox();
        if (target == address(hook)) revert error TargetIsHook();
        if (target == address(interchainSecurityModule)) revert error TargetIsISM();

        (, , int256 balanceDelta) = FlashERC20BalanceDelta.flashBalanceDelta(
            address(wrappedToken),
            address(this),
            target,
            value,
            data
        );
        if (balanceDelta <= 0) revert NegativeBalanceDelta(); // Should never occur since contract never gives approvals

        return _dispatchTokenMessage(_destination, _recipient, uint256(balanceDelta), msg.value);
    }

    /**
     * @notice Dispatches remote transfer message to `_recipient` on `_destination` without any token transfers
     * @dev Bypasses the `_transferFromSender` call in `_transferRemote`, this assumes collateral has been deposited
     * @dev Emits `SentTransferRemote` event on the origin chain.
     * @param _destination The identifier of the destination chain.
     * @param _recipient The address of the recipient on the destination chain.
     * @param _amount The amount of tokens to be sent to the remote recipient.
     * @param _value The value to be sent to pay for the Hyperlane message
     * @return messageId The identifier of the dispatched message.
     */
    function _dispatchTokenMessage(
        uint32 _destination,
        bytes32 _recipient,
        uint256 _amount,
        uint256 _value
    ) internal virtual returns (bytes32 messageId) {
        return
            _dispatchTokenMessage(
                _destination,
                _recipient,
                _amount,
                _value,
                _GasRouter_hookMetadata(_destination),
                address(hook)
            );
    }

    /**
     * @notice Dispatches remote transfer message to `_recipient` on `_destination` without any token transfers
     * @dev Bypasses the `_transferFromSender` call in `_transferRemote`, this assumes collateral has been deposited
     * @dev Emits `SentTransferRemote` event on the origin chain.
     * @param _destination The identifier of the destination chain.
     * @param _recipient The address of the recipient on the destination chain.
     * @param _amount The amount of tokens to be sent to the remote recipient.
     * @param _value The value to be sent to pay for the Hyperlane message
     * @param _hookMetadata The metadata passed into the hook
     * @param _hook The post dispatch hook to be called by the Mailbox
     * @return messageId The identifier of the dispatched message.
     */
    function _dispatchTokenMessage(
        uint32 _destination,
        bytes32 _recipient,
        uint256 _amount,
        uint256 _value,
        bytes memory _hookMetadata,
        address _hook
    ) internal virtual returns (bytes32 messageId) {
        bytes memory _tokenMetadata = _transferFromSender(_amount);
        bytes memory _tokenMessage = TokenMessage.format(_recipient, _amount, _tokenMetadata);

        messageId = _Router_dispatch(_destination, _value, _tokenMessage, _hookMetadata, _hook);

        emit SentTransferRemote(_destination, _recipient, _amount);
    }

    /**** Standard Hyperlane TokenRouter external functions with reentrancy lock ****/
    /// @inheritdoc TokenRouter
    function transferRemote(
        uint32 _destination,
        bytes32 _recipient,
        uint256 _amount
    ) external payable virtual override isNotLocked returns (bytes32 messageId) {
        return _transferRemote(_destination, _recipient, _amount, msg.value);
    }

    /// @inheritdoc TokenRouter
    function transferRemote(
        uint32 _destination,
        bytes32 _recipient,
        uint256 _amount,
        bytes calldata _hookMetadata,
        address _hook
    ) external payable virtual override isNotLocked returns (bytes32 messageId) {
        return _transferRemote(_destination, _recipient, _amount, msg.value, _hookMetadata, _hook);
    }
}
