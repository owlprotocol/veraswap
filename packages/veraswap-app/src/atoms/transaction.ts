import { atom, WritableAtom } from "jotai";
import { atomWithMutation, atomWithQuery, AtomWithQueryResult } from "jotai-tanstack-query";
import { Hash, zeroAddress } from "viem";
import {
    sendTransactionMutationOptions,
    waitForTransactionReceiptQueryOptions,
    readContractQueryOptions,
} from "wagmi/query";
import { isSyntheticToken, SwapType } from "@owlprotocol/veraswap-sdk";
import { chainInAtom, chainOutAtom, networkTypeAtom } from "./chain.js";
import { tokenOutAtom } from "./tokens.js";
import { remoteTokenInfoAtom } from "./index.js";
import { quoteGasPayment } from "@/abis/quoteGasPayment.js";
import { config } from "@/config.js";
import { TransactionStep } from "@/components/TransactionStatusModal.js";

export const swapTypeAtom = atom<SwapType | null>((get) => {
    const chainIn = get(chainInAtom);
    const chainOut = get(chainOutAtom);
    const isSynthetic = get(isTokenOutSyntheticAtom);

    if (chainIn && chainOut) {
        return chainIn.id === chainOut.id && !isSynthetic ? SwapType.Swap : SwapType.SwapAndBridge;
    }
    return null;
});

export const isTokenOutSyntheticAtom = atom((get) => {
    const tokenOut = get(tokenOutAtom);
    return tokenOut ? isSyntheticToken(tokenOut.chainId, tokenOut.address) : false;
});

export const sendTransactionMutationAtom = atomWithMutation(() => {
    // Compute mutation based on swap step
    return sendTransactionMutationOptions(config);
});
export const waitForReceiptQueryAtom = atomWithQuery((get) => {
    const mutation = get(sendTransactionMutationAtom);
    const hash = mutation.data;
    return waitForTransactionReceiptQueryOptions(config, { hash });
});

export const hyperlaneGasPaymentAtom = atomWithQuery((get) => {
    const chainOut = get(chainOutAtom);
    const chainIn = get(chainInAtom);
    const remoteInfo = get(remoteTokenInfoAtom);
    const networkType = get(networkTypeAtom);

    return {
        ...readContractQueryOptions(config, {
            chainId: chainIn?.id ?? 0,
            address: remoteInfo?.remoteBridgeAddress ?? zeroAddress,
            abi: [quoteGasPayment],
            functionName: "quoteGasPayment",
            args: [chainOut?.id ?? 0],
        }),
        enabled: networkType != "superchain" && !!remoteInfo?.remoteBridgeAddress && !!chainOut && !!chainIn,
    };
}) as unknown as WritableAtom<AtomWithQueryResult<bigint, Error>, [], void>;

export const transactionModalOpenAtom = atom<boolean>(false);
export const transactionStepsAtom = atom<TransactionStep[]>([]);
export const currentTransactionStepIdAtom = atom<string | undefined>(undefined);
export const transactionHashesAtom = atom<{ swap?: string; bridge?: string; transfer?: string }>({});
export const updateTransactionStepAtom = atom(
    null,
    (get, set, update: { id: "swap" | "bridge" | "transfer"; status: TransactionStep["status"] }) => {
        const steps = get(transactionStepsAtom);
        const updatedSteps = steps.map((step) => (step.id === update.id ? { ...step, status: update.status } : step));
        set(transactionStepsAtom, updatedSteps);

        if (update.status === "processing") {
            set(currentTransactionStepIdAtom, update.id);
        }
    },
);

export const initializeTransactionStepsAtom = atom(null, (_, set, swapType: "Swap" | "SwapAndBridge") => {
    const steps: TransactionStep[] = [
        {
            id: "swap",
            title: "🤝 Swap",
            description: "Trading with your local Walmart 💵💵💵💵💵💵",
            status: "pending",
        },
    ];

    if (swapType === "SwapAndBridge") {
        steps.push(
            {
                id: "bridge",
                title: "🚀 Bridge",
                description: "Your token is traveling...",
                status: "pending",
            },
            {
                id: "transfer",
                title: "🕊️ Transfer Token",
                description: "We're freeing your token. Don't be impatient!",
                status: "pending",
            },
        );
    }

    set(transactionStepsAtom, steps);
    set(transactionModalOpenAtom, true);
});

export const messageIdAtom = atom<Hash | undefined>(undefined);

export const remoteTransactionHashAtom = atom<Hash | null>(null);
