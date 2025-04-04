import { describe, expect, test } from "vitest";
import { zeroAddress } from "viem";
import { LOCAL_TOKENS } from "./tokens.js";
import { opChainL1Client, opChainAClient, opChainBClient } from "../chains/index.js";

describe("constants/tokens.test.ts", function () {
    const clients = {
        [opChainL1Client.chain.id]: opChainL1Client,
        [opChainAClient.chain.id]: opChainAClient,
        [opChainBClient.chain.id]: opChainBClient,
    };
    test("tokens exist", async () => {
        // Ignore zeroAddress tokens
        for (const token of LOCAL_TOKENS.filter((t) => t.address != zeroAddress)) {
            const client = clients[token.chainId as 900 | 901 | 902];
            await expect(
                client.getCode({ address: token.address }),
                `${token.standard}(${token.name}, ${token.symbol}) at ${token.chainId},${token.address}`,
            ).resolves.toBeDefined();

            if (token.standard === "HypERC20Collateral") {
                await expect(
                    client.getCode({ address: token.collateralAddress }),
                    `MockERC20(${token.name}, ${token.symbol}) at ${token.chainId},${token.collateralAddress}`,
                ).resolves.toBeDefined();
            }
        }
    });
});
