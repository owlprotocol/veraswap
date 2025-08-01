import { Address, encodeFunctionData } from "viem";

import { sendAllERC20 } from "../../artifacts/SuperchainTokenBridgeSweep.js";
import { SUPERCHAIN_SWEEP_ADDRESS } from "../../chains/supersim.js";
import { CommandType, createCommand, RouterCommand } from "../routerCommands.js";

export function getSuperchainSendAllERC20Command({
    token,
    to,
    chainId,
}: {
    token: Address;
    to: Address;
    chainId: number;
}): RouterCommand {
    return createCommand(CommandType.CALL_TARGET, [
        SUPERCHAIN_SWEEP_ADDRESS,
        0n,
        encodeFunctionData({
            abi: [sendAllERC20],
            functionName: "sendAllERC20",
            args: [token, to, BigInt(chainId)],
        }),
    ]);
}
