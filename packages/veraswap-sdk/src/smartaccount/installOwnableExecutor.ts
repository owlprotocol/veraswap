import {
    Address,
    concatHex,
    encodeAbiParameters,
    encodeFunctionData,
    encodePacked,
    Hex,
    parseAbiParameters,
    zeroAddress,
} from "viem";
import { Kernel } from "../artifacts/Kernel.js";
import { encodeInstallExecutorData, ERC7579_MODULE_TYPE } from "./ERC7579Module.js";

/**
 * Get OwnableExecutor installation function data
 * @param owner Account owner
 * @param executor ERC7579 executor (defaults to official)
 * @returns Encoded ERC7579 `installModule` function data to install OwnableExecutor on a ERC7579 Smart Account
 */
export function installOwnableExecutor({ owner, executor }: { owner: Address; executor: Address }): Hex {
    const executorData = encodePacked(["address"], [owner]);
    return encodeFunctionData({
        abi: Kernel.abi,
        functionName: "installModule",
        args: [BigInt(ERC7579_MODULE_TYPE.EXECUTOR), executor, encodeInstallExecutorData({ executorData })],
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
