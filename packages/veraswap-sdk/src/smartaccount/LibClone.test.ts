import { describe, expect, test } from "vitest";
import { getInitCodeERC1967, getInitCodeHashERC1967 } from "./LibClone.js";
import { Address } from "viem";

describe("smartaccount/LibClone.test.ts", () => {
    const implementation = "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF".toLowerCase() as Address;
    const initCode =
        "0x603d3d8160223d3973ffffffffffffffffffffffffffffffffffffffff60095155f3363d3d373d3d363d7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc545af43d6000803e6038573d6000fd5b3d6000f3";
    const initCodeHash = "0xb8540626bcbf5673a2648e866ce4cc5b88389fb5cc70e9eafb1bbd2dbee1f58e";

    test("getInitCodeERC1967", () => {
        expect(getInitCodeERC1967(implementation)).toBe(initCode);
    });
    test("getInitCodeHashERC1967", () => {
        expect(getInitCodeHashERC1967(implementation)).toBe(initCodeHash);
    });
});
