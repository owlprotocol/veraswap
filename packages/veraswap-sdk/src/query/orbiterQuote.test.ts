import { parseEther, zeroAddress } from "viem";
import { base, optimism } from "viem/chains";
import { describe, expect, test } from "vitest";

import { orbiterQuote, OrbiterQuoteParams } from "./orbiterQuote.js";

describe("orbiterQuote.test.ts", function () {
    test("Get orbiter routers mainnet", async () => {
        const isMainnet = true;
        const params: OrbiterQuoteParams = {
            amount: parseEther("1"),
            sourceChainId: optimism.id,
            destChainId: base.id,
            sourceToken: zeroAddress,
            destToken: zeroAddress,
            userAddress: "0xefc6089224068b20197156a91d50132b2a47b908",
        };

        const orbiterQuoteMainnet = await orbiterQuote(params, isMainnet);

        expect(BigInt(orbiterQuoteMainnet.details.minDestTokenAmount)).toBeGreaterThan(0n);
        expect(orbiterQuoteMainnet.details.midTokenSymbol).toBe("ETH");
        expect(BigInt(orbiterQuoteMainnet.details.sourceTokenAmount)).toBe(params.amount);
        expect(orbiterQuoteMainnet.steps.length).toBe(1);
        expect(orbiterQuoteMainnet.steps[0].action).toBe("bridge");
        expect(BigInt(orbiterQuoteMainnet.steps[0].tx.value)).toBeGreaterThan(0n);
    });
});
