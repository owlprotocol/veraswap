// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";

/**
 * @notice Middleware designed to call an Orbiter contract and bridge tokens using any balance on
 * this contract instead of a fixed amount
 */
contract OrbiterBridgeSweep {
    error BalanceZero();
    error TransferFailed();

    struct ExecuteBridgeData {
        address recipient;
        address inputToken;
        uint256 inputAmount;
        bytes extData;
        bool unwrapped;
        address feeRecipient;
        uint256 feeAmount;
    }

    struct BridgeParams {
        address recipient;
        address inputToken;
        uint256 inputAmount;
        bytes extData;
        bool unwrapped;
        address feeRecipient;
        uint256 feeAmount;
    }

    // recipient, inputToken, inputAmount, extData, unwrapped, feeRecipient, feeAmount
    string executeBridgeSignature = "executeBridge((address,address,uint256,bytes,bool,address,uint256))";

    uint256 constant MAX_INT = 2 ** 256 - 1;

    /**
     * @notice Call any ERC20 and approve all balance to the recipient. Needed to allow
     * endpointContract to pull the tokens
     * @dev Do NOT keep balance on this contract between transactions as they can be taken by anyone
     * @param token The token
     * @param spender The spender
     * @return bool if succeeded
     */
    function approveAll(address token, address spender) external returns (bool) {
        // Approve infinite balance to router
        return IERC20(token).approve(address(spender), MAX_INT);
    }

    function getBalanceAdjusted(uint256 balance, uint32 orbiterChainId) internal pure returns (uint256) {
        uint256 balanceShifted = balance / 10000;
        uint256 balanceAdjusted;
        if (balanceShifted % 10000 == 999) {
            balanceAdjusted = balanceShifted * 10000 + 9000 + orbiterChainId;
        } else {
            balanceAdjusted = (balanceShifted - 1) * 10000 + 9000 + orbiterChainId;
        }
        return balanceAdjusted;
    }

    /**
     * @notice Call Orbiter contract using quote `to` and `data`, but set amount to the entire
     * balance of this contract
     * @dev Contract balance MUST be > 0 to work. Do NOT keep balance on this contract between
     * transactions as it can be taken by anyone
     * @param to The Orbiter contract to call. Derived from the Orbiter quoter
     * @param bridgeParams The parameters from decoding the quote bridge step `data` field
     */
    function bridgeAllETH(address payable to, BridgeParams calldata bridgeParams) external {
        uint256 balance = address(this).balance;
        if (balance == 0) revert BalanceZero();

        (bool success,) = to.call{value: balance}(
            abi.encodeWithSignature(
                executeBridgeSignature,
                ExecuteBridgeData({
                    recipient: bridgeParams.recipient,
                    inputToken: bridgeParams.inputToken,
                    inputAmount: balance,
                    extData: bridgeParams.extData,
                    unwrapped: bridgeParams.unwrapped,
                    feeRecipient: bridgeParams.feeRecipient,
                    feeAmount: bridgeParams.feeAmount
                })
            )
        );

        if (!success) {
            revert TransferFailed();
        }
    }

    /**
     * @notice Call Orbiter contract using quote `to` and `data`, but set amount to the entire
     * balance of this contract
     * @dev Contract `inputToken` balance MUST be > 0 to work. Do NOT keep balance on this contract
     * between transactions as it can be taken by anyone.
     * @param to The Orbiter contract to call. Derived from the Orbiter quoter
     * @param bridgeParams The parameters from decoding the quote bridge step `data` field
     */
    function bridgeAllToken(address payable to, BridgeParams calldata bridgeParams) external payable {
        uint256 balance = IERC20(bridgeParams.inputToken).balanceOf(address(this));
        if (balance == 0) revert BalanceZero();

        (bool success,) = to.call(
            abi.encodeWithSignature(
                executeBridgeSignature,
                ExecuteBridgeData({
                    recipient: bridgeParams.recipient,
                    inputToken: bridgeParams.inputToken,
                    inputAmount: balance,
                    extData: bridgeParams.extData,
                    unwrapped: bridgeParams.unwrapped,
                    feeRecipient: bridgeParams.feeRecipient,
                    feeAmount: bridgeParams.feeAmount
                })
            )
        );
        if (!success) {
            revert TransferFailed();
        }
    }

    receive() external payable {}
}
