import { atom, WritableAtom } from "jotai";
import { atomWithQuery, AtomWithQueryResult } from "jotai-tanstack-query";
import { parseUnits, zeroAddress } from "viem";
import { getBalanceQueryOptions, readContractQueryOptions } from "wagmi/query";
import { getAccount, GetBalanceReturnType } from "@wagmi/core";
import { Token, getTransactionType, TransactionType, orbiterRoutersQueryOptions } from "@owlprotocol/veraswap-sdk";
import {
    PERMIT2_ADDRESS,
    UNISWAP_CONTRACTS,
    LOCAL_POOLS,
    LOCAL_TOKENS_MAP,
    POOLS,
    TOKENS_MAP,
} from "@owlprotocol/veraswap-sdk/constants";
import { balanceOf as balanceOfAbi, allowance as allowanceAbi } from "@owlprotocol/veraswap-sdk/artifacts/IERC20";
import { allowance as allowancePermit2Abi } from "@owlprotocol/veraswap-sdk/artifacts/IAllowanceTransfer";
import { chains, config } from "@/config.js";

/***** Tokens Fetch *****/
//TODO: Hard-coded for now
/**
 * // TODO: move it all in one file?
const fetchTokens = async () => {
    const [tokensResponse, bridgedTokensResponse] = await Promise.all([
        fetch("https://raw.githubusercontent.com/owlprotocol/veraswap-tokens/main/tokens-list.json"),
        fetch("https://raw.githubusercontent.com/owlprotocol/veraswap-tokens/main/bridged-tokens.json"),
    ]);

    if (!tokensResponse.ok || !bridgedTokensResponse.ok) {
        throw new Error("Failed to fetch tokens");
    }

    const standardTokens = await tokensResponse.json();
    const bridgedTokens = await bridgedTokensResponse.json();

    return [...standardTokens, ...bridgedTokens];
};

export const fetchedTokensAtom = atomWithQuery(() => ({
    queryKey: ["tokens"],
    queryFn: fetchTokens,
}));

 */

/***** Token In *****/
/** Selected tokenIn */
export const tokenInAtom = atom<Token | null>(null);
/** Selected tokenIn chain */
export const chainInAtom = atom((get) => {
    const tokenIn = get(tokenInAtom);
    return chains.find((c) => c.id === tokenIn?.chainId) ?? null;
});
/** tokenIn amount: string */
export const tokenInAmountInputAtom = atom<string>("");
/** tokenIn amount: bigint (wei) */
export const tokenInAmountAtom = atom<bigint | null>((get) => {
    const tokenIn = get(tokenInAtom);
    const tokenInAmountInput = get(tokenInAmountInputAtom);
    if (!tokenIn || tokenInAmountInput === "") return null;

    return parseUnits(tokenInAmountInput, tokenIn.decimals!);
});
/** tokenIn.balanceOf(account): QueryResult */
// @ts-expect-error Bad type inference
export const tokenInBalanceQueryAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config);
    const tokenIn = get(tokenInAtom);
    const enabled = !!tokenIn && !!account.address;

    // Query args MUST be defined
    const chainId = tokenIn?.chainId ?? 0;
    const accountAddress = account.address ?? zeroAddress;
    const tokenAddress =
        tokenIn?.standard === "HypERC20Collateral" ? tokenIn?.collateralAddress : (tokenIn?.address ?? zeroAddress);

    if (tokenIn?.standard === "NativeToken") {
        return {
            ...getBalanceQueryOptions(config, { address: account.address ?? zeroAddress, chainId: tokenIn.chainId }),
            enabled: !!account.address,
            refetchInterval: 2000,
            select: (data: GetBalanceReturnType) => data.value,
        };
    }

    return {
        ...readContractQueryOptions(config, {
            abi: [balanceOfAbi],
            chainId,
            address: tokenAddress,
            functionName: "balanceOf",
            args: [accountAddress],
        }),
        enabled,
        refetchInterval: 2000,
    };
}) as any as WritableAtom<AtomWithQueryResult<bigint, Error>, [], void>;

