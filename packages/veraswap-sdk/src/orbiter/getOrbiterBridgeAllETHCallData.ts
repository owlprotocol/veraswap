import { decodeFunctionData, encodeFunctionData } from "viem";

import { bridgeAllETH } from "../artifacts/OrbiterBridgeSweep.js";
import { OrbiterQuote } from "../query/orbiterQuote.js";

import { executeBridgeAbi } from "./executeBridgeAbi.js";

export function getOrbiterBridgeAllETHCallData(orbiterQuote: OrbiterQuote) {
    const bridgeStep = orbiterQuote.steps.find((step) => step.action === "bridge");

    const to = bridgeStep!.tx.to;

    const { args: orbiterQuoteDataDecoded } = decodeFunctionData({
        abi: [executeBridgeAbi],
        data: bridgeStep!.tx.data,
    });
    return encodeFunctionData({
        abi: [bridgeAllETH],
        functionName: "bridgeAllETH",
        args: [to, orbiterQuoteDataDecoded[0]],
    });
}
