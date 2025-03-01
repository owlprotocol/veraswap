import { atom, WritableAtom } from "jotai";
import { atomWithMutation, atomWithQuery, AtomWithQueryResult } from "jotai-tanstack-query";
import { Chain } from "viem/chains";
import {
    PERMIT2_ADDRESS,
    quoteQueryOptions,
    TOKEN_LIST,
    UNISWAP_CONTRACTS,
    getPoolKey,
    SwapType,
    isSyntheticToken,
    getRemoteTokenAddressAndBridge,
} from "@owlprotocol/veraswap-sdk";
import { Address, Hash, parseUnits, zeroAddress } from "viem";
import { CurrencyAmount, Token } from "@uniswap/sdk-core";
import {
    readContractQueryOptions,
    sendTransactionMutationOptions,
    waitForTransactionReceiptQueryOptions,
} from "wagmi/query";
import { getAccount } from "@wagmi/core";
import { balanceOf as balanceOfAbi, allowance as allowanceAbi } from "@owlprotocol/veraswap-sdk/artifacts/IERC20";
import { allowance as allowancePermit2Abi } from "@owlprotocol/veraswap-sdk/artifacts/IAllowanceTransfer";
import { interopDevnet0, interopDevnet1 } from "@owlprotocol/veraswap-sdk";
import { chains, config } from "@/config.js";
import { hyperlaneRegistryOptions } from "@/hooks/hyperlaneRegistry";
import { quoteGasPayment } from "@/abis/quoteGasPayment";
import { TransactionStep } from "@/components/transaction-status-modal";

/**
 * - networks
 * - networkIn
 * - networkOut
 * - tokens
 * - tokenIn
 * - tokenOut
 * - tokenInAmount
 * - tokenOut
 * - quote
 *
 *
 */

//TODO: Add additional atom write logic to clear values when certain atoms are written (eg. when network is changed, tokenIn should be cleared), for now this can be done manually
export const networkTypeAtom = atom<"mainnet" | "testnet" | "superchain">("mainnet");

export const hyperlaneRegistryQueryAtom = atomWithQuery(hyperlaneRegistryOptions);

export const swapTypeAtom = atom<SwapType | null>((get) => {
    const chainIn = get(chainInAtom);
    const chainOut = get(chainOutAtom);
    const isSynthetic = get(isTokenOutSyntheticAtom);

    if (chainIn && chainOut) {
        return chainIn.id === chainOut.id && !isSynthetic ? SwapType.Swap : SwapType.SwapAndBridge;
    }
    return null;
});

const filterChainsByNetworkType = (networkType: "mainnet" | "testnet" | "superchain") => {
    return chains.filter((chain) => {
        const isInteropDevnet = chain.id === interopDevnet0.id || chain.id === interopDevnet1.id;
        if (networkType === "testnet") return chain.testnet === true && !isInteropDevnet;
        if (networkType === "superchain") return isInteropDevnet;
        return !chain.testnet;
    });
};

export const chainsAtom = atom((get) => filterChainsByNetworkType(get(networkTypeAtom)));

export const networkTypeWithResetAtom = atom(
    (get) => get(networkTypeAtom),
    (_, set, newNetworkType: "mainnet" | "testnet" | "superchain") => {
        set(networkTypeAtom, newNetworkType);
        resetNetworkDependentAtoms(set);
    },
);

const resetNetworkDependentAtoms = (set: any) => {
    set(chainInAtom, null);
    set(chainOutAtom, null);
    set(tokenInAtom, null);
    set(tokenOutAtom, null);
    set(tokenInAmountInputAtom, "");
};

export const tokensAtom = atom(TOKEN_LIST);

// Selected chain in
export const chainInAtom = atom<null | Chain>(null);
// Selected chain out
export const chainOutAtom = atom<null | Chain>(null);

//Temporary
export interface TokenAtomData {
    chainId: number;
    address: Address;
    name: string;
    symbol: string;
    decimals: number;
    logo?: string;
}
export interface TokenAmountAtomData extends TokenAtomData {
    amount: bigint;
}

/***** Tokens *****/
// List of supported tokens
//TODO: Add intermediate atom to fetch metadata, for now hardcode
// export const tokensAtom = atom<TokenAtomData[]>([
//     { chainId: localhost.id, address: MOCK_A, name: "Mock A", symbol: "A", decimals: 18 },
//     { chainId: localhost.id, address: MOCK_B, name: "Mock B", symbol: "B", decimals: 18 }
// ])

