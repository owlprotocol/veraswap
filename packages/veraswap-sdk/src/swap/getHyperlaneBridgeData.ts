import { encodeFunctionData, Address, Hex, padHex } from "viem";
import { HypERC20Collateral } from "../artifacts/HypERC20Collateral.js";
import { HypERC20 } from "../artifacts/HypERC20.js";
import { Token } from "../types/index.js";

export function getHyperlaneBridgeTransaction({
    tokenIn,
    tokenOut,
    amount,
    recipient,
}: {
    tokenIn: Token;
    tokenOut: Token;
    amount: bigint;
    recipient: Address;
}): { to: Address; data: Hex; value: bigint } {
    const destinationChain = tokenOut.chainId;
    const tokenStandard = tokenIn.standard;

    const abi = tokenStandard === "HypERC20Collateral" ? HypERC20Collateral.abi : HypERC20.abi;

    const bridgeAddress = tokenStandard === "HypERC20Collateral" ? tokenIn.collateralAddress : tokenIn.address;

    const data = encodeFunctionData({
        abi,
        functionName: "transferRemote",
        args: [destinationChain, padHex(recipient, { size: 32 }), amount],
    });

    return {
        to: bridgeAddress,
        data,
        value: 0n,
    };
}
