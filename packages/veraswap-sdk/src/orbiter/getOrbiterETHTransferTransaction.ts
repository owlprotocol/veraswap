import { Address, encodeFunctionData, Hex, stringToHex } from "viem";
import { crossAddressAbi } from "./crossAddressAbi.js";

// Should be all lowercase
const PUBLIC_ADDRESS_UTILITY = "0xa2e8b0ae8b5a51d494ecf7e35f3734a6ced7eecf";

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

    const chainAndApp = `c=${identificationCode}&app=${PUBLIC_ADDRESS_UTILITY}`;
    const transferDataString = recipient ? `${chainAndApp}&t=${recipient}` : chainAndApp;
    const transferData = stringToHex(transferDataString);

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
