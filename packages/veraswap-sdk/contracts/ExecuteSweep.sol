// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IAllowanceTransfer} from "permit2/src/interfaces/IAllowanceTransfer.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

/// @notice Middleware contract designed to allow arbitrary calls while disallowing approval/permit2 changes other than max approval
contract ExecuteSweep {
    error CallTargetPermit2();
    error CallSelectorApprove();

    address internal constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

    /// @notice Call any ERC20 and approve all balance to the recipient, useful for contracts that require ERC20/Permit2 approvals
    /// @dev Do NOT keep balance on this contract between transactions as they can be taken by anyone
    /// @param token The token
    /// @param spender The spender
    function approveAll(address token, address spender) external {
        // Approve infinite balance to router
        IERC20(token).approve(spender, type(uint256).max);
        if (spender != PERMIT2) {
            IAllowanceTransfer(PERMIT2).approve(token, spender, type(uint160).max, type(uint48).max);
        }
    }

    function execute(address target, bytes calldata data, uint256 value) external payable returns (bytes memory) {
        if (target == PERMIT2) {
            // Permit2 is not allowed to be called from this contract to avoid allowance changes
            revert CallTargetPermit2();
        }

        bytes4 selector = bytes4(data[:4]);
        if (selector == IERC20.approve.selector) {
            // Permit2 is not allowed to be called from this contract to avoid allowance changes
            revert CallSelectorApprove();
        }

        return Address.functionCallWithValue(target, data, value);
    }

    receive() external payable {}
}
