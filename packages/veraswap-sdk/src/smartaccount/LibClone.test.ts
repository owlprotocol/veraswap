import { Address, zeroAddress, zeroHash } from "viem";
import { describe, expect, test } from "vitest";

import { initCodeERC1967, initCodeHashERC1967, predictDeterministicAddressERC1967 } from "./LibClone.js";

describe("smartaccount/LibClone.test.ts", () => {
    const implementation = "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF".toLowerCase() as Address;
    const initCode =
        "0x603d3d8160223d3973ffffffffffffffffffffffffffffffffffffffff60095155f3363d3d373d3d363d7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc545af43d6000803e6038573d6000fd5b3d6000f3";
    const initCodeHash = "0xb8540626bcbf5673a2648e866ce4cc5b88389fb5cc70e9eafb1bbd2dbee1f58e";
    const predicted = "0xDF6b006DaDD10fd3CDDC97c944a3f8be3B7a3fD3";

    test("initCodeERC1967", () => {
        expect(initCodeERC1967(implementation)).toBe(initCode);
    });
    test("initCodeHashERC1967", () => {
        expect(initCodeHashERC1967(implementation)).toBe(initCodeHash);
    });
    test("predictDeterministicAddressERC1967", () => {
        expect(predictDeterministicAddressERC1967(implementation, zeroHash, zeroAddress)).toBe(predicted);
    });
});
