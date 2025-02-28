// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.24;

import {Locker} from "@uniswap/universal-router/contracts/libraries/Locker.sol";
import {HypERC20Collateral} from "@hyperlane-xyz/core/token/HypERC20Collateral.sol";
import {TokenMessage} from "@hyperlane-xyz/core/token/libs/TokenMessage.sol";
import {TokenRouter} from "@hyperlane-xyz/core/token/libs/TokenRouter.sol";

/// @title HypERC20FlashCollateral
/// @notice Extends HypERC20Collateral to support flash accounting based deposits (see https://docs.uniswap.org/contracts/v4/concepts/flash-accounting)
/// @dev To avoid reentrancy, the standard `transferRemote` external functions are protected with a Lock
contract HypERC20FlashCollateral is TokenRouter, HypERC20Collateral {
    /// @notice Thrown when attempting to reenter when collateral is locked
    error ContractLocked();
    error ContractUnlocked();

    // The slot holding the balance, transiently. bytes32(uint256(keccak256("Balance")) - 1)
    bytes32 constant BALANCE_SLOT = 0x545608d0a01d2b02351975382c359965b0d9b259ce065eb8c064f439aa519304;

    constructor(address erc20, address _mailbox) HypERC20Collateral(erc20, _mailbox) {}

    // Critical: Messages are dispatched to Mailbox
    error TargetIsMailbox();
    // Unclear if these are needed but for good measure
    error TargetIsHook();
    error TargetIsISM();

    error NegativeBalanceDelta();

    /**
     * @notice Lock collateral contract to track balance
     * @dev Stores current balance using TSTORE
     */
    function transferRemoteLock() external virtual returns (uint256 balanceCurrent) {
        // Can only be called if unlocked
        if (Locker.get() != address(0)) revert ContractLocked();
        // Lock contract to track balance delta
        Locker.set(msg.sender);

        // Get balance
        balanceCurrent = wrappedToken.balanceOf(address(this));
        // Set balance
        assembly ("memory-safe") {
            tstore(BALANCE_SLOT, balanceCurrent)
        }
    }

    /**
     * @notice Transfers token balance delta to `_recipient` on `_destination` domain using flash accounting.
     * @dev Emits `SentTransferRemote` event on the origin chain.
     * @dev No need to check lock as balance will always be if contract is not locked
     * @param _destination The identifier of the destination chain.
     * @param _recipient The address of the recipient on the destination chain.
     * @return messageId The identifier of the dispatched message.
     */
    function transferRemoteUnlock(
        uint32 _destination,
        bytes32 _recipient
    ) external payable virtual returns (bytes32 messageId) {
        // Can only be called if locked
        if (Locker.get() == address(0)) revert ContractUnlocked();
        // Unlock contract to reset to initial state
        Locker.set(address(0));

        // Get previous balance
        uint256 balancePrevious;
        assembly ("memory-safe") {
            balancePrevious := tload(BALANCE_SLOT)
            tstore(BALANCE_SLOT, 0) // clear as contract is now unlocked
        }
        // Get new balance
        uint256 balanceNext = wrappedToken.balanceOf(address(this));
        // Get balance delta
        int256 balanceDelta = int256(balanceNext) - int256(balancePrevious);
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
        bytes memory _tokenMessage = TokenMessage.format(_recipient, _amount, bytes(""));
        messageId = _Router_dispatch(_destination, _value, _tokenMessage, _hookMetadata, _hook);
        emit SentTransferRemote(_destination, _recipient, _amount);
    }

    /**** Standard Hyperlane TokenRouter external functions with reentrancy lock ****/
    /// @inheritdoc TokenRouter
    function transferRemote(
        uint32 _destination,
        bytes32 _recipient,
        uint256 _amount
    ) external payable virtual override returns (bytes32 messageId) {
        // Can only be called if unlocked
        if (Locker.get() != address(0)) revert ContractLocked();

        return _transferRemote(_destination, _recipient, _amount, msg.value);
    }

    /// @inheritdoc TokenRouter
    function transferRemote(
        uint32 _destination,
        bytes32 _recipient,
        uint256 _amount,
        bytes calldata _hookMetadata,
        address _hook
    ) external payable virtual override returns (bytes32 messageId) {
        // Can only be called if unlocked
        if (Locker.get() != address(0)) revert ContractLocked();

        return _transferRemote(_destination, _recipient, _amount, msg.value, _hookMetadata, _hook);
    }
}
