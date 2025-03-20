import {
    Address,
    concatHex,
    encodeAbiParameters,
    encodeFunctionData,
    Hex,
    parseAbiParameters,
    zeroAddress,
} from "viem";
import { KernelV3_1AccountAbi } from "@zerodev/sdk";

export enum ERC7579_MODULE_TYPE {
    VALIDATOR = 1,
    EXECUTOR = 2,
    FALLBACK = 3,
    HOOK = 4,
}

/**
 * Get OwnableExecutor installation function data
 * @param owner Account owner
 * @param executor ERC7579 executor (defaults to official)
 * @returns Encoded ERC7579 `installModule` function data to install OwnableExecutor on a ERC7579 Smart Account
 */
export function installOwnableExecutor({ owner, executor }: { owner: Address; executor: Address }): Hex {
    const hook = zeroAddress; // no hook
    const hookData = "0x"; // no hook data
    const executorData = encodeAbiParameters([{ type: "address" }], [owner]);
    return encodeFunctionData({
        abi: KernelV3_1AccountAbi,
        functionName: "installModule",
        args: [
            BigInt(ERC7579_MODULE_TYPE.EXECUTOR),
            executor,
            concatHex([hook, encodeAbiParameters(parseAbiParameters(["bytes", "bytes"]), [executorData, hookData])]),
        ],
    });
}

/**
 *
 * @param accountAddress ERC7579 Smart Account Address
 * @param owner Account owner
 * @param executor ERC7579 executor (defaults to official)
 * @returns Transaction data to call `installModule` on the smart account
 */
export function getInstallOwnableExecutorCall({
    accountAddress,
    owner,
    executor,
}: {
    accountAddress: Address;
    owner: Address;
    executor: Address;
}) {
    return {
        to: accountAddress,
        data: installOwnableExecutor({ owner, executor }),
        value: 0n,
    };
}
