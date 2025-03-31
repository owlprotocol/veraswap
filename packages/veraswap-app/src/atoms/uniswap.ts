import { atomWithQuery, AtomWithQueryResult } from "jotai-tanstack-query";
import { PoolKey, quoteQueryOptions } from "@owlprotocol/veraswap-sdk";
import { Token, CurrencyAmount } from "@uniswap/sdk-core";
import { WritableAtom } from "jotai";
import { Address, zeroAddress } from "viem";
import { UNISWAP_CONTRACTS } from "@owlprotocol/veraswap-sdk/constants";
import { tokenInAmountAtom, transactionTypeAtom } from "./tokens.js";
import { config } from "@/config.js";

// const emptyToken = new Token(1, zeroAddress, 1);
// const emptyCurrencyAmount = CurrencyAmount.fromRawAmount(emptyToken, 1);
const emptyPoolKey = {
    currency0: zeroAddress,
    currency1: zeroAddress,
    fee: 3_000,
    tickSpacing: 60,
    hooks: zeroAddress,
};

/** v4Quoter.quoteExactInputSingle(...): QueryResult */
export const quoteInAtom = atomWithQuery((get) => {
    const tokenInAmount = get(tokenInAmountAtom);
    const transactionType = get(transactionTypeAtom);

    let chainId: number = 0;
    let poolKey: PoolKey = emptyPoolKey;
    let tokenInAddress: Address = zeroAddress;
    let tokenInDecimals = 18;

    if (transactionType?.type === "SWAP") {
        chainId = transactionType.chainId;
        poolKey = transactionType.poolKey;
        const tokenIn = transactionType.tokenIn;
        tokenInAddress = tokenIn.standard === "HypERC20Collateral" ? tokenIn.collateralAddress : tokenIn.address;
        tokenInDecimals = tokenInDecimals;
    } else if (transactionType?.type === "SWAP_BRIDGE" || transactionType?.type === "BRIDGE_SWAP") {
        chainId = transactionType.swap.chainId;
        poolKey = transactionType.swap.poolKey;
        const tokenIn = transactionType.swap.tokenIn;
        tokenInAddress = tokenIn.standard === "HypERC20Collateral" ? tokenIn.collateralAddress : tokenIn.address;
        tokenInDecimals = tokenIn.decimals;
    }

    const enabled = chainId != 0 && poolKey != emptyPoolKey && tokenInAddress != zeroAddress && !!tokenInAmount;

    // Query args MUST be defined
    const currencyIn = new Token(chainId, tokenInAddress, tokenInDecimals);
    const exactCurrencyAmount = CurrencyAmount.fromRawAmount(currencyIn, (tokenInAmount ?? 0).toString());
    const quoterAddress = chainId ? UNISWAP_CONTRACTS[chainId].v4Quoter : zeroAddress;

    return {
        ...quoteQueryOptions(config, {
            chainId,
            poolKey,
            exactCurrencyAmount,
            quoteType: "quoteExactInputSingle",
            quoterAddress,
        }),
        enabled,
    };
}) as unknown as WritableAtom<AtomWithQueryResult<[bigint, bigint], Error>, [], void>;
