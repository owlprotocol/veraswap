// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {BasePaymaster} from "./BasePaymaster.sol";
import {SelfDestructTransfer} from "./SelfDestructTransfer.sol";
import {IEntryPoint, PackedUserOperation} from "@ERC4337/account-abstraction/contracts/interfaces/IEntryPoint.sol";

/// @title BalanceDeltaRefundPaymaster
/// @notice A paymaster that checks balance reimbursement per sender using transient storage
contract BalanceDeltaRefundPaymaster is BasePaymaster {
    /// @dev Reverts if a sender does not reimburse enough ETH to cover actual gas cost
    error BalanceNotReimbursed(address sender, uint256 nonce, uint256 reimbursed, uint256 actualGasCost);
    error RefundFailed(address sender, uint256 nonce, uint256 surplus);

    constructor(IEntryPoint _entryPoint, address _owner) BasePaymaster(_entryPoint, _owner) {}

    /// @notice Returns the sender's address as context for postOp
    function _validatePaymasterUserOp(
        PackedUserOperation calldata userOp,
        bytes32,
        uint256
    ) internal pure override returns (bytes memory context, uint256 validationData) {
        return (abi.encode(userOp.sender, userOp.nonce), 0);
    }

    /// @notice Verifies sender refunded at least the actual gas cost, updates transient balance
    function _postOp(PostOpMode, bytes calldata context, uint256 actualGasCost, uint256) internal override {
        (address sender, uint256 nonce) = abi.decode(context, (address, uint256));
        bytes32 slot = keccak256(abi.encodePacked(sender, nonce));

        uint256 reimbursed;
        assembly {
            reimbursed := tload(slot)
            tstore(slot, 0)
        }

        if (reimbursed < actualGasCost) {
            revert BalanceNotReimbursed(sender, nonce, reimbursed, actualGasCost);
        }

        uint256 surplus;
        unchecked {
            surplus = reimbursed - actualGasCost;
        }

        if (surplus > 0) {
            // Withdraw excess from EntryPoint
            entryPoint.withdrawTo(payable(address(this)), surplus);
            // Refund excess using selfdestruct transfer
            try new SelfDestructTransfer{value: surplus}(payable(sender)) {
                // success
            } catch {
                revert RefundFailed(sender, nonce, surplus);
            }
        }
    }

    /// @notice Receives ETH, deposits to EntryPoint, and attributes it to msg.sender
    function deposit(address sender, uint256 nonce) external payable {
        bytes32 slot = keccak256(abi.encodePacked(sender, nonce));
        uint256 previous;
        assembly {
            previous := tload(slot)
            tstore(slot, add(previous, callvalue()))
        }

        _deposit(msg.value);
    }

    receive() external payable {
        // Accept ETH deposits
        _requireFromEntryPoint();
    }
}
