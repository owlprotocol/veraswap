// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IOrbiterXRouter} from "./IOrbiterXRouter.sol";

/// @notice Middleware designed to call an orbiter endpoint contract and bridge tokens
contract OrbiterBridgeSweep {
    error BalanceZero();

    uint256 constant MAX_INT = 2 ** 256 - 1;

    /// @notice Call any ERC20 and approve all balance to the recipient. Needed to allow endpointContract to pull the tokens
    /// @dev Do NOT keep balance on this contract between transactions as they can be taken by anyone
    /// @param token The token
    /// @param spender The spender
    /// @return bool if succeeded
    function approveAll(address token, address spender) external returns (bool) {
        // Approve infinite balance to router
        return IERC20(token).approve(address(spender), MAX_INT);
    }

    function getBalanceAdjusted(uint256 balance, uint32 orbiterChainId) pure internal returns (uint256) {
        uint256 balanceShifted = balance / 10000;
        uint256 balanceAdjusted;
        if (balanceShifted % 10000 == 999) {
            balanceAdjusted = balanceShifted * 10000 + 9000 + orbiterChainId;
        } else {
            balanceAdjusted = (balanceShifted - 1) * 10000 + 9000 + orbiterChainId;
        }
        return balanceAdjusted;
    }

    /// @notice Call Orbiter endpoint contract with `transfer` using as much of this contract's balance as possible. Leftover balance will be sent to the recipient.
    /// @dev Contract balance MUST be > 0 to work. Do NOT keep balance on this contract between transactions as they can be taken by anyone
    /// @param recipient The recipient of the transfer
    /// @param endpointContract The Orbiter endpoint contract
    /// @param orbiterChainId The Orbiter destination chain id
    /// @param endpoint The address of the orbiter endpoint on the destination chain.
    /// @param transferData The data to be passed to the endpoint contract, an encoded string
    function bridgeAllETH(
        address payable recipient,
        address endpointContract,
        uint32 orbiterChainId,
        address endpoint,
        bytes calldata transferData
    ) external payable {
        uint256 balance = address(this).balance;
        if (balance == 0) revert BalanceZero();

        uint256 balanceAdjusted = getBalanceAdjusted(balance, orbiterChainId);

        IOrbiterXRouter(endpointContract).transfer{value: balanceAdjusted}(endpoint, transferData);

        recipient.transfer(balance - balanceAdjusted);
    }

    /// @notice Call Orbiter endpoint contract with `transferToken` using as much of this contract's balance as possible. (msg.value is forwarded for relay payment)
    /// @dev Contract balance MUST be > 0 to work. Do NOT keep balance on this contract between transactions as they can be taken by anyone
    /// @param recipient The recipient of the transfer
    /// @param token the token to bridge
    /// @param endpointContract The Orbiter endpoint contract
    /// @param orbiterChainId The Orbiter destination chain id
    /// @param endpoint The address of the orbiter endpoint on the destination chain.
    /// @param transferData The data to be passed to the endpoint contract, an encoded string
    function bridgeAllToken(
        address recipient,
        address token,
        address endpointContract,
        uint32 orbiterChainId,
        address endpoint,
        bytes calldata transferData
    ) external payable {
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance == 0) revert BalanceZero();

        uint256 balanceAdjusted = getBalanceAdjusted(balance, orbiterChainId);

        IOrbiterXRouter(endpointContract).transferToken(IERC20(token), endpoint, balanceAdjusted, transferData);

        IERC20(token).transfer(recipient, balance - balanceAdjusted);
    }

    receive() external payable {}
}
