// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {
    IStargate, OFTReceipt, MessagingFee, SendParam
} from "@stargatefinance/stg-evm-v2/src/interfaces/IStargate.sol";
import {Sweep} from "../Sweep.sol";

/**
 * @notice Middleware designed to call a Stargate contract and bridge tokens using any balance on
 * this contract instead of a fixed amount
 */
contract StargateBridgeSweep is Sweep {
    error BalanceZero();
    error QuoteAmountTooLow();
    error TransferFailed();

    struct BridgeParams {
        address recipient;
        bytes32 recipientPadded; // Recipient address padded to 32 bytes
        uint32 dstEid;
        bytes extraOptions;
        bytes composeMsg;
        bytes oftCmd; // 0x0 for taxi, 0x1 for bus
    }

    bool internal constant payInLzToken = false;

    /**
     * @notice Get stargate bridging quote for sending tokens
     * @param pool the Stargate pool to quote the fee from
     * @param sendParam the OFT parameters for sending tokens
     * @return nativeFee the native fee required to send the tokens
     * @return minAmountLD the minimum amount of token to be received on the destination chain
     */
    function getQuote(IStargate pool, SendParam memory sendParam)
        internal
        view
        returns (uint256 nativeFee, uint256 minAmountLD)
    {
        (,, OFTReceipt memory receipt) = pool.quoteOFT(sendParam);

        if (receipt.amountReceivedLD == 0) revert QuoteAmountTooLow();

        minAmountLD = receipt.amountReceivedLD;
        sendParam.minAmountLD = minAmountLD;

        MessagingFee memory messagingFee = pool.quoteSend(sendParam, payInLzToken);

        nativeFee = messagingFee.nativeFee;
    }

    /**
     * @notice Bridge ETH balance of this sweeper with Stargate.
     * Gets a quote for the entire balance, and requotes to account for fee. Any leftover balance
     * is refunded to the recipient.
     * @dev Contract balance MUST be > 0 to work. Do NOT keep balance on this contract between
     * transactions as it can be taken by anyone.
     * @param to The Stargate native pool contract
     * @param refundAddress The address to refund any excess fees too
     * @param bridgeParams The parameters from decoding the quote bridge step `data` field
     */
    function bridgeAllETH(address payable to, address payable refundAddress, BridgeParams calldata bridgeParams)
        external
        isNotLocked
    {
        uint256 balance = address(this).balance;
        if (balance == 0) revert BalanceZero();

        IStargate pool = IStargate(to);

        SendParam memory sendParam = SendParam({
            dstEid: bridgeParams.dstEid,
            to: bridgeParams.recipientPadded,
            amountLD: balance,
            minAmountLD: balance,
            extraOptions: bridgeParams.extraOptions,
            composeMsg: bridgeParams.composeMsg,
            oftCmd: bridgeParams.oftCmd
        });

        (uint256 nativeFeeFullAmount,) = getQuote(pool, sendParam);

        uint256 amountFeeRemoved = balance - nativeFeeFullAmount;

        sendParam.amountLD = amountFeeRemoved;
        sendParam.minAmountLD = amountFeeRemoved;

        (uint256 nativeFee, uint256 minAmountLDFeeRemoved) = getQuote(pool, sendParam);

        sendParam.minAmountLD = minAmountLDFeeRemoved;

        MessagingFee memory fee = MessagingFee({nativeFee: nativeFee, lzTokenFee: 0});

        pool.sendToken{value: balance}({_sendParam: sendParam, _fee: fee, _refundAddress: refundAddress});

        // Refund user with any excess native tokens
        if (refundAddress != address(0)) {
            _sweep(address(0), refundAddress);
        }
    }

    /**
     * @notice Bridge a token balance of this sweeper with Stargate
     * @dev Contract `inputToken` balance MUST be > 0 to work. Do NOT keep balance on this contract
     * between transactions as it can be taken by anyone
     * @param to The Stargate token pool contract
     * @param inputToken The token to bridge
     * @param refundAddress The address to refund any excess fees too
     * @param bridgeParams The parameters from decoding the quote bridge step `data` field
     */
    function bridgeAllToken(
        address payable to,
        address inputToken,
        address refundAddress,
        BridgeParams calldata bridgeParams
    ) external payable isNotLocked {
        uint256 balance = IERC20(inputToken).balanceOf(address(this));
        if (balance == 0) revert BalanceZero();

        IStargate pool = IStargate(to);

        SendParam memory sendParam = SendParam({
            dstEid: bridgeParams.dstEid,
            to: bridgeParams.recipientPadded,
            amountLD: balance,
            minAmountLD: balance,
            extraOptions: bridgeParams.extraOptions,
            composeMsg: bridgeParams.composeMsg,
            oftCmd: bridgeParams.oftCmd
        });

        (uint256 nativeFee, uint256 minAmountLd) = getQuote(pool, sendParam);

        sendParam.minAmountLD = minAmountLd;

        MessagingFee memory fee = MessagingFee({nativeFee: nativeFee, lzTokenFee: 0});

        pool.sendToken{value: nativeFee}({_sendParam: sendParam, _fee: fee, _refundAddress: refundAddress});

        // Refund user with any excess native tokens
        if (refundAddress != address(0)) {
            _sweep(address(0), refundAddress);
        }
    }
}
