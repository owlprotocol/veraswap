import { parseEther, zeroAddress } from "viem";
import { stargateQuote, StargateQuoteParams } from "./stargateQuote.js";
import { describe, expect, test } from "vitest";

describe("stargateQuote.test.ts", function () {
    test("Get quote", async () => {
        const quoteParams: StargateQuoteParams = {
            amount: parseEther("0.1"),
            dstChainKey: "arbitrum",
            srcChainKey: "ethereum",
            isMainnet: true,
            receiver: zeroAddress,
            sender: zeroAddress,
        };
        const quote = await stargateQuote(quoteParams);

        console.log({ quote });
        expect(BigInt(quote.transaction.value)).toBeGreaterThan(0n);
        expect(quote.duration).toBeGreaterThan(0);
    });
});
