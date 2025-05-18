/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
//TODO: Add simple unit test without any RPC calls
import { createPublicClient, http, parseEther, parseUnits } from "viem";
import { describe, expect, test } from "vitest";

import { getPoolAddress, getPoolBaseQuotePair, getPoolState } from "./getPool.js";
import { quoteWithPrice, sqrtPriceToInstantPrice } from "./getPoolPrice.js";

describe("getPool.test.ts", function () {
    const publicClient = createPublicClient({
        transport: http("https://mode.drpc.org/"),
    });

    const USDC = "0xd988097fb8612cc24eeC14542bC03424c656005f";
    const WETH = "0x4200000000000000000000000000000000000006";
    const MODE = "0xDfc7C877a950e49D2610114102175A06C2e3167a";
    const WETH_USDC = "0x468cC91dF6F669CaE6cdCE766995Bd7874052FBc";

    // kim.exchange
    // https://explorer.mode.network/address/0xB5F00c2C5f8821155D8ed27E31932CFD9DB3C5D5?tab=read_contract
    const poolInitCodeHash = "0xf96d2474815c32e070cd63233f06af5413efc5dcb430aee4ff18cc29007c562d";
    const poolDeployer = "0x6414A461B19726410E52488d9D5ff33682701635";

    test("getBaseQuotePair WETH/USDC", () => {
        // correct order WETH / USDC
        const regular = getPoolBaseQuotePair({ token0: WETH, token1: USDC });
        expect(regular.base).toBe(WETH);
        expect(regular.quote).toBe(USDC);
        // fixed by analyzing invariant internally WETH / USDC
        const reverse = getPoolBaseQuotePair({ token0: USDC, token1: WETH });
        expect(reverse.base).toBe(WETH);
        expect(reverse.quote).toBe(USDC);
    });

    test("getPoolAddress WETH/USDC", () => {
        const pool = getPoolAddress({
            token0: WETH,
            token1: USDC,
            poolDeployer,
            poolInitCodeHash,
        });
        expect(pool).toBe(WETH_USDC);
    });

    test("getPoolData, quoteWithPrice WETH/USDC", async () => {
        const state = await getPoolState({ publicClient, address: WETH_USDC });
        expect(state).toBeDefined();

        const { sqrtPrice } = state;

        const quoteWethUsdc = quoteWithPrice({
            amount: parseEther("1"),
            price: sqrtPriceToInstantPrice({ sqrtPrice, base: WETH, quote: USDC }),
        });
        expect(quoteWethUsdc).toBeDefined();
        // console.debug(`1 ETH = ${formatUnits(quoteWethUsdc, 6)} USDC`);

        const quoteUsdcWeth = quoteWithPrice({
            amount: parseUnits("2500", 6),
            price: sqrtPriceToInstantPrice({ sqrtPrice, base: USDC, quote: WETH }),
        });
        expect(quoteUsdcWeth).toBeDefined();
        // console.debug(`2500 USDC = ${formatEther(quoteUsdcWeth)} ETH`);
    });

    test("USDC/MODE (single-hop) vs USDC/WETH/MODE (multi-hop)", async () => {
        const poolWethUsdc = await getPoolState({
            publicClient,
            address: getPoolAddress({
                token0: WETH,
                token1: USDC,
                poolDeployer,
                poolInitCodeHash,
            }),
        });
        expect(poolWethUsdc).toBeDefined();

        const poolWethMode = await getPoolState({
            publicClient,
            address: getPoolAddress({
                token0: WETH,
                token1: MODE,
                poolDeployer,
                poolInitCodeHash,
            }),
        });
        expect(poolWethMode).toBeDefined();

        const poolUsdcMode = await getPoolState({
            publicClient,
            address: getPoolAddress({
                token0: USDC,
                token1: MODE,
                poolDeployer,
                poolInitCodeHash,
            }),
        });
        expect(poolUsdcMode).toBeDefined();

        // Sometimes WETH has higher liquidity leading to cheaper multi-hop swaps
        // While mathematically equivalent, in practice the price can vary
        // Compare USDC/MODE vs WETH/MODE / WETH/USDC

        // single-hop USDC > MODE
        const priceUsdcMode = sqrtPriceToInstantPrice({ sqrtPrice: poolUsdcMode.sqrtPrice, base: USDC, quote: MODE });
        const quoteUsdcMode = quoteWithPrice({
            amount: parseUnits("1", 6),
            price: priceUsdcMode,
        });
        expect(quoteUsdcMode).toBeDefined();
        // console.debug(`USDC/MODE: 1 USDC = ${formatEther(quoteUsdcMode)} MODE`);

        // multi-hop USDC > WETH > MODE
        const priceWethUsdc = sqrtPriceToInstantPrice({ sqrtPrice: poolWethUsdc.sqrtPrice, base: WETH, quote: USDC });
        const priceWethMode = sqrtPriceToInstantPrice({ sqrtPrice: poolWethMode.sqrtPrice, base: WETH, quote: MODE });
        const priceUsdcWethMode = priceWethMode.div(priceWethUsdc);
        const quoteUsdcWethMode = quoteWithPrice({
            amount: parseUnits("1", 6),
            price: priceUsdcWethMode,
        });
        expect(quoteUsdcWethMode).toBeDefined();
        // console.debug(`USDC/WETH/MODE: 1 USDC = ${formatEther(quoteUsdcWethMode)} MODE`);

        // Conclusion: single-hop **appears** cheaper since it does not account for price impact
    });
});
