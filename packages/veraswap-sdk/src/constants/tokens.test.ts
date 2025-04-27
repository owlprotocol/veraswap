import { describe, expect, test } from "vitest";

import { opChainAClient, opChainBClient, opChainL1Client } from "../chains/index.js";

import { LOCAL_CURRENCIES } from "./tokens.js";

describe("constants/tokens.test.ts", function () {
    const clients = {
        [opChainL1Client.chain.id]: opChainL1Client,
        [opChainAClient.chain.id]: opChainAClient,
        [opChainBClient.chain.id]: opChainBClient,
    };
    test("tokens exist", async () => {
        // Ignore zeroAddress tokens
        for (const token of LOCAL_CURRENCIES.filter((t) => !t.isNative)) {
            const client = clients[token.chainId as 900 | 901 | 902];
            await expect(
                client.getCode({ address: token.address }),
                `${token.standard}(${token.name}, ${token.symbol}) at ${token.chainId},${token.address}`,
            ).resolves.toBeDefined();

            if (token.hyperlaneAddress != null && token.hyperlaneAddress !== token.address) {
                await expect(
                    client.getCode({ address: token.hyperlaneAddress }),
                    `HypERC20Collateral(${token.name}, ${token.symbol}) at ${token.chainId},${token.hyperlaneAddress}`,
                ).resolves.toBeDefined();
            }
        }
    });
});
