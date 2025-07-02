import { describe, expect, test } from "vitest";

import { opChainAClient, opChainL1Client } from "../chains/index.js";

import { LOCAL_UNISWAP_CONTRACTS } from "./uniswap.js";

describe("constants/uniswap.test.ts", function () {
    const clients = {
        [opChainL1Client.chain.id]: opChainL1Client,
        [opChainAClient.chain.id]: opChainAClient,
        // [opChainBClient.chain.id]: opChainBClient,
    };
    test("contracts exist", async () => {
        for (const [chainId, client] of Object.entries(clients)) {
            for (const [name, address] of Object.entries(LOCAL_UNISWAP_CONTRACTS)) {
                if (name === "v3PoolInitCodeHash" || name === "v2PairInitCodeHash") continue; // Skip v3PoolInitCodeHash & v2PairInitCodeHash as it's not a contract address

                await expect(client.getCode({ address }), `${name} at ${chainId},${address}`).resolves.toBeDefined();
            }
        }
    });
});
