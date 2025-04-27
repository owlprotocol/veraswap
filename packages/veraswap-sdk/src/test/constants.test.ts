import { zeroAddress } from "viem";
import { describe, expect, test } from "vitest";

import { opChainL1Client } from "../chains/index.js";

import { MOCK_MAILBOX_CONTRACTS, MOCK_MAILBOX_TOKENS } from "./constants.js";

describe("test/constants.test.ts", function () {
    test("contracts exist", async () => {
        // Contracts
        for (const [name, address] of Object.entries(MOCK_MAILBOX_CONTRACTS[900])) {
            await expect(opChainL1Client.getCode({ address }), `${name} at ${900},${address}`).resolves.toBeDefined();
        }
        for (const [name, address] of Object.entries(MOCK_MAILBOX_CONTRACTS[901])) {
            await expect(opChainL1Client.getCode({ address }), `${name} at ${901},${address}`).resolves.toBeDefined();
        }
        // Tokens
        // Ignore zeroAddress tokens
        for (const token of MOCK_MAILBOX_TOKENS.filter((t) => t.address != zeroAddress)) {
            await expect(
                opChainL1Client.getCode({ address: token.address }),
                `${token.standard}(${token.name}, ${token.symbol}) at ${token.chainId},${token.address}`,
            ).resolves.toBeDefined();

            if (token.hyperlaneAddress != null && token.hyperlaneAddress !== token.address) {
                await expect(
                    opChainL1Client.getCode({ address: token.hyperlaneAddress }),
                    `HypERC20Collateral(${token.name}, ${token.symbol}) at ${token.chainId},${token.hyperlaneAddress}`,
                ).resolves.toBeDefined();
            }
        }
    });
});
