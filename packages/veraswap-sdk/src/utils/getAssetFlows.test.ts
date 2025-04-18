import { describe, expect, test } from "vitest";

import { LOCAL_CURRENCIES, LOCAL_POOLS } from "../constants/tokens.js";

import { getAssetFlows } from "./getAssetFlows.js";

describe("utils/getAssetFlows.test.ts", function () {
    const tokenA_900 = LOCAL_CURRENCIES[0];
    const tokenA_901 = LOCAL_CURRENCIES[1];
    const tokenB_900 = LOCAL_CURRENCIES[3];
    const tokenB_901 = LOCAL_CURRENCIES[4];

    test("BRIDGE", () => {
        const flows = getAssetFlows(tokenA_900, tokenA_901, LOCAL_POOLS);
        expect(flows).toBeDefined();
        expect(flows!.length).toBe(1);
        expect(flows![0].type).toBe("BRIDGE");
    });

    test("SWAP", () => {
        const flows = getAssetFlows(tokenA_900, tokenB_900, LOCAL_POOLS);
        expect(flows).toBeDefined();
        expect(flows!.length).toBe(1);
        expect(flows![0].type).toBe("SWAP");
    });

    test("SWAP_BRIDGE", () => {
        const flows = getAssetFlows(tokenA_900, tokenB_901, LOCAL_POOLS);
        expect(flows).toBeDefined();
        expect(flows!.length).toBe(2);
        expect(flows![0].type).toBe("SWAP");
        expect(flows![1].type).toBe("BRIDGE");
    });

    test("BRIDGE_SWAP", () => {
        const flows = getAssetFlows(tokenA_901, tokenB_900, LOCAL_POOLS);
        expect(flows).toBeDefined();
        expect(flows!.length).toBe(2);
        expect(flows![0].type).toBe("BRIDGE");
        expect(flows![1].type).toBe("SWAP");
    });

    test("BRIDGE_SWAP_BRIDGE", () => {
        const flows = getAssetFlows(tokenA_901, tokenB_901, LOCAL_POOLS);
        expect(flows).toBeDefined();
        expect(flows!.length).toBe(3);
        expect(flows![0].type).toBe("BRIDGE");
        expect(flows![1].type).toBe("SWAP");
        expect(flows![2].type).toBe("BRIDGE");
    });
});
