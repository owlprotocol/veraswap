// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {BasePaymaster} from "./BasePaymaster.sol";
import {IEntryPoint, PackedUserOperation} from "@ERC4337/account-abstraction/contracts/interfaces/IEntryPoint.sol";

/// @title BalanceDeltaPaymaster
/// @notice A paymaster that checks balance reimbursement per sender using transient storage
contract BalanceDeltaPaymaster is BasePaymaster {
    /// @dev Reverts if a sender does not reimburse enough ETH to cover actual gas cost
    error BalanceNotReimbursed(address sender, uint256 reimbursed, uint256 actualGasCost);

    constructor(IEntryPoint _entryPoint, address _owner) BasePaymaster(_entryPoint, _owner) {}

    /// @notice Returns the sender's address as context for postOp
    function _validatePaymasterUserOp(
        PackedUserOperation calldata userOp,
        bytes32,
        uint256
    ) internal pure override returns (bytes memory context, uint256 validationData) {
        return (abi.encode(userOp.sender), 0);
    }

    /// @notice Verifies sender refunded at least the actual gas cost, updates transient balance
    function _postOp(PostOpMode, bytes calldata context, uint256 actualGasCost, uint256) internal override {
        address sender = abi.decode(context, (address));
        bytes32 slot = bytes32(uint256(uint160(sender)));

        uint256 reimbursed;
        assembly {
            reimbursed := tload(slot)
        }

        if (reimbursed < actualGasCost) {
            revert BalanceNotReimbursed(sender, reimbursed, actualGasCost);
        }

        uint256 remaining;
        unchecked {
            remaining = reimbursed - actualGasCost;
        }

        assembly {
            tstore(slot, remaining)
        }
    }

    /// @notice Receives ETH, deposits to EntryPoint, and attributes it to msg.sender
    function deposit() external payable {
        bytes32 slot = bytes32(uint256(uint160(msg.sender)));
        uint256 previous;
        assembly {
            previous := tload(slot)
            tstore(slot, add(previous, callvalue()))
        }

        _deposit(msg.value);
    }
}
