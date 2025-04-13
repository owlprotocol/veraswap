import { describe, expect, test } from "vitest";

import { opChainAClient, opChainL1Client } from "../chains/index.js";

import { LOCAL_KERNEL_CONTRACTS } from "./kernel.js";

describe("constants/kernel.test.ts", function () {
    const clients = {
        [opChainL1Client.chain.id]: opChainL1Client,
        [opChainAClient.chain.id]: opChainAClient,
        // [opChainBClient.chain.id]: opChainBClient,
    };
    test("contracts exist", async () => {
        for (const [chainId, client] of Object.entries(clients)) {
            for (const [name, address] of Object.entries(LOCAL_KERNEL_CONTRACTS)) {
                await expect(client.getCode({ address }), `${name} at ${chainId},${address}`).resolves.toBeDefined();
            }
        }
    });
});
