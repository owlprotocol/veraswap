import { describe, expect, test } from "vitest";
import { MOCK_MAILBOX_CONTRACTS } from "./constants.js";
import { opChainL1Client } from "../chains/index.js";

describe("test/constants.test.ts", function () {
    test("contracts exist", async () => {
        for (const [name, address] of Object.entries(MOCK_MAILBOX_CONTRACTS[900])) {
            await expect(opChainL1Client.getCode({ address }), `${name} at ${900},${address}`).resolves.toBeDefined();
        }
        for (const [name, address] of Object.entries(MOCK_MAILBOX_CONTRACTS[901])) {
            await expect(opChainL1Client.getCode({ address }), `${name} at ${901},${address}`).resolves.toBeDefined();
        }
    });
});
