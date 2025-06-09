import { PERMIT2_ADDRESS } from "@uniswap/permit2-sdk";
import { Address, encodeFunctionData, Hex } from "viem";

import { IAllowanceTransfer } from "../artifacts/IAllowanceTransfer.js";
import { IERC20 } from "../artifacts/IERC20.js";
import { MAX_UINT_160, MAX_UINT_256, MAX_UINT_48 } from "../constants/index.js";
import { RoutePlanner } from "../uniswap/routerCommands.js";

import { getSwapExactInExecuteData } from "./getSwapExactInExecuteData.js";

export function getEOASwapCalls({
    amountIn,
    currencyIn,
    universalRouter,
    routePlanner,
    approvePermit2 = true,
}: {
    amountIn: bigint;
    currencyIn: Address;
    universalRouter: Address;
    routePlanner: RoutePlanner;
    approvePermit2?: boolean;
}): { to: Address; data: Hex; value: bigint }[] {
    /** *** Permit2 Approve universalRouter *****/
    // approve Permit2 to spend Token A
    const approvePermit2Data = {
        to: currencyIn,
        data: encodeFunctionData({
            abi: IERC20.abi,
            functionName: "approve",
            args: [PERMIT2_ADDRESS, MAX_UINT_256],
        }),
        value: 0n,
    };

    // approve Uniswap to spend smart wallet
    const approveUniswapRouter = {
        to: PERMIT2_ADDRESS as Address,
        data: encodeFunctionData({
            abi: IAllowanceTransfer.abi,
            functionName: "approve",
            args: [currencyIn, universalRouter, MAX_UINT_160, MAX_UINT_48],
        }),
        value: 0n,
    };

    const routerExecuteData = getSwapExactInExecuteData({
        universalRouter,
        currencyIn,
        routePlanner,
        amountIn,
    });

    if (approvePermit2) {
        return [
            approvePermit2Data,
            approveUniswapRouter,
            routerExecuteData,
            // To be added
            // approveHypERC20CollateralData
            // ERC20CollateralTransferFromData
        ] as const;
    } else {
        return [
            approveUniswapRouter,
            routerExecuteData,
            // To be added
            // approveHypERC20CollateralData
            // ERC20CollateralTransferFromData
        ] as const;
    }
}
