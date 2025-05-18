// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { BigNumber } from "bignumber.js";
import { createPublicClient, http } from "viem";
import { describe, expect, test } from "vitest";

import { getPoolAddress, getPoolState } from "../pool/getPool.js";
import { sqrtPriceToInstantPrice } from "../pool/getPoolPrice.js";

import { getBalancePortfolioTrades } from "./getBalancePortfolioTrades.js";

describe("getBalancePortfolioTrades.test.ts", function () {
    const publicClient = createPublicClient({
        transport: http("https://mode.drpc.org/"),
    });
    const poolInitCodeHash = "0xf96d2474815c32e070cd63233f06af5413efc5dcb430aee4ff18cc29007c562d";
    const poolDeployer = "0x6414A461B19726410E52488d9D5ff33682701635";
    const quoterV2 = "0x7c5aaa464f736740156fd69171505d344855d1e5";

    const USDC = "0xd988097fb8612cc24eeC14542bC03424c656005f";
    const WETH = "0x4200000000000000000000000000000000000006";
    const MODE = "0xDfc7C877a950e49D2610114102175A06C2e3167a";

    test("getBalancePortfolioTrades", async () => {
        const poolWethUsdc = await getPoolState({
            publicClient,
            address: getPoolAddress({
                token0: WETH,
                token1: USDC,
                poolDeployer,
                poolInitCodeHash,
            }),
        });
        const priceWethUsdc = sqrtPriceToInstantPrice({ sqrtPrice: poolWethUsdc.sqrtPrice, base: WETH, quote: USDC });

        const poolUsdcMode = await getPoolState({
            publicClient,
            address: getPoolAddress({
                token0: USDC,
                token1: MODE,
                poolDeployer,
                poolInitCodeHash,
            }),
        });
        const priceModeUsdc = sqrtPriceToInstantPrice({ sqrtPrice: poolUsdcMode.sqrtPrice, base: MODE, quote: USDC });

        // Spend $100
        const trades = await getBalancePortfolioTrades({
            publicClient,
            quoterV2,
            liquidityTokens: [WETH],
            assets: [
                { address: USDC, price: BigNumber(1), valueDelta: -90_000_000n },
                {
                    address: WETH,
                    price: priceWethUsdc,
                    valueDelta: 40_000_000n,
                },
                {
                    address: MODE,
                    price: priceModeUsdc,
                    valueDelta: 40_000_000n,
                },
            ],
        });

        expect(trades).toBeDefined();
        // console.debug(trades);
    });
});
