// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {BasePaymaster} from "./BasePaymaster.sol";
import {SelfDestructTransfer} from "./SelfDestructTransfer.sol";
import {IEntryPoint, PackedUserOperation} from "@ERC4337/account-abstraction/contracts/interfaces/IEntryPoint.sol";

//TODO: Figure out how to rebalance paymaster balance with its entrypoint deposit
// Some risks include
// - paymaster balance is insufficient to cover refund of userOp because too much was sent to entrypoint
// Some ideas
// - public function that re-deposits current balance to entrypoint
// - owner only function that re-deposits current balance to entrypoint
// - if in postOp insufficient balance, withdraw enough from entrypoint to cover refund (this is an edge case)

/// @title BalanceDeltaPaymaster
/// @notice A paymaster that checks gas reimbursement using transient storage
contract BalanceDeltaPaymaster is BasePaymaster {
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
            // Refund excess using selfdestruct transfer
            try new SelfDestructTransfer{value: surplus}(payable(sender)) {
                // success
            } catch {
                revert RefundFailed(sender, nonce, surplus);
            }
        }
    }

    /// @notice Receives ETH and updates the transient balance for the sender/nonce pair
    function payUserOp(address sender, uint256 nonce) external payable {
        bytes32 slot = keccak256(abi.encodePacked(sender, nonce));
        uint256 previous;
        assembly {
            previous := tload(slot)
            tstore(slot, add(previous, callvalue()))
        }
    }
}
