import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { readContractQueryOptions } from "@wagmi/core/query";
import invariant from "tiny-invariant";
import { Address, encodeFunctionData, Hex } from "viem";

import { IERC20 } from "../../artifacts/IERC20.js";
import { STARGATE_TOKEN_POOLS } from "../../constants/stargate.js";
import { MAX_UINT_256 } from "../../constants/uint256.js";

export interface GetPoolApprovalParamsParams {
    chainId: number;
    token: Address;
    account: Address;
    tokenSymbol: keyof typeof STARGATE_TOKEN_POOLS;
    minAmount: bigint;
    approveAmount?: bigint | "MAX_UINT_256";
}

export interface GetPoolApprovalParamsReturnType {
    poolApprovalCall?: [Address, bigint, Hex];
    allowance: bigint;
}

export async function getPoolApprovalParams(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetPoolApprovalParamsParams,
): Promise<GetPoolApprovalParamsReturnType> {
    const { chainId, token, account, tokenSymbol, minAmount } = params;

    invariant(minAmount <= MAX_UINT_256, "minAmount must be <= MAX_UINT_256");
    invariant(
        params.approveAmount === undefined ||
            params.approveAmount === "MAX_UINT_256" ||
            (minAmount <= params.approveAmount && params.approveAmount <= MAX_UINT_256),
        "approveAmount must be minAmount <= approveAmount <= MAX_UINT_256",
    );
    const approveAmount = params.approveAmount === "MAX_UINT_256" ? MAX_UINT_256 : (params.approveAmount ?? minAmount);

    const pools = STARGATE_TOKEN_POOLS[tokenSymbol];
    invariant(pools, `Stargate pool for ${tokenSymbol} not found`);

    const poolAddress = pools[chainId as keyof typeof pools];
    invariant(!!poolAddress, `Stargate pool for ${tokenSymbol} not found for chain ${chainId}`);

    const allowance = await queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, {
            chainId,
            address: token,
            abi: IERC20.abi,
            functionName: "allowance",
            args: [account, poolAddress],
        }),
    );

    if (allowance >= minAmount) {
        return { allowance };
    }

    const poolApprovalCall: [Address, bigint, Hex] = [
        token,
        0n,
        encodeFunctionData({
            abi: IERC20.abi,
            functionName: "approve",
            args: [poolAddress, approveAmount],
        }),
    ];

    return { allowance, poolApprovalCall };
}
