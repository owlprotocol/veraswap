import { Address, encodeFunctionData, padHex } from "viem";
import { CommandType, RouterCommand, createCommand } from "../routerCommands.js";
import { transferRemote } from "../../artifacts/HypTokenRouterSweep.js";
import { HYPERLANE_ROUTER_SWEEP_ADDRESS } from "../../constants/hyperlane.js";

export function getHyperlaneTransferRemoteCommand({ bridgePayment, router, destination, recipient }: { bridgePayment: bigint, router: Address, destination: number, recipient: Address }): RouterCommand {
    return createCommand(CommandType.CALL_TARGET, [HYPERLANE_ROUTER_SWEEP_ADDRESS,
        bridgePayment,
        encodeFunctionData({
            abi: [transferRemote],
            functionName: "transferRemote",
            args: [
                router,
                destination,
                padHex(recipient, { size: 32 }),
            ],
        })]),
}