/** tokenIn.balanceOf(account): bigint */
export const tokenInBalanceAtom = atom<bigint | null>((get) => {
    return get(tokenInBalanceQueryAtom).data ?? null;
});
/** tokenIn.allowance(account, PERMIT2): QueryResult */
export const tokenInPermit2AllowanceQueryAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config);
    const tokenIn = get(tokenInAtom);
    const enabled = !!tokenIn && tokenIn.standard !== "NativeToken" && !!account.address;

    // Query args MUST be defined
    const chainId = tokenIn?.chainId ?? 0;
    const accountAddress = account.address ?? zeroAddress;
    const tokenAddress =
        tokenIn?.standard === "HypERC20Collateral" ? tokenIn?.collateralAddress : (tokenIn?.address ?? zeroAddress);

    return {
        ...readContractQueryOptions(config, {
            abi: [allowanceAbi],
            chainId,
            address: tokenAddress,
            functionName: "allowance",
            args: [accountAddress, PERMIT2_ADDRESS],
        }),
        enabled,
        refetchInterval: 2000,
    };
});
/** tokenIn.allowance(account, PERMIT2): bigint */
export const tokenInPermit2AllowanceAtom = atom<bigint | null>((get) => {
    return get(tokenInPermit2AllowanceQueryAtom).data ?? null;
});
/** permit2.allowance(account, tokenIn, UniversalRouter): QueryResult */
export const tokenInUniswapRouterAllowanceQueryAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config);
    const tokenIn = get(tokenInAtom);
    const enabled = !!tokenIn && !!account.address && tokenIn.standard !== "NativeToken";

    // Query args MUST be defined
    const chainId = tokenIn?.chainId ?? 0;
    const accountAddress = account.address ?? zeroAddress;
    const tokenAddress =
        tokenIn?.standard === "HypERC20Collateral" ? tokenIn?.collateralAddress : (tokenIn?.address ?? zeroAddress);

    const universalRouter = tokenIn?.chainId
        ? // NOTE: Add zeroAddress fallback as since tokenIn.chainId is not guaranteed to be in UNISWAP_CONTRACTS
          (UNISWAP_CONTRACTS[tokenIn.chainId as keyof typeof UNISWAP_CONTRACTS]?.universalRouter ?? zeroAddress)
        : zeroAddress;

    if (tokenIn?.chainId && !(tokenIn.chainId in UNISWAP_CONTRACTS)) {
        console.error(`UNISWAP_CONTRACTS addresses not set for chain ${tokenIn.chainId}`);
    }

    return {
        ...readContractQueryOptions(config, {
            abi: [allowancePermit2Abi],
            chainId,
            address: PERMIT2_ADDRESS,
            functionName: "allowance",
            args: [accountAddress, tokenAddress, universalRouter],
        }),
        enabled,
        refetchInterval: 2000,
    };
});
/** permit2.allowance(account, tokenIn, UniversalRouter): bigint */
export const tokenInUniswapRouterAllowanceAtom = atom<bigint | null>((get) => {
    const data = get(tokenInUniswapRouterAllowanceQueryAtom).data;
    return data ? data[0] : null;
});

/** Check if router is approved for token in if token in is collateral */
export const tokenInBridgeAllowanceQueryAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config);
    const tokenIn = get(tokenInAtom);
    const enabled = !!tokenIn && !!account.address && tokenIn.standard === "HypERC20Collateral";

    const chainId = tokenIn?.chainId ?? 0;
    const tokenAddress =
        !!tokenIn && tokenIn.standard === "HypERC20Collateral" ? tokenIn.collateralAddress : zeroAddress;
    const accountAddress = account.address ?? zeroAddress;
    const bridgeAddress = tokenIn?.address ?? zeroAddress;

    return {
        ...readContractQueryOptions(config, {
            abi: [allowanceAbi],
            chainId: chainId,
            address: tokenAddress,
            functionName: "allowance",
            args: [accountAddress, bridgeAddress],
        }),
        enabled,
        refetchInterval: 2000,
    };
});

export const tokenInBridgeAllowanceAtom = atom<bigint | null>((get) => {
    return get(tokenInBridgeAllowanceQueryAtom).data ?? null;
});

/***** Token Out *****/
/** Selected tokenOut */
export const tokenOutAtom = atom<Token | null>(null);
/** Selected tokenOut chain */
export const chainOutAtom = atom((get) => {
    const tokenOut = get(tokenOutAtom);
    return chains.find((c) => c.id === tokenOut?.chainId) ?? null;
});
/** tokenOut.balanceOf(account): QueryResult */
// @ts-expect-error Bad type inference
export const tokenOutBalanceQueryAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config);
    const tokenOut = get(tokenOutAtom);
    const enabled = !!tokenOut && !!account.address;

    // Query args MUST be defined
    const chainId = tokenOut?.chainId ?? 0;
    const accountAddress = account.address ?? zeroAddress;
    const tokenAddress =
        tokenOut?.standard === "HypERC20Collateral" ? tokenOut?.collateralAddress : (tokenOut?.address ?? zeroAddress);

    if (tokenOut?.standard === "NativeToken") {
        return {
            ...getBalanceQueryOptions(config, { address: account.address ?? zeroAddress, chainId: tokenOut.chainId }),
            enabled: !!account.address,
            refetchInterval: 2000,
            select: (data: GetBalanceReturnType) => data.value,
        };
    }

    return {
        ...readContractQueryOptions(config, {
            abi: [balanceOfAbi],
            chainId,
            address: tokenAddress,
            functionName: "balanceOf",
            args: [accountAddress],
        }),
        enabled,
        refetchInterval: 2000,
    };
}) as any as WritableAtom<AtomWithQueryResult<bigint, Error>, [], void>;

/** tokenOut.balanceOf(account): bigint */
export const tokenOutBalanceAtom = atom<bigint | null>((get) => {
    return get(tokenOutBalanceQueryAtom).data ?? null;
});

/** Find transaction type (BRIDGE, SWAP, SWAP_BRIDGE, BRIDGE_SWAP) */
export const transactionTypeAtom = atom<TransactionType | null>((get) => {
    const tokenIn = get(tokenInAtom);
    const tokenOut = get(tokenOutAtom);
    if (!tokenIn || !tokenOut) return null;

    //TODO: Add better constants
    return getTransactionType({ tokenIn, tokenOut, poolKeys: POOLS, tokens: TOKENS_MAP });
});

/***** Invert *****/
export const swapInvertAtom = atom(null, (get, set) => {
    const currentTokenIn = get(tokenInAtom);
    const currentTokenOut = get(tokenOutAtom);

    set(tokenInAtom, currentTokenOut);
    set(tokenOutAtom, currentTokenIn);
    set(tokenInAmountInputAtom, "");
});
