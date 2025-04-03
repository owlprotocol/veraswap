import { Address, encodeFunctionData, Hex, stringToHex } from "viem";
import { crossAddressAbi } from "./crossAddressAbi.js";

/**
 * getOrbiterETHTransferTransaction encodes a transaction to bridge ETH to another chain.
 * Assumes that the withholding fee is included in the amount.
 * If the recipient is not provided, the transaction will be sent to the endpoint directly.
 * Else, the transaction will be sent to the endpoint contract with the recipient encoded in the data.
 * Note that the withholdingFee and the orbiterChainId is added to the amount.
 */
export function getOrbiterETHTransferTransaction({
    recipient,
    orbiterChainId,
    amount,
    endpoint,
    endpointContract,
}: {
    recipient?: Address;
    orbiterChainId: number;
    amount: bigint;
    endpoint: Address;
    endpointContract: Address;
}): { to: Address; value: bigint; data: Hex } {
    const identificationCode = 9000 + orbiterChainId;
    const totalAmount = amount + BigInt(identificationCode);

    if (!recipient) {
        // Same recipient as sender, no need to use contract
        return {
            to: endpoint,
            data: "0x",
            value: totalAmount,
        };
    }

    const transferData = stringToHex(`c=${orbiterChainId}&t=${recipient}`);

    const data = encodeFunctionData({
        abi: crossAddressAbi,
        functionName: "transfer",
        args: [endpoint, transferData],
    });

    return {
        to: endpointContract,
        data,
        value: totalAmount,
    };
}
