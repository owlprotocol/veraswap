import { QueryClient } from "@tanstack/react-query";
import { http, parseEther } from "viem";
import { describe, expect, test } from "vitest";
import { createConfig } from "wagmi";

import { arbitrumSepolia, sepolia } from "../chains/index.js";

import { StargateETHQuoteParams, stargateETHQuoteQueryOptions } from "./stargateETHQuote.js";

describe("stargateETHQuote.test.ts", function () {
    const queryClient = new QueryClient();
    const wagmiConfig = createConfig({
        chains: [sepolia, arbitrumSepolia],
        transports: {
            [sepolia.id]: http(),
            [arbitrumSepolia.id]: http(),
        },
    });

    test("Get quote", async () => {
        const amount = parseEther("0.1");

        const params: StargateETHQuoteParams = {
            amount,
            dstChain: arbitrumSepolia.id,
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

    test("Get quote too low", async () => {
        const amount = 10n;

        const params: StargateETHQuoteParams = {
            amount,
            dstChain: arbitrumSepolia.id,
            srcChain: sepolia.id,
            receiver: "0x0000000000000000000000000000000000000001",
        };

        const quote = await queryClient.fetchQuery(stargateETHQuoteQueryOptions(wagmiConfig, params));

        expect(quote).toBe(null);
    });
});
