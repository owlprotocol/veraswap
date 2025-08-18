import { QueryClient } from "@tanstack/react-query";
import { http, parseEther } from "viem";
import { optimismSepolia, sepolia } from "viem/chains";
import { describe, expect, test } from "vitest";
import { createConfig } from "wagmi";

import { arbitrum, optimism } from "../chains/index.js";

import { StargateTokenQuoteParams, stargateTokenQuoteQueryOptions } from "./stargateTokenQuote.js";

describe("stargateTokenQuote.test.ts", function () {
    const queryClient = new QueryClient();
    const wagmiConfig = createConfig({
        chains: [arbitrum, optimism],
        transports: {
            [arbitrum.id]: http(),
            [optimism.id]: http(),
        },
    });

    test("Get quote", async () => {
        const amount = parseEther("0.1");

        const params: StargateTokenQuoteParams = {
            amount,
            tokenSymbol: "USDC",
            dstChain: optimism.id,
            srcChain: arbitrum.id,
            receiver: "0x0000000000000000000000000000000000000001",
        };

        const quote = await queryClient.fetchQuery(stargateTokenQuoteQueryOptions(wagmiConfig, params));

        expect(quote).not.toBeNull();
        const { amount: amountQuote, fee, minAmountLD } = quote!;
        expect(amountQuote).toBe(amount);
        expect(minAmountLD).toBeLessThan(amount);
        expect(fee).toBeGreaterThan(0n);
    });

    // Saves time to avoid running an online test, but use again if there are any changes to Stargate
    test.skip("Get quote too low", async () => {
        const amount = 1n;

        const params: StargateTokenQuoteParams = {
            amount,
            tokenSymbol: "USDC",
            dstChain: optimism.id,
            srcChain: arbitrum.id,
            receiver: "0x0000000000000000000000000000000000000001",
        };

        const quote = await queryClient.fetchQuery(stargateTokenQuoteQueryOptions(wagmiConfig, params));

        expect(quote).toBe(null);
    });

    // Saves time to avoid running an online test, but use again if there are any changes to Stargate
    test.skip("Unsupported chain", async () => {
        const amount = 1n;

        const params: StargateTokenQuoteParams = {
            amount,
            tokenSymbol: "USDC",
            dstChain: optimismSepolia.id,
            srcChain: sepolia.id,
            receiver: "0x0000000000000000000000000000000000000001",
        };

        await expect(queryClient.fetchQuery(stargateTokenQuoteQueryOptions(wagmiConfig, params))).rejects.toThrowError(
            "is not supported by Stargate",
        );
    });
});
