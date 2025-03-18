import { atom } from "jotai";
import { getAccount } from "@wagmi/core";
import { SwapType } from "@owlprotocol/veraswap-sdk";
import { sendTransactionMutationAtom, swapTypeAtom, waitForReceiptQueryAtom } from "./transaction.js";
import { tokenInAtom, tokenOutAtom } from "./tokens.js";
import { networkTypeAtom } from "./chain.js";
import { tokenInBalanceAtom } from "./token-balance.js";
import { tokenInPermit2AllowanceAtom, tokenInRouterAllowanceAtom } from "./allowance.js";
import { remoteTokenInfoAtom, tokenInAmountAtom, tokenInAmountInputAtom } from "./index.js";
import { config } from "@/config.js";

export enum SwapStep {
    CONNECT_WALLET = "Connect Wallet",
    SELECT_TOKEN = "Select a token",
    SELECT_TOKEN_AMOUNT = "Enter an amount",
    INSUFFICIENT_BALANCE = "Insufficient Balance",
    INSUFFICIENT_LIQUIDITY = "Insufficient Liquidity",
    APPROVE_PERMIT2 = "Approve Permit2",
    APPROVE_UNISWAP_ROUTER = "Approve Uniswap Router",
    EXECUTE_SWAP = "Execute Swap",
    PENDING_SIGNATURE = "Waiting for wallet signature...",
    PENDING_TRANSACTION = "Waiting for transaction confirmation...",
    BRIDGING_NOT_SUPPORTED = "Bridging not supported",
}

export const swapStepAtom = atom((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config);
    const tokenIn = get(tokenInAtom);
    const tokenOut = get(tokenOutAtom);
    const tokenInAmount = get(tokenInAmountAtom);
    const tokenInBalance = get(tokenInBalanceAtom);
    const tokenInPermit2Allowance = get(tokenInPermit2AllowanceAtom);
    const tokenInRouterAllowance = get(tokenInRouterAllowanceAtom);

    const mutation = get(sendTransactionMutationAtom);
    const hash = mutation.data;
    const receipt = get(waitForReceiptQueryAtom);

    const swapType = get(swapTypeAtom);
    const networkType = get(networkTypeAtom);

    const remoteTokenInfo = get(remoteTokenInfoAtom);

    const bridgeAddress = remoteTokenInfo?.remoteBridgeAddress ?? remoteTokenInfo?.remoteTokenAddress;

    if (account.address === undefined) return SwapStep.CONNECT_WALLET;
    if (mutation.isPending) return SwapStep.PENDING_SIGNATURE;
    if (hash && hash != receipt.data?.transactionHash) return SwapStep.PENDING_TRANSACTION;
    if (tokenIn === null || tokenOut === null) return SwapStep.SELECT_TOKEN;
    if (tokenInAmount === null) return SwapStep.SELECT_TOKEN_AMOUNT;
    if (swapType === SwapType.SwapAndBridge && networkType !== "superchain" && !bridgeAddress)
        return SwapStep.BRIDGING_NOT_SUPPORTED;
    if (tokenInBalance === null || tokenInBalance < tokenInAmount) return SwapStep.INSUFFICIENT_BALANCE;
    if (tokenInPermit2Allowance === null || tokenInPermit2Allowance < tokenInAmount) return SwapStep.APPROVE_PERMIT2;
    if (tokenInRouterAllowance === null || tokenInRouterAllowance < tokenInAmount)
        return SwapStep.APPROVE_UNISWAP_ROUTER;

    return SwapStep.EXECUTE_SWAP;
});

export const swapInvertAtom = atom(null, (get, set) => {
    const currentTokenIn = get(tokenInAtom);
    const currentTokenOut = get(tokenOutAtom);

    set(tokenInAtom, currentTokenOut);
    set(tokenOutAtom, currentTokenIn);

    set(tokenInAmountInputAtom, "");
});
