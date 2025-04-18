import { atom } from "jotai";
import { atomWithMutation, atomWithQuery } from "jotai-tanstack-query";
import { TransactionType } from "@owlprotocol/veraswap-sdk";
import { Hash } from "viem";
import { sendTransactionMutationOptions, waitForTransactionReceiptQueryOptions } from "wagmi/query";
import { tokenInAmountAtom, tokenInAtom, tokenOutAtom, transactionTypeAtom } from "./tokens.js";
import { accountAtom } from "./account.js";
import { tokenInAccountBalanceAtom, tokenInAllowanceAccountToPermit2Atom } from "./token-balance.js";
import { config } from "@/config.js";
import { TransactionStep } from "@/components/TransactionStatusModal.js";

export type TransactionStepId = "swap" | "bridge" | "sendOrigin" | "transferRemote";

export enum SwapStep {
    CONNECT_WALLET = "Connect Wallet",
    SELECT_TOKEN = "Select a token",
    SELECT_TOKEN_AMOUNT = "Enter an amount",
    INSUFFICIENT_BALANCE = "Insufficient Balance",
    INSUFFICIENT_LIQUIDITY = "Insufficient Liquidity",
    APPROVE_PERMIT2 = "Approve Permit2",
    APPROVE_PERMIT2_UNISWAP_ROUTER = "Approve Uniswap Router",
    EXECUTE_SWAP = "Execute Swap",
    PENDING_SIGNATURE = "Waiting for wallet signature...",
    PENDING_TRANSACTION = "Waiting for transaction confirmation...",
    BRIDGING_NOT_SUPPORTED = "Bridging not supported",
    NOT_SUPPORTED = "Not supported",
}

/** Steps that disable the transaction button */
const enabledSteps = [
    SwapStep.APPROVE_PERMIT2,
    SwapStep.APPROVE_PERMIT2_UNISWAP_ROUTER,
    SwapStep.EXECUTE_SWAP,
    SwapStep.NOT_SUPPORTED,
];

export const isDisabledStep = (swapStep: SwapStep) => !enabledSteps.includes(swapStep);

export const getSwapStepMessage = (swapStep: SwapStep, transactionType: TransactionType | null) => {
    if (swapStep !== SwapStep.EXECUTE_SWAP) return swapStep;

    if (!transactionType) return swapStep;

    if (transactionType.type === "SWAP") {
        return "Execute Swap";
    }
    if (transactionType.type === "BRIDGE") {
        return "Execute Bridge";
    }
    if (transactionType.type === "SWAP_BRIDGE") {
        return "Execute Swap and Bridge";
    }
    if (transactionType.type === "BRIDGE_SWAP") {
        return "Execute Bridge and Swap";
    }
};

export const swapStepAtom = atom((get) => {
    // TODO: Could cause issues on account change
    const account = get(accountAtom);
    const tokenIn = get(tokenInAtom);
    const tokenOut = get(tokenOutAtom);
    const tokenInAmount = get(tokenInAmountAtom);
    const tokenInBalance = get(tokenInAccountBalanceAtom);
    const tokenInPermit2Allowance = get(tokenInAllowanceAccountToPermit2Atom);

    const transactionType = get(transactionTypeAtom);

    const mutation = get(sendTransactionMutationAtom);
    const hash = mutation.data;
    const receipt = get(waitForReceiptQueryAtom);

    if (account.address === undefined) {
        return SwapStep.CONNECT_WALLET;
    } else if (mutation.isPending) {
        return SwapStep.PENDING_SIGNATURE;
    } else if (hash && hash != receipt.data?.transactionHash) {
        return SwapStep.PENDING_TRANSACTION;
    } else if (tokenIn === null || tokenOut === null) {
        return SwapStep.SELECT_TOKEN;
    } else if (!transactionType) {
        return SwapStep.NOT_SUPPORTED;
    } else if (tokenInAmount === null) {
        return SwapStep.SELECT_TOKEN_AMOUNT;
    } else if (tokenInBalance === null || tokenInBalance < tokenInAmount) {
        return SwapStep.INSUFFICIENT_BALANCE;
    } else if (
        // tokenIn is not native, and we don't have enough allowance
        tokenIn.standard !== "NativeToken" &&
        (transactionType.type !== "BRIDGE" ||
            (transactionType.type === "BRIDGE" &&
                !(tokenIn.standard === "HypERC20" || tokenIn.standard === "SuperchainERC20"))) &&
        (tokenInPermit2Allowance === null || tokenInPermit2Allowance < tokenInAmount)
    ) {
        return SwapStep.APPROVE_PERMIT2;
    }

    return SwapStep.EXECUTE_SWAP;
});

