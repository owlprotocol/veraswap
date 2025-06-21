import { Address, encodeFunctionData, padHex } from "viem";

import { transferRemote } from "../../artifacts/HypTokenRouterSweep.js";
import { HYPERLANE_ROUTER_SWEEP_ADDRESS } from "../../constants/hyperlane.js";
import { CommandType, createCommand, RouterCommand } from "../routerCommands.js";

export function getHyperlaneTransferRemoteCommand({
    bridgePayment,
    router,
    destination,
    recipient,
}: {
    bridgePayment: bigint;
    router: Address;
    destination: number;
    recipient: Address;
}): RouterCommand {
    return createCommand(CommandType.CALL_TARGET, [
        HYPERLANE_ROUTER_SWEEP_ADDRESS,
        bridgePayment,
        encodeFunctionData({
            abi: [transferRemote],
            functionName: "transferRemote",
            args: [router, destination, padHex(recipient, { size: 32 })],
        }),
    ]);
}
