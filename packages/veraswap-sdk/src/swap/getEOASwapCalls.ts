import { PERMIT2_ADDRESS } from "@uniswap/permit2-sdk";
import { Address, encodeFunctionData, Hex } from "viem";
import { PoolKey } from "@uniswap/v4-sdk";
import { IERC20 } from "@owlprotocol/contracts-hyperlane";
import { getSwapExactInExecuteData } from "./getSwapExactInExecuteData.js";
import { IAllowanceTransfer } from "../artifacts/IAllowanceTransfer.js";
import { MAX_UINT_256, MAX_UINT_160, MAX_UINT_48 } from "../constants.js";

export function getEOASwapCalls({
    amountIn,
    amountOutMinimum,
    zeroForOne,
    poolKey,
    universalRouter,
    approvePermit2 = true,
}: {
    amountIn: bigint;
    amountOutMinimum: bigint;
    zeroForOne: boolean;
    poolKey: PoolKey;
    universalRouter: Address;
    approvePermit2?: boolean;
}): { to: Address; data: Hex; value: bigint }[] {
    const currencyIn = (zeroForOne ? poolKey.currency0 : poolKey.currency1) as Address;
    const currencyOut = (zeroForOne ? poolKey.currency1 : poolKey.currency0) as Address;

    /***** Permit2 Approve universalRouter *****/
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
        poolKey,
        currencyIn,
        currencyOut,
        amountIn,
        amountOutMinimum,
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
