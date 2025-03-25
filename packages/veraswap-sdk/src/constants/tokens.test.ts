import { describe, expect, test } from "vitest";
import { LOCAL_TOKENS } from "./tokens.js";
import { opChainL1Client, opChainAClient, opChainBClient } from "./chains.js";

describe("constants/tokens.test.ts", function () {
    const clients = {
        [opChainL1Client.chain.id]: opChainL1Client,
        [opChainAClient.chain.id]: opChainAClient,
        [opChainBClient.chain.id]: opChainBClient,
    };
    test("tokens exist", async () => {
        for (const token of LOCAL_TOKENS) {
            const client = clients[token.chainId as 900 | 901 | 902];
            await expect(
                client.getCode({ address: token.address }),
                `${token.standard}(${token.name}, ${token.symbol}) at ${token.chainId},${token.address}`,
            ).resolves.toBeDefined();

            if (token.standard === "HypERC20Collateral") {
                await expect(
                    client.getCode({ address: token.collateralAddress! }),
                    `MockERC20(${token.name}, ${token.symbol}) at ${token.chainId},${token.collateralAddress}`,
                ).resolves.toBeDefined();
            }
        }
    });
});
