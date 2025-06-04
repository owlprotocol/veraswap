import { Config, readContract } from "@wagmi/core";
import { Address } from "viem";

import { quoteOFT, quoteSend } from "../artifacts/IStargate.js";
import { StargateSendParam } from "../types/StargateSendParam.js";

export async function stargateGetFee(
    wagmiConfig: Config,
    srcChain: number,
    poolAddress: Address,
    sendParam: StargateSendParam,
) {
    const quoteOFTResult = await readContract(wagmiConfig, {
        chainId: srcChain,
        address: poolAddress,
        abi: [quoteOFT],
        functionName: "quoteOFT",
        args: [sendParam],
    });

    const receipt = quoteOFTResult[2];

    // Amount is too low
    if (receipt.amountReceivedLD === 0n) return null;

    // TODO: remove this if unnecessary when already using slippage?
    // sendParam.minAmountLD = receipt.amountReceivedLD;
    // Don't want to pay in LayerZero token
    const payInLzToken = false;

    const quote = await readContract(wagmiConfig, {
        chainId: srcChain,
        address: poolAddress,
        abi: [quoteSend],
        functionName: "quoteSend",
        args: [sendParam, payInLzToken],
    });

    return quote.nativeFee;
}