// List of supported tokens on networkIn
export const tokensInAtom = atom((get) => {
    const chainIn = get(chainInAtom);
    if (!chainIn) return [];

    const tokensMap = get(tokensAtom);
    const tokens = tokensMap[chainIn.id as keyof typeof tokensMap];

    if (!tokens) return [];

    const formattedTokens = Object.entries(tokens).map(([_, value]) => ({
        chainId: chainIn.id,
        ...value,
    }));

    return formattedTokens;
});
// List of supported tokens on networkOut
//TODO: Use pool info in addition to network
export const tokensOutAtom = atom((get) => {
    const chainOut = get(chainOutAtom);
    if (!chainOut) return [];

    const tokensMap = get(tokensAtom);
    const tokens = tokensMap[chainOut.id as keyof typeof tokensMap];

    if (!tokens) return [];

    const formattedTokens = Object.entries(tokens).map(([_, value]) => ({
        chainId: chainOut.id,
        ...value,
    }));
    // TODO: filter out tokenIn
    return formattedTokens;
});
// Selected tokenIn
export const tokenInAtom = atom<TokenAtomData | null>(null);
// Selected tokenOut
export const tokenOutAtom = atom<TokenAtomData | null>(null);

export const remoteTokenInfoAtom = atom((get) => {
    const tokenOut = get(tokenOutAtom);
    const chainIn = get(chainInAtom);

    if (!tokenOut || !chainIn) return null;

    return getRemoteTokenAddressAndBridge(tokenOut.chainId, tokenOut.address, chainIn.id);
});

export const isTokenOutSyntheticAtom = atom((get) => {
    const tokenOut = get(tokenOutAtom);
    return tokenOut ? isSyntheticToken(tokenOut.chainId, tokenOut.address) : false;
});

// Selected tokenIn balance
export const tokenInBalanceQueryAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config);
    const tokenIn = get(tokenInAtom);
    const enabled = !!tokenIn && !!account.address;

    return {
        ...readContractQueryOptions(config, {
            abi: [balanceOfAbi],
            chainId: (tokenIn?.chainId ?? 0) as any, // wagmi typechecks the supported chainIds
            address: tokenIn?.address ?? zeroAddress,
            functionName: "balanceOf",
            args: [account.address ?? zeroAddress],
        }),
        enabled,
        refetchInterval: 2000,
    };
});
export const tokenInBalanceAtom = atom<bigint | null>((get) => {
    return get(tokenInBalanceQueryAtom).data ?? null;
});

// Selected tokenIn Permit2 allowance
export const tokenInPermit2AllowanceQueryAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config);
    const tokenIn = get(tokenInAtom);
    const enabled = !!tokenIn || !!account.address;

    return {
        ...readContractQueryOptions(config, {
            abi: [allowanceAbi],
            chainId: (tokenIn?.chainId ?? 0) as any, // wagmi typechecks the supported chainIds
            address: tokenIn?.address ?? zeroAddress,
            functionName: "allowance",
            args: [account.address ?? zeroAddress, PERMIT2_ADDRESS],
        }),
        enabled,
        refetchInterval: 2000,
    };
});
export const tokenInPermit2AllowanceAtom = atom<bigint | null>((get) => {
    return get(tokenInPermit2AllowanceQueryAtom).data ?? null;
});
// Selected tokenIn UniversalRouter allowance (via Permit2)
export const tokenInRouterAllowanceQueryAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config);
    const tokenIn = get(tokenInAtom);
    const enabled = !!tokenIn || !!account.address;

    return {
        ...readContractQueryOptions(config, {
            abi: [allowancePermit2Abi],
            chainId: (tokenIn?.chainId ?? 0) as any, // wagmi typechecks the supported chainIds
            address: PERMIT2_ADDRESS,
            functionName: "allowance",
            args: [
                account.address ?? zeroAddress,
                tokenIn?.address ?? zeroAddress,
                tokenIn?.chainId ? UNISWAP_CONTRACTS[tokenIn.chainId].UNIVERSAL_ROUTER : zeroAddress,
            ],
        }),
        enabled,
        refetchInterval: 2000,
    };
});
export const tokenInRouterAllowanceAtom = atom<bigint | null>((get) => {
    const data = get(tokenInRouterAllowanceQueryAtom).data;
    return data ? data[0] : null;
});

// Selected tokenOut balance
export const tokenOutBalanceQueryAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config);
    const tokenOut = get(tokenOutAtom);
    const enabled = !!tokenOut || !!account.address;

    return {
        ...readContractQueryOptions(config, {
            abi: [balanceOfAbi],
            chainId: (tokenOut?.chainId ?? 0) as any, // wagmi typechecks the supported chainIds
            address: tokenOut?.address ?? zeroAddress,
            functionName: "balanceOf",
            args: [account.address ?? zeroAddress],
        }),
        enabled,
        refetchInterval: 2000,
    };
});
export const tokenOutBalanceAtom = atom<bigint | null>((get) => {
    return get(tokenOutBalanceQueryAtom).data ?? null;
});

// Selected tokenInAmount
export const tokenInAmountInputAtom = atom<string>("");
export const tokenInAmountAtom = atom<bigint | null>((get) => {
    const tokenIn = get(tokenInAtom);
    const tokenInAmountInput = get(tokenInAmountInputAtom);
    if (!tokenIn || tokenInAmountInput === "") return null;
    return parseUnits(tokenInAmountInput, tokenIn.decimals);
});

