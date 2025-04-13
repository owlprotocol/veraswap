import { Client, Transport, Chain, Account, Address } from "viem";
import { waitForTransactionReceipt, writeContract } from "viem/actions";
import { MockMailbox } from "../artifacts/MockMailbox.js";

/**
 * Viem action to process Hyperlane MockMailbox message
 * @param client
 * @param params
 */
export async function processNextInboundMessage(
    client: Client<Transport, Chain, Account>,
    params: { mailbox: Address },
) {
    const { mailbox } = params;

    // Process Hyperlane Message
    const hash = await writeContract(client, {
        address: mailbox,
        abi: MockMailbox.abi,
        functionName: "processNextInboundMessage",
    });
    const receipt = await waitForTransactionReceipt(client, {
        hash,
    });

    return receipt;
}
