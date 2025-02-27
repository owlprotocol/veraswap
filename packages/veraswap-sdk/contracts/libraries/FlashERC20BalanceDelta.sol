// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";

/**
 * Modify ERC20 balance using flash accounting. Can be used to accept ERC20 deposits without the need to pull tokens using transferFrom.
 * - Get previous ERC20 balance
 * - Execute arbitrary call data (excluding erc20 & PERMIT2)
 * - Get current ERC20 balance
 */
library FlashERC20BalanceDelta {
    error TargetIsTokenOrPermit2();

    address constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

    /// @notice Computes ERC20 balance delta of an account pre and post execution
    /// @dev External function requires reentrancy lock
    /// @param token The token to fetch balance
    /// @param account The account to fetch balance (often address(this))
    /// @param target The target call address
    /// @param value The call value
    /// @param data The call data
    /// @return previousBalance The initial balance before execution
    /// @return nextBalance The new balance after execution
    /// @return delta Positive means balance increased, negative means balance decreased
    function flashBalanceDelta(
        address token,
        address account,
        address target,
        uint256 value,
        bytes calldata data
    ) internal returns (uint256 previousBalance, uint256 nextBalance, int256 delta) {
        if (target == token || target == PERMIT2) revert TargetIsTokenOrPermit2();

        previousBalance = IERC20(token).balanceOf(account);
        target.call{value: value}(data);
        nextBalance = IERC20(token).balanceOf(account);

        delta = int256(nextBalance) - int256(previousBalance);
    }
}
