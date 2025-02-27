// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {Lock} from "@uniswap/universal-router/contracts/base/Lock.sol";
import {FlashERC20BalanceDelta} from "./libraries/FlashERC20BalanceDelta.sol";

contract FlashERC20BalanceCollateral is Lock {
    address immutable token;

    /// @notice Computes ERC20 balance delta pre and post execution
    /// @dev External function requires reentrancy lock, if using Permit2 target MUST NOT be Permit2
    /// @param target The target call address
    /// @param value The call value
    /// @param data The call data
    /// @return previousBalance The initial balance before execution
    /// @return nextBalance The new balance after execution
    /// @return delta Positive means balance increased, negative means balance decreased
    function flashBalanceDelta(
        address target,
        uint256 value,
        bytes calldata data
    ) internal isNotLocked returns (uint256 previousBalance, uint256 nextBalance, int256 delta) {
        return FlashERC20BalanceDelta.flashBalanceDelta(token, address(this), target, value, data);
    }
}
