import { QueryClient } from "@tanstack/react-query";
import { http, parseEther } from "viem";
import { optimism, polygon } from "viem/chains";
import { describe, expect, test } from "vitest";
import { createConfig } from "wagmi";

import { optimismSepolia, sepolia } from "../chains/index.js";

import { StargateETHQuoteParams, stargateETHQuoteQueryOptions } from "./stargateETHQuote.js";

describe("stargateETHQuote.test.ts", function () {
    const queryClient = new QueryClient();
    const wagmiConfig = createConfig({
        chains: [sepolia, optimismSepolia],
        transports: {
            [sepolia.id]: http(),
            [optimismSepolia.id]: http(),
        },
    });

    test("Get quote", async () => {
        const amount = parseEther("0.1");

        const params: StargateETHQuoteParams = {
            amount,
            dstChain: optimismSepolia.id,
            srcChain: sepolia.id,
            receiver: "0x0000000000000000000000000000000000000001",
        };

        const quote = await queryClient.fetchQuery(stargateETHQuoteQueryOptions(wagmiConfig, params));

        expect(quote).not.toBeNull();
        const { amountFeeRemoved, fee } = quote!;
        expect(amountFeeRemoved).toBeLessThan(amount);
        expect(amountFeeRemoved + fee).toBeLessThanOrEqual(amount);
        expect(amountFeeRemoved).toBeGreaterThan(0n);
        expect(fee).toBeGreaterThan(0n);
    });

    // Saves time to avoid running an online test, but use again if there are any changes to Stargate
    test.skip("Get quote too low", async () => {
        const amount = 10n;

        const params: StargateETHQuoteParams = {
            amount,
            dstChain: optimismSepolia.id,
            srcChain: sepolia.id,
            receiver: "0x0000000000000000000000000000000000000001",
        };

        const quote = await queryClient.fetchQuery(stargateETHQuoteQueryOptions(wagmiConfig, params));

        expect(quote).toBe(null);
    });

    // Saves time to avoid running an online test, but use again if there are any changes to Stargate
    test.skip("Unsupported destination chain", async () => {
        const amount = 1n;

        const params: StargateETHQuoteParams = {
            amount,
            dstChain: polygon.id,
            srcChain: optimism.id,
            receiver: "0x0000000000000000000000000000000000000001",
        };

        await expect(queryClient.fetchQuery(stargateETHQuoteQueryOptions(wagmiConfig, params))).rejects.toThrowError(
            "is not supported by Stargate",
        );
    });
});
