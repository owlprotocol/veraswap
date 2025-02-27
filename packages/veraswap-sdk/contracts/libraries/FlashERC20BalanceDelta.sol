// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";

/**
 * Modify ERC20 balance using flash accounting. Can be used to accept ERC20 deposits without the need to pull tokens using transferFrom.
 * - Get previous ERC20 balance
 * - Execute arbitrary call data (excluding erc20)
 * - Get current ERC20 balance
 * WARNING: External function requires reentrancy lock
 * WARNING: If using Permit2, target MUST NOT be Permit2
 */
library FlashERC20BalanceDelta {
    error TargetIsToken();

    /// @notice Computes ERC20 balance delta pre and post execution
    /// @dev External function requires reentrancy lock, if using Permit2 target MUST NOT be Permit2
    /// @param token The token balance to fetch
    /// @param target The target call address
    /// @param value The call value
    /// @param data The call data
    /// @return previousBalance The initial balance before execution
    /// @return nextBalance The new balance after execution
    /// @return delta Positive means balance increased, negative means balance decreased
    function flashBalanceDelta(
        address token,
        address target,
        uint256 value,
        bytes calldata data
    ) internal returns (uint256 prevBalance, uint256 currBalance, int256 delta) {
        if (target == token) revert TargetIsToken();

        prevBalance = IERC20(token).balanceOf();
        target.call{value: value}(data);
        currBalance = IERC20(token).balanceOf();

        delta = currBalance - prevBalance;
    }
}
