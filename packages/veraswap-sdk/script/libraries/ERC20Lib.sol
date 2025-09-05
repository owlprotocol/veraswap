// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

// ERC20
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IAllowanceTransfer} from "permit2/src/interfaces/IAllowanceTransfer.sol";

interface IERC20Mintable is IERC20 {
    function mint(address to, uint256 amount) external;
}

/**
 * @dev Library for ERC20 simple token operations such as managing approvals and minting
 * WARNING: Only use this from within forge scripts directly because we assume the account is msg.sender (not the contract address)
 */
library ERC20Library {
    IAllowanceTransfer constant permit2 = IAllowanceTransfer(0x000000000022D473030F116dDEE9F6B43aC78BA3);

    /**
     * @dev Mint a specific amount of tokens to an account to reach target amount
     */
    function mintAtLeast(IERC20 token, address account, uint256 target) internal {
        uint256 currentBalance = token.balanceOf(account);
        if (currentBalance < target) {
            IERC20Mintable(address(token)).mint(account, target - currentBalance);
        }
    }

    /**
     * @dev Approve a specific amount of tokens to a spender if current allowance is less than target amount
     */
    function approveAtLeast(IERC20 token, address spender, uint256 target) internal {
        // Note: Use msg.sender here because this is what is making the call in forge scripts
        uint256 currentAllowance = token.allowance(msg.sender, spender);
        if (currentAllowance < target) {
            token.approve(spender, target);
        }
    }

    function approveAll(IERC20 token, address spender) internal {
        approveAtLeast(token, spender, type(uint256).max);
    }

    /**
     * @dev Permit2 approve a specific amount of tokens to a spender if current allowance is less than target amount
     */
    function permit2ApproveAtLeast(IERC20 token, address spender, uint160 amount, uint48 expiration) internal {
        // Note: Use msg.sender here because this is what is making the call in forge scripts
        (uint160 currentAllowance, uint48 currentExpiration,) = permit2.allowance(msg.sender, address(token), spender);

        if (currentAllowance < amount || currentExpiration < expiration) {
            permit2.approve(address(token), spender, amount, expiration);
        }
    }

    function permit2ApproveAll(IERC20 token, address spender) internal {
        permit2ApproveAtLeast(token, spender, type(uint160).max, type(uint48).max);
    }
}
