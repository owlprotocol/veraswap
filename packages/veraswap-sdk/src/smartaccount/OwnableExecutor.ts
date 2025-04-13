import { Address, encodeFunctionData, encodePacked, Hash, hashTypedData, Hex, TypedDataDomain } from "viem";

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

export interface SignatureExecution {
    account: Address;
    nonce: bigint;
    validAfter: number;
    validUntil: number;
    value: bigint;
    callData: Hex;
}
export const SIGNATURE_EXECUTION_ABI = [
    { name: "account", type: "address", internalType: "address" },
    { name: "nonce", type: "uint256", internalType: "uint256" },
    { name: "validAfter", type: "uint48", internalType: "uint48" },
    { name: "validUntil", type: "uint48", internalType: "uint48" },
    { name: "value", type: "uint256", internalType: "uint256" },
    { name: "callData", type: "bytes", internalType: "bytes" },
] as const;

export const SIGNATURE_EXECUTOR_DOMAIN_NAME = "SignatureExecutor";
export function signatureExecutorDomain(signatureExecutorAddress: Address, chainId: number): TypedDataDomain {
    return {
        name: SIGNATURE_EXECUTOR_DOMAIN_NAME,
        chainId,
        verifyingContract: signatureExecutorAddress,
    };
}

export function getSignatureExecutionData(
    signatureExecution: SignatureExecution,
    signatureExecutorAddress: Address,
    chainId: number,
) {
    return {
        domain: signatureExecutorDomain(signatureExecutorAddress, chainId),
        types: {
            SignatureExecution: SIGNATURE_EXECUTION_ABI,
        },
        primaryType: "SignatureExecution",
        message: signatureExecution,
    } as const;
}

export function getSignatureExecutionHash(
    signatureExecution: SignatureExecution,
    signatureExecutorAddress: Address,
    chainId: number,
): Hash {
    return hashTypedData(getSignatureExecutionData(signatureExecution, signatureExecutorAddress, chainId));
}
