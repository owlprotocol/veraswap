import { describe, expect, test } from "vitest";
import { LOCAL_UNISWAP_CONTRACTS } from "./uniswap.js";
import { opChainL1Client, opChainAClient } from "../chains/index.js";

describe("constants/uniswap.test.ts", function () {
    const clients = {
        [opChainL1Client.chain.id]: opChainL1Client,
        [opChainAClient.chain.id]: opChainAClient,
        // [opChainBClient.chain.id]: opChainBClient,
    };
    test("contracts exist", async () => {
        for (const [chainId, client] of Object.entries(clients)) {
            for (const [name, address] of Object.entries(LOCAL_UNISWAP_CONTRACTS)) {
                await expect(client.getCode({ address }), `${name} at ${chainId},${address}`).resolves.toBeDefined();
            }
        }
    });
});
