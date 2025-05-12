import { QueryClient } from "@tanstack/react-query";
import { http, parseEther, zeroAddress } from "viem";
import { arbitrum, mainnet } from "viem/chains";
import { describe, test } from "vitest";
import { createConfig } from "wagmi";

import { stargateQuote, StargateQuoteParams } from "./stargateQuote.js";

describe("stargateQuote.test.ts", function () {
    test("Get quote", async () => {
        const params: StargateQuoteParams = {
            amount: parseEther("0.1"),
            dstChain: arbitrum.id,
            srcChain: mainnet.id,
            isMainnet: true,
            receiver: zeroAddress,
            sender: zeroAddress,
        };

        const queryClient = new QueryClient();
        const wagmiConfig = createConfig({
            chains: [arbitrum, mainnet],
            transports: {
                [arbitrum.id]: http(),
                [mainnet.id]: http(),
            },
        });
        const quote = await stargateQuote(queryClient, wagmiConfig, params);

        console.log({ quote });
        // expect(BigInt(quote.transaction.value)).toBeGreaterThan(0n);
        // expect(quote.duration).toBeGreaterThan(0);
    });
});
