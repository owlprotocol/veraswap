import { decodeFunctionData, encodeFunctionData } from "viem";

import { bridgeAllETH } from "../../artifacts/OrbiterBridgeSweep.js";
import { executeBridgeAbi } from "../../orbiter/executeBridgeAbi.js";
import { OrbiterQuote } from "../../query/orbiterQuote.js";
import { ORBITER_BRIDGE_SWEEP_ADDRESS } from "../../constants/orbiter.js";
import { CommandType, RouterCommand, createCommand } from "../routerCommands.js";

export function getOrbiterBridgeAllETHCommand(orbiterQuote: OrbiterQuote): RouterCommand {
    const bridgeStep = orbiterQuote.steps.find((step) => step.action === "bridge");

    const to = bridgeStep!.tx.to;
    const { args: orbiterQuoteDataDecoded } = decodeFunctionData({
        abi: [executeBridgeAbi],
        data: bridgeStep!.tx.data,
    });
    const data = encodeFunctionData({
        abi: [bridgeAllETH],
        functionName: "bridgeAllETH",
        args: [to, orbiterQuoteDataDecoded[0]],
    });

    return createCommand(CommandType.CALL_TARGET, [ORBITER_BRIDGE_SWEEP_ADDRESS, 0n, data]),
}
