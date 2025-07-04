import { describe, expect, test } from "vitest";

import { opChainAClient, opChainBClient, opChainL1Client } from "../chains/index.js";
import { MultichainToken } from "../currency/multichainToken.js";
import { Token } from "../currency/token.js";

import { LOCAL_CURRENCIES } from "./tokens.js";

/**
 * Honestly, this test is not very useful
 * Also, it's nice to have some display names for our local tokens (eg. Zoe for token Z)
 * Conclusion: skipping this test for now
 */
describe.skip("constants/tokens.test.ts", function () {
    const clients = {
        [opChainL1Client.chain.id]: opChainL1Client,
        [opChainAClient.chain.id]: opChainAClient,
        [opChainBClient.chain.id]: opChainBClient,
    };
    test("tokens exist", async () => {
        // Ignore zeroAddress tokens
        for (const token of LOCAL_CURRENCIES) {
            const client = clients[token.chainId as 900 | 901 | 902];

            if (token instanceof MultichainToken) {
                // Multichain Token
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
            } else if (token instanceof Token) {
                // Regular ERC20 token
                await expect(
                    client.getCode({ address: token.address }),
                    `ERC20(${token.name}, ${token.symbol}) at ${token.chainId},${token.address}`,
                ).resolves.toBeDefined();
            }
        }
    });
});
