// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Locker} from "@uniswap/universal-router/contracts/libraries/Locker.sol";
import {ApprovedReentrant} from "./libraries/ApprovedReentrant.sol";

/// @title LockWithApprovedReentrant
/// @notice A contract that provides a reentrancy lock for external calls EXCEPT from an approved reentrant
contract LockWithApprovedReentrant {
    /// @notice Thrown when attempting to reenter a locked function from an external caller that is not an approved reentrant
    error ContractLocked();

    /// @notice Modifier enforcing a reentrancy lock that allows self-reentrancy and reentrancy from an approved reentrant
    /// @dev If the contract is not locked, use msg.sender as the locker
    modifier isNotLockedOrApprovedReentrant() {
        // Apply a reentrancy lock for all external callers EXCEPT for approved reentrant
        if (msg.sender != address(this)) {
            if (Locker.isLocked()) {
                if (msg.sender != ApprovedReentrant.get()) {
                    revert ContractLocked();
                }
                // Caller is approved reentrant, execute
                // Approved reentrant is NOT cleared and can reenter again
                _;
            } else {
                // Top-level call, lock contract and execute
                Locker.set(msg.sender);
                _;
                ApprovedReentrant.set(address(0)); // Top-level call done, clear approved reentrant
                Locker.set(address(0));
            }
        } else {
            // The contract is allowed to reenter itself, so the lock is not checked
            _;
        }
    }

    /// @notice return the current approved reentrant of the contract
    function _getApprovedReentrant() internal view returns (address) {
        return ApprovedReentrant.get();
    }

    /// @notice return the current locker of the contract
    function _getLocker() internal view returns (address) {
        return Locker.get();
    }
}