// Selected tokenOutAmount
//TODO: Implement later
// const tokenInAmountAtom = atom<bigint | null>(null)
export const poolKeyInAtom = atom((get) => {
    const tokenIn = get(tokenInAtom);
    const tokenOut = get(tokenOutAtom);
    const swapType = get(swapTypeAtom);
    const remoteInfo = get(remoteTokenInfoAtom);

    if (!tokenIn || !tokenOut) return null;
    if (tokenIn.address === tokenOut.address) return null;

    const currencyOut =
        swapType === SwapType.SwapAndBridge && remoteInfo ? remoteInfo.remoteTokenAddress : tokenOut.address;

    return getPoolKey(tokenIn.chainId, tokenIn.address, currencyOut);
});
// TODO: handle
export const poolKeyOutAtom = atom((get) => {
    const tokenIn = get(tokenInAtom);
    const tokenOut = get(tokenOutAtom);

    if (!tokenIn || !tokenOut) return null; // Tokens not selected
    if (tokenIn.address === tokenOut.address) return null; // Invalid same token

    return getPoolKey(tokenOut.chainId, tokenIn.address, tokenOut.address);
});

const emptyToken = new Token(1, zeroAddress, 1);
const emptyCurrencyAmount = CurrencyAmount.fromRawAmount(emptyToken, 1);
const emptyPoolKey = {
    currency0: zeroAddress,
    currency1: zeroAddress,
    fee: 3_000,
    tickSpacing: 60,
    hooks: zeroAddress,
};

// Uniswap Quote
// type inference fails?
export const quoteInAtom = atomWithQuery((get) => {
    const poolKey = get(poolKeyInAtom);
    const chainIn = get(chainInAtom);
    const tokenIn = get(tokenInAtom);
    const tokenInAmount = get(tokenInAmountAtom);
    const enabled = !!poolKey && !!chainIn && !!tokenInAmount;
    //TODO: Should we create these classes in the atoms? => Might pose challenge if we add custom fields
    const chainId = chainIn?.id ?? 0;
    const currencyIn = tokenIn ? new Token(tokenIn.chainId, tokenIn.address, tokenIn.decimals) : emptyToken;
    const exactCurrencyAmount =
        tokenIn && tokenInAmount
            ? CurrencyAmount.fromRawAmount(currencyIn, tokenInAmount.toString())
            : emptyCurrencyAmount;
    const quoterAddress = chainId ? UNISWAP_CONTRACTS[chainId].QUOTER : zeroAddress;

    return {
        ...quoteQueryOptions(config, {
            chainId,
            poolKey: poolKey ?? emptyPoolKey,
            exactCurrencyAmount: exactCurrencyAmount,
            quoteType: "quoteExactInputSingle",
            quoterAddress,
        }),
        enabled,
    };
}) as unknown as WritableAtom<AtomWithQueryResult<[bigint, bigint], Error>, [], void>;

export const swapInvertAtom = atom(null, (get, set) => {
    const currentChainIn = get(chainInAtom);
    const currentChainOut = get(chainOutAtom);
    const currentTokenIn = get(tokenInAtom);
    const currentTokenOut = get(tokenOutAtom);

    set(chainInAtom, currentChainOut);
    set(chainOutAtom, currentChainIn);

    set(tokenInAtom, currentTokenOut);
    set(tokenOutAtom, currentTokenIn);

    set(tokenInAmountInputAtom, "");
});

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

    if (account.address === undefined) return SwapStep.CONNECT_WALLET;
    if (mutation.isPending) return SwapStep.PENDING_SIGNATURE;
    if (hash && hash != receipt.data?.transactionHash) return SwapStep.PENDING_TRANSACTION;
    if (tokenIn === null || tokenOut === null) return SwapStep.SELECT_TOKEN;
    if (tokenInAmount === null) return SwapStep.SELECT_TOKEN_AMOUNT;
    if (tokenInBalance === null || tokenInBalance < tokenInAmount) return SwapStep.INSUFFICIENT_BALANCE;
    if (tokenInPermit2Allowance === null || tokenInPermit2Allowance < tokenInAmount) return SwapStep.APPROVE_PERMIT2;
    if (tokenInRouterAllowance === null || tokenInRouterAllowance < tokenInAmount)
        return SwapStep.APPROVE_UNISWAP_ROUTER;

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

export const bridgeGasPaymentAtom = atomWithQuery((get) => {
    const chainOut = get(chainOutAtom);
    const remoteInfo = get(remoteTokenInfoAtom);

    return {
        ...readContractQueryOptions(config, {
            address: remoteInfo?.remoteBridgeAddress ?? zeroAddress,
            abi: [quoteGasPayment],
            functionName: "quoteGasPayment",
            args: [chainOut?.id ?? 0],
        }),
        enabled: !!remoteInfo?.remoteBridgeAddress && !!chainOut,
    };
});

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

export const hyperlaneMessageIdAtom = atom<Hash | undefined>(undefined);
