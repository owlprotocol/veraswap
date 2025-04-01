import { Config } from "@wagmi/core";
import { QueryClient } from "@tanstack/react-query";

import { readContractQueryOptions } from "wagmi/query";
import { Address, encodeFunctionData } from "viem";
import invariant from "tiny-invariant";

import { IERC20 } from "../artifacts/IERC20.js";
import { IAllowanceTransfer } from "../artifacts/IAllowanceTransfer.js";
import { PERMIT2_ADDRESS } from "../constants/uniswap.js";
import { GetCallsParams, GetCallsReturnType } from "./getCalls.js";

export interface GetERC20TransferFromCallsParams extends GetCallsParams {
    token: Address;
    funder: Address;
    minAmount: bigint;
    targetAmount?: bigint;
}

export interface GetERC20TransferFromCallsReturnType extends GetCallsReturnType {
    balance: bigint;
}
/**
 * Get balance and return `IERC20.transferFrom` or `IAllowanceTransfer.transferFrom` call if below minAmount
 * @dev Make sure to check `funder` balance & allowance is sufficient beforehand (if needed)
 * @param queryClient
 * @param wagmiConfig
 * @param params
 */
export async function getERC20TransferFromCalls(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetERC20TransferFromCallsParams,
): Promise<GetERC20TransferFromCallsReturnType> {
    const { chainId, token, account, funder, minAmount } = params;
    // Amount to approve if current allowance < minAmount
    const targetAmount = params.targetAmount ?? minAmount;
    invariant(targetAmount >= minAmount, "targetAmount must be >= minAmount");

    const balance = await queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, {
            chainId,
            address: token,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [account],
        }),
    );

    if (balance >= minAmount) {
        return { balance, calls: [] };
    }
    // Transfer amount
    const amount = targetAmount - balance;

    // Queries
    const allowancePromise = queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, {
            chainId,
            address: token,
            abi: IERC20.abi,
            functionName: "allowance",
            args: [funder, account],
        }),
    );
    const permit2AllowancePromise = queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, {
            chainId,
            address: PERMIT2_ADDRESS,
            abi: IAllowanceTransfer.abi,
            functionName: "allowance",
            args: [funder, token, account],
        }),
    );

    // Regular ERC20 transferFrom
    const allowance = await allowancePromise;
    if (allowance >= amount) {
        const call = {
            to: token,
            data: encodeFunctionData({
                abi: IERC20.abi,
                functionName: "transferFrom",
                args: [funder, account, amount],
            }),
            value: 0n,
        };

        return { balance, calls: [call] };
    }

    // Permit2 transferFrom
    const permit2Allowance = await permit2AllowancePromise;
    if (permit2Allowance[0] >= amount && permit2Allowance[1] > Date.now()) {
        const call = {
            to: PERMIT2_ADDRESS as Address,
            data: encodeFunctionData({
                abi: IAllowanceTransfer.abi,
                functionName: "transferFrom",
                args: [funder, account, amount, token],
            }),
            value: 0n,
        };

        return { balance, calls: [call] };
    }

    throw new Error("Not enough allowance for transferFrom");
}
