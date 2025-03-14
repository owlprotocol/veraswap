import { Address, concatHex, encodeAbiParameters, encodeFunctionData, parseAbiParameters, zeroAddress } from "viem";
import { KernelV3_1AccountAbi } from "@zerodev/sdk";

export enum ERC7579_MODULE_TYPE {
    VALIDATOR = 1,
    EXECUTOR = 2,
    FALLBACK = 3,
    HOOK = 4,
}

// OwnableSignaturExecutor
// TODO: Add better logic for default address config
export const DEFAULT_EXECUTOR = zeroAddress;

/**
 *
 * @returns Encoded ERC7579 `installModule` call to install OwnableExecutor
 */
export function installOwnableExecutor({ owner, executor }: { owner: Address; executor?: Address }) {
    const hook = zeroAddress; // no hook
    const hookData = "0x"; // no hook data
    const executorData = encodeAbiParameters([{ type: "address" }], [owner]);
    return encodeFunctionData({
        abi: KernelV3_1AccountAbi,
        functionName: "installModule",
        args: [
            BigInt(ERC7579_MODULE_TYPE.EXECUTOR),
            executor ?? DEFAULT_EXECUTOR,
            concatHex([hook, encodeAbiParameters(parseAbiParameters(["bytes", "bytes"]), [executorData, hookData])]),
        ],
    });
}
