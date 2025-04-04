import { describe, expect, test } from "vitest";
import { LOCAL_POOLS, LOCAL_TOKENS, LOCAL_TOKENS_MAP } from "../constants/tokens.js";
import { getTransactionType } from "./getTransactionType.js";

describe("utils/getTransactionType.test.ts", function () {
    const tokenA_900 = LOCAL_TOKENS[0];
    const tokenA_901 = LOCAL_TOKENS[1];
    const tokenB_900 = LOCAL_TOKENS[3];
    const tokenB_901 = LOCAL_TOKENS[4];

    test("BRIDGE", () => {
        const transaction = getTransactionType({
            tokens: LOCAL_TOKENS_MAP,
            poolKeys: LOCAL_POOLS,
            tokenIn: tokenA_900,
            tokenOut: tokenA_901,
        });
        expect(transaction?.type).toBe("BRIDGE");
    });

    test("SWAP", () => {
        const transaction = getTransactionType({
            tokens: LOCAL_TOKENS_MAP,
            poolKeys: LOCAL_POOLS,
            tokenIn: tokenA_900,
            tokenOut: tokenB_900,
        });
        expect(transaction?.type).toBe("SWAP");
    });

    test("SWAP_BRIDGE", () => {
        const transaction = getTransactionType({
            tokens: LOCAL_TOKENS_MAP,
            poolKeys: LOCAL_POOLS,
            tokenIn: tokenA_900,
            tokenOut: tokenB_901,
        });
        expect(transaction?.type).toBe("SWAP_BRIDGE");
    });

    test("BRIDGE_SWAP", () => {
        const transaction = getTransactionType({
            tokens: LOCAL_TOKENS_MAP,
            poolKeys: LOCAL_POOLS,
            tokenIn: tokenA_901,
            tokenOut: tokenB_900,
        });
        expect(transaction?.type).toBe("BRIDGE_SWAP");
    });

    test("null", () => {
        const transaction = getTransactionType({
            tokens: LOCAL_TOKENS_MAP,
            poolKeys: LOCAL_POOLS,
            tokenIn: tokenA_901,
            tokenOut: tokenB_901,
        });
        expect(transaction).toBe(null);
    });
});
