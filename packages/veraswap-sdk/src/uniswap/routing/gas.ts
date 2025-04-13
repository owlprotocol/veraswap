import { Currency } from "@uniswap/sdk-core";
import { Address, createPublicClient, encodeFunctionData, http } from "viem";
import { arbitrum } from "viem/chains";

import { IERC20 } from "../../artifacts/IERC20.js";
import { MAX_UINT_256, PERMIT2_ADDRESS } from "../../constants/index.js";
import { getChainById } from "../../query/tokenData.js";
import { ApproveInfo } from "../../types/uniswapRouting.js";

const APPROVE_FALLBACK_GAS_LIMIT_IN_GWEI = 65_000;

export async function getApproveInfo(
    account: string | undefined,
    currency: Currency,
    amount: string,
    usdCostPerGas?: number,
): Promise<ApproveInfo> {
    // native currencies do not need token approvals
    if (currency.isNative) {
        return { needsApprove: false };
    }

    // If any of these arguments aren't provided, then we cannot generate approval cost info
    if (!account || !usdCostPerGas) {
        return { needsApprove: false };
    }

    // routing-api under estimates gas for Arbitrum swaps so it inflates cost per gas by a lot
    // so disable showing approves for Arbitrum until routing-api gives more accurate gas estimates
    if (currency.chainId === arbitrum.id) {
        return { needsApprove: false };
    }

    const chain = getChainById(currency.chainId);

    if (!chain) throw new Error(`Chain with id ${currency.chainId} not supported`);

    const publiClient = createPublicClient({ chain, transport: http() });

    let approveGasUseEstimate;
    try {
        const allowance = await publiClient.readContract({
            abi: IERC20.abi,
            functionName: "allowance",
            address: currency.address as Address,
            args: [account as Address, PERMIT2_ADDRESS],
        });
        if (allowance >= BigInt(amount)) {
            return { needsApprove: false };
        }
    } catch {
        // If contract lookup fails (eg if Infura goes down), then don't show gas info for approving the token
        return { needsApprove: false };
    }

    try {
        const approveCall = encodeFunctionData({
            abi: IERC20.abi,
            functionName: "approve",
            args: [PERMIT2_ADDRESS, MAX_UINT_256],
        });
        const gasEstimate = publiClient.estimateGas({
            account: account as Address,
            to: currency.address as Address,
            data: approveCall,
        });

        approveGasUseEstimate = Number(gasEstimate);
    } catch {
        // estimateGas will error if the account doesn't have sufficient token balance, but we should show an estimated cost anyway
        approveGasUseEstimate = APPROVE_FALLBACK_GAS_LIMIT_IN_GWEI;
    }

    return { needsApprove: true, approveGasEstimateUSD: approveGasUseEstimate * usdCostPerGas };
}
