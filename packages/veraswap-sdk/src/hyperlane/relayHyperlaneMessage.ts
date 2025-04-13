import { Account, Address, Chain, Hex, Transport, WalletClient } from "viem";

import { Mailbox } from "../artifacts/Mailbox.js";

export async function relayHyperlaneMessage(params: {
    walletClient: WalletClient<Transport, Chain, Account>;
    mailboxAddress: Address;
    message: Hex;
    metadata: Hex;
    value?: bigint;
}) {
    const { walletClient, message, metadata, mailboxAddress, value } = params;

    const hash = await walletClient.writeContract({
        address: mailboxAddress,
        abi: Mailbox.abi,
        functionName: "process",
        args: [metadata, message],
        value,
    });
    return hash;
}
