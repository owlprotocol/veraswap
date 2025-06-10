import { atom } from "jotai";
import { atomWithMutation, atomWithQuery } from "jotai-tanstack-query";
import {
    isMultichainToken,
    STARGATE_POOL_NATIVE,
    TransactionType,
    STARGATE_TOKEN_POOLS,
} from "@owlprotocol/veraswap-sdk";
import { Hash } from "viem";
import { sendTransactionMutationOptions, waitForTransactionReceiptQueryOptions } from "wagmi/query";
import { tokenInAmountAtom, currencyInAtom, currencyOutAtom } from "./tokens.js";
import { accountAtom } from "./account.js";
import {
    amountOutAtom,
    tokenInAccountBalanceAtom,
    tokenInAllowanceAccountToPermit2Atom,
    tokenInAllowanceAccountToPoolAtom,
} from "./token-balance.js";
import { submittedTransactionTypeAtom, transactionTypeAtom } from "./uniswap.js";
import { orbiterRouterAtom } from "./orbiter.js";
import { config } from "@/config.js";
import { TransactionStep } from "@/components/TransactionStatusModal.js";

export type TransactionStepId = "swap" | "bridge" | "sendOrigin" | "transferRemote";

export enum SwapStep {
    CONNECT_WALLET = "Connect Wallet",
    SELECT_TOKEN = "Select a token",
    SELECT_TOKEN_AMOUNT = "Enter an amount",
    INSUFFICIENT_BALANCE = "Insufficient Balance",
    INSUFFICIENT_LIQUIDITY = "Insufficient Liquidity",
    AMOUNT_TOO_LOW = "Amount too low",
    APPROVE_PERMIT2 = "Approve Permit2",
    APPROVE_PERMIT2_UNISWAP_ROUTER = "Approve Uniswap Router",
    // APPROVE_POOL = "Approve Pool",
    EXECUTE_SWAP = "Execute Swap",
    PENDING_SIGNATURE = "Waiting for wallet signature...",
    PENDING_TRANSACTION = "Waiting for transaction confirmation...",
    BRIDGING_NOT_SUPPORTED = "Bridging not supported",
    NOT_SUPPORTED = "Not supported",
}

/** Steps that disable the transaction button */
const enabledSteps = [
    SwapStep.CONNECT_WALLET,
    SwapStep.APPROVE_PERMIT2,
    SwapStep.APPROVE_PERMIT2_UNISWAP_ROUTER,
    // SwapStep.APPROVE_POOL,
    SwapStep.EXECUTE_SWAP,
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
    const currencyIn = get(currencyInAtom);
    const currencyOut = get(currencyOutAtom);
    const tokenInAmount = get(tokenInAmountAtom);
    const tokenInBalance = get(tokenInAccountBalanceAtom);
    const tokenInPermit2Allowance = get(tokenInAllowanceAccountToPermit2Atom);
    const tokenInPoolAllowance = get(tokenInAllowanceAccountToPoolAtom);
    const amountOut = get(amountOutAtom);

    const orbiterRouter = get(orbiterRouterAtom);

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
    } else if (currencyIn === null || currencyOut === null) {
        return SwapStep.SELECT_TOKEN;
    } else if (tokenInAmount === null) {
        return SwapStep.SELECT_TOKEN_AMOUNT;
    } else if (!transactionType) {
        return SwapStep.NOT_SUPPORTED;
    } else if (
        (transactionType.type === "BRIDGE" || transactionType.type === "SWAP_BRIDGE") &&
        // Be clear if there is no quote because chains are not supported by bridge providers and the token is not a SuperERC20
        (!(currencyIn.chainId in STARGATE_POOL_NATIVE) || !(currencyOut.chainId in STARGATE_POOL_NATIVE)) &&
        !orbiterRouter &&
        !(isMultichainToken(currencyOut) && (currencyOut.isSuperERC20() || !!currencyOut.hyperlaneAddress))
    ) {
        return SwapStep.NOT_SUPPORTED;
    } else if (tokenInBalance === null || tokenInBalance < tokenInAmount) {
        return SwapStep.INSUFFICIENT_BALANCE;
    } else if (amountOut === "" || Number(amountOut) <= 0) {
        return SwapStep.AMOUNT_TOO_LOW;
    }
    // else if (
    //     transactionType.type === "BRIDGE" &&
    //     currencyIn.symbol &&
    //     currencyIn.symbol in STARGATE_TOKEN_POOLS &&
    //     (tokenInPoolAllowance === null || tokenInPoolAllowance < tokenInAmount)
    // ) {
    //     return SwapStep.APPROVE_POOL;
    // }
    else if (
        // tokenIn is not native, and we don't have enough allowance
        !currencyIn.isNative &&
        (transactionType.type !== "BRIDGE" ||
            (transactionType.type === "BRIDGE" &&
                isMultichainToken(currencyIn) &&
                !(currencyIn.standard === "HypERC20" || currencyIn.standard === "SuperERC20"))) &&
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
    return {
        ...waitForTransactionReceiptQueryOptions(config, { hash }),
        staleTime: Infinity,
        refetchInterval: false,
    };
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
export const superchainSwapMessageIdAtom = atom<Hash | null>(null);

export const stargateBridgeMessageIdAtom = atom<Hash | null>(null);

export const bridgeRemoteTransactionHashAtom = atom<Hash | null>(null);
export const swapRemoteTransactionHashAtom = atom<Hash | null>(null);

export const resetTransactionStateAtom = atom(null, (_, set) => {
    set(bridgeRemoteTransactionHashAtom, null);
    set(swapRemoteTransactionHashAtom, null);
    set(superchainBridgeMessageIdAtom, null);
    set(bridgeMessageIdAtom, null);
    set(swapMessageIdAtom, null);
    set(submittedTransactionTypeAtom, null);
});

export const slippageAtom = atom<"auto" | number>("auto");

export const slippageToleranceAtom = atom((get) => {
    const slippage = get(slippageAtom);
    if (slippage === "auto") return 0.5;
    return slippage;
});
