import { Address, encodeFunctionData, Hex } from "viem";

import { crossAddressAbi } from "./crossAddressAbi.js";
import { getOrbiterTransferData } from "./getOrbiterTransferData.js";

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
    // NOTE: We remove the last for digits to avoid conflicting with the identification code
    const amountStripped = (amount / 10000n) * 10000n;

    const identificationCode = 9000 + orbiterChainId;
    const totalAmount = amountStripped + BigInt(identificationCode);

    const transferData = getOrbiterTransferData({ orbiterChainId, recipient });

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
