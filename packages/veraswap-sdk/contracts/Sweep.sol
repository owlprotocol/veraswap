// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {CurrencyLibrary, Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {Lock} from "@uniswap/universal-router/contracts/base/Lock.sol";

/**
 * @notice Base contract for sweeper contracts that are designed to sweep full balance of native/erc20 balance to a custom contract.
 * Such contracts are particularly useful for composing with bridging protocols when the amount to bridge is dynamic.
 * WARNING: Do not keep any balance on this contract between transactions as anyone can sweep the balance.
 * WARNING: Consider reentrancy risks if inheriting from this contract, especially if sweeping multiple tokens at a time.
 */
abstract contract Sweep is Lock {
    uint256 constant MAX_UINT = 2 ** 256 - 1;

    /**
     * @notice Call any ERC20 and approve all balance to the recipient. Needed to allow composability with contracts that pull tokens.
     * @dev Do NOT keep balance on this contract between transactions as they can be taken by anyone
     * @param token The token
     * @param spender The spender
     * @return bool if succeeded
     */
    function approveAll(address token, address spender) external returns (bool) {
        // Approve infinite balance to router
        return IERC20(token).approve(address(spender), MAX_UINT);
    }

    /**
     * @notice Sweep full balance of a token to a recipient. If token is address(0) then native balance is swept.
     * @dev Do NOT keep balance on this contract between transactions as they can be taken by anyone
     * @param token The token
     * @param recipient The recipient
     * @return balance The amount swept
     */
    function sweep(address token, address recipient) external isNotLocked returns (uint256 balance) {
        return _sweep(token, recipient);
    }

    /**
     * @notice Sweep full balance of a token to a recipient. If token is address(0) then native balance is swept.
     * @dev Do NOT keep balance on this contract between transactions as they can be taken by anyone
     * @dev Consider re-entrancy risks when using this internal function
     * @param token The token
     * @param recipient The recipient
     * @return balance The amount swept
     */
    function _sweep(address token, address recipient) internal returns (uint256 balance) {
        Currency currency = Currency.wrap(token);
        balance = currency.balanceOfSelf();

        if (balance > 0) {
            currency.transfer(recipient, balance);
        }
    }

    // Used to receive native token for any payments
    receive() external payable {}
}