// Set this atom after sending transaction
export const sendTransactionMutationAtom = atomWithMutation(() => {
    // Compute mutation based on swap step
    return sendTransactionMutationOptions(config);
});
export const waitForReceiptQueryAtom = atomWithQuery((get) => {
    const mutation = get(sendTransactionMutationAtom);
    const hash = mutation.data;
    return waitForTransactionReceiptQueryOptions(config, { hash });
});

export const transactionModalOpenAtom = atom<boolean>(false);
export const transactionStepsAtom = atom<TransactionStep[]>([]);
export const currentTransactionStepIdAtom = atom<TransactionStepId | undefined>(undefined);
export const transactionHashesAtom = atom<Record<TransactionStepId, string | undefined>>(
    {} as Record<TransactionStepId, string | undefined>,
);

export const updateTransactionStepAtom = atom(
    null,
    (get, set, update: { id: TransactionStepId; status: TransactionStep["status"] }) => {
        const steps = get(transactionStepsAtom);
        const updatedSteps = steps.map((step) => (step.id === update.id ? { ...step, status: update.status } : step));
        set(transactionStepsAtom, updatedSteps);

        if (update.status === "processing") {
            set(currentTransactionStepIdAtom, update.id);
        }
    },
);

export const initializeTransactionStepsAtom = atom(null, (_, set, transactionType: TransactionType) => {
    // Clear previous transaction hashes
    set(transactionHashesAtom, {} as Record<TransactionStepId, string | undefined>);

    const swapStep: TransactionStep = {
        id: "swap",
        title: "🤝 Swap",
        description: "Trading with your local Walmart 💵💵💵💵💵💵",
        status: "pending",
    };

    const sendOriginStep: TransactionStep = {
        id: "sendOrigin",
        title: "📤 Initiating Origin Transfer",
        description:
            "Catapulting your tokens across the blockchain abyss. Please keep arms and legs inside the vehicle. 🌌🎢",
        status: "pending",
    };

    const bridgeStep: TransactionStep = {
        id: "bridge",
        title: "🚀 Bridge",
        description: "Your token is traveling...",
        status: "pending",
    };

    const transferRemoteStep: TransactionStep = {
        id: "transferRemote",
        title: "🕊️ Transfer Token",
        description: "We're freeing your token. Don't be impatient!",
        status: "pending",
    };

    let steps: TransactionStep[] = [];

    switch (transactionType.type) {
        case "SWAP":
            steps = [swapStep];
            break;
        case "BRIDGE":
            steps = [sendOriginStep, bridgeStep, transferRemoteStep];
            break;
        case "SWAP_BRIDGE":
            steps = [swapStep, bridgeStep, transferRemoteStep];
            break;
        case "BRIDGE_SWAP":
            steps = [sendOriginStep, bridgeStep, swapStep, transferRemoteStep];
            break;
    }

    set(transactionStepsAtom, steps);
    set(transactionModalOpenAtom, true);
});

export const bridgeMessageIdAtom = atom<Hash | null>(null);
export const swapMessageIdAtom = atom<Hash | null>(null);

export const superchainBridgeMessageIdAtom = atom<Hash | null>(null);

export const bridgeRemoteTransactionHashAtom = atom<Hash | null>(null);
export const swapRemoteTransactionHashAtom = atom<Hash | null>(null);
