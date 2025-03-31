import { Address, encodeFunctionData, Hex, parseEther, stringToHex } from "viem";
import { crossAddressAbi } from "./crossAddressAbi.js";

/**
 * getOrbiterETHTransferTransaction encodes a transaction to bridge ETH to another chain.
 * If the recipient is not provided, the transaction will be sent to the entrypoint directly.
 * Else, the transaction will be sent to the entrypoint contract with the recipient encoded in the data.
 * Note that the withholdingFee and the orbiterChainId is added to the amount.
 */
export function getOrbiterETHTransferTransaction({
    recipient,
    orbiterChainId,
    withholdingFee,
    amount,
    entrypoint,
    entrypointContract,
}: {
    recipient?: Address;
    orbiterChainId: number;
    withholdingFee: string;
    amount: bigint;
    entrypoint: Address;
    entrypointContract: Address;
}): { to: Address; value: bigint; data: Hex } {
    const totalAmount = amount + parseEther(withholdingFee) + BigInt(orbiterChainId);

    if (!recipient) {
        // Same recipient as sender, no need to use contract
        return {
            to: entrypoint,
            data: "0x",
            value: totalAmount,
        };
    }

    const transferData = stringToHex(`c=${orbiterChainId}&t=${recipient}`);

    const data = encodeFunctionData({
        abi: crossAddressAbi,
        functionName: "transfer",
        args: [entrypoint, transferData],
    });

    return {
        to: entrypointContract,
        data,
        value: totalAmount,
    };
}
