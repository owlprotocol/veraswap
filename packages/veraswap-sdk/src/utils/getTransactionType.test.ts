import { describe } from "vitest";

describe.skip("getTransactionType.test.ts");
// TODO: enable again. but this depends on the using our new quoter, which we already test
// import { describe, expect, test } from "vitest";
//
// import { LOCAL_CURRENCIES, LOCAL_POOLS } from "../constants/tokens.js";
//
// import { getTransactionType } from "./getTransactionType.js";
//
// describe("utils/getTransactionType.test.ts", function () {
//     const tokenA_900 = LOCAL_CURRENCIES[0];
//     const tokenA_901 = LOCAL_CURRENCIES[1];
//     const tokenB_900 = LOCAL_CURRENCIES[3];
//     const tokenB_901 = LOCAL_CURRENCIES[4];
//
//     test("BRIDGE", () => {
//         const transaction = getTransactionType({
//             poolKeys: LOCAL_POOLS,
//             currencyIn: tokenA_900,
//             currencyOut: tokenA_901,
//         });
//         expect(transaction?.type).toBe("BRIDGE");
//     });
//
//     test("SWAP", () => {
//         const transaction = getTransactionType({
//             poolKeys: LOCAL_POOLS,
//             currencyIn: tokenA_900,
//             currencyOut: tokenB_900,
//         });
//         expect(transaction?.type).toBe("SWAP");
//     });
//
//     test("SWAP_BRIDGE", () => {
//         const transaction = getTransactionType({
//             poolKeys: LOCAL_POOLS,
//             currencyIn: tokenA_900,
//             currencyOut: tokenB_901,
//         });
//         expect(transaction?.type).toBe("SWAP_BRIDGE");
//     });
//
//     test("BRIDGE_SWAP", () => {
//         const transaction = getTransactionType({
//             poolKeys: LOCAL_POOLS,
//             currencyIn: tokenA_901,
//             currencyOut: tokenB_900,
//         });
//         expect(transaction?.type).toBe("BRIDGE_SWAP");
//     });
//
//     test("null", () => {
//         const transaction = getTransactionType({
//             poolKeys: LOCAL_POOLS,
//             currencyIn: tokenA_901,
//             currencyOut: tokenB_901,
//         });
//         expect(transaction).toBe(null);
//     });
// });
