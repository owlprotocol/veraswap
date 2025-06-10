import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { getExecMode } from "@zerodev/sdk";
import { CALL_TYPE, EXEC_TYPE } from "@zerodev/sdk/constants";
import invariant from "tiny-invariant";
import { Address, encodeFunctionData, Hex } from "viem";

import { Execute } from "../artifacts/Execute.js";
import { StargateETHQuote } from "../query/stargateETHQuote.js";
import { StargateTokenQuote, StargateTokenSymbol } from "../query/stargateTokenQuote.js";
import { CallArgs, encodeCallArgsBatch } from "../smartaccount/ExecLib.js";
import { getStargateETHBridgeTransaction } from "../stargate/getStargateETHBridgeTransaction.js";

import { GetCallsParams, GetCallsReturnType } from "./getCalls.js";
import { getExecutorRouterSetOwnersCalls } from "./getExecutorRouterSetOwnersCalls.js";
import { getKernelFactoryCreateAccountCalls } from "./getKernelFactoryCreateAccountCalls.js";
import { getOwnableExecutorAddOwnerCalls } from "./getOwnableExecutorAddOwnerCalls.js";
import { getOwnableExecutorExecuteCalls } from "./getOwnableExecutorExecuteCalls.js";
import { getStargateBridgeWithFunderCalls } from "./getStargateBridgeWithFunderCalls.js";

export interface GetStargateBridgeWithKernelCallsParams extends GetCallsParams {
    token: Address;
    tokenSymbol?: StargateTokenSymbol;
    destination: number;
    recipient: Address;
    amount: bigint;
    approveAmount?: bigint | "MAX_UINT_256";
    permit2?: {
        approveAmount?: bigint | "MAX_UINT_160";
        minExpiration?: number;
        approveExpiration?: number | "MAX_UINT_48";
        sigDeadline?: bigint;
    };
    createAccount: {
        initData: Hex;
        salt: Hex;
        factoryAddress: Address;
    };
    contracts: {
        execute: Address;
        ownableSignatureExecutor: Address;
        erc7579Router: Address;
    };
    erc7579RouterOwners?: { domain: number; router: Address; owner: Address; enabled: boolean }[];
    stargateQuote: StargateETHQuote | StargateTokenQuote;
}

/**
 * Get call to fund & set approvals for Stargate bridge call
 * @param queryClient
 * @param wagmiConfig
 * @param params
 */
export async function getStargateBridgeWithKernelCalls(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetStargateBridgeWithKernelCallsParams,
): Promise<GetCallsReturnType> {
    const { contracts, chainId, account, token, destination, recipient, amount, stargateQuote } = params;

    if (!params.contracts) {
        invariant(chainId === 900 || chainId === 901, "Chain ID must be 900 or 901 for default contracts");
    }
    const erc7579RouterOwners = params.erc7579RouterOwners ?? [];

    // KERNEL ACCOUNT CONFIGURATION
    // Create account if needed
    const createAccountCalls = await getKernelFactoryCreateAccountCalls(queryClient, wagmiConfig, {
        chainId,
        account,
        ...params.createAccount,
    });
    const kernelAddress = createAccountCalls.kernelAddress;
    // Add ERC7579Router as owner of the kernelAddress calls
    const executorAddOwnerCallsPromise = getOwnableExecutorAddOwnerCalls(queryClient, wagmiConfig, {
        chainId,
        account: kernelAddress, // Kernel address
        executor: contracts.ownableSignatureExecutor,
        owner: contracts.erc7579Router,
    });
    // Set owners on erc7579Router calls
    const erc7579RouterSetOwnerCallsPromise = getExecutorRouterSetOwnersCalls(queryClient, wagmiConfig, {
        chainId,
        account: kernelAddress,
        router: contracts.erc7579Router,
        owners: erc7579RouterOwners,
    });

    // TODO: Fix for native
    let bridgeCalls: (CallArgs & { account: Address })[];
    if (stargateQuote.type === "ETH") {
        const stargateTx = getStargateETHBridgeTransaction({
            srcChain: chainId,
            dstChain: destination,
            receiver: recipient,
            stargateQuote,
        });
        bridgeCalls = [{ ...stargateTx, account: kernelAddress }];
    } else {
        if (!params.tokenSymbol) {
            throw new Error("tokenSymbol is required for token bridging");
        }

        const stargateBridgeCalls = await getStargateBridgeWithFunderCalls(queryClient, wagmiConfig, {
            chainId,
            token,
            tokenSymbol: params.tokenSymbol,
            account: kernelAddress,
            funder: account,
            destination,
            recipient,
            amount,
            stargateQuote,
            approveAmount: params.approveAmount,
            permit2: params.permit2,
        });
        bridgeCalls = stargateBridgeCalls.calls;
    }

    const [executorAddOwnerCalls, erc7579RouterSetOwnerCalls] = await Promise.all([
        executorAddOwnerCallsPromise,
        erc7579RouterSetOwnerCallsPromise,
    ]);
    const kernelCalls = [...executorAddOwnerCalls.calls, ...erc7579RouterSetOwnerCalls.calls, ...bridgeCalls];
    const kernelCallsValue = kernelCalls.reduce((acc, call) => acc + (call.value ?? 0n), 0n);

    if (createAccountCalls.exists) {
        // Account already exists, execute directly
        const executeOnOwnedAccount = await getOwnableExecutorExecuteCalls(queryClient, wagmiConfig, {
            chainId,
            account,
            calls: kernelCalls,
            executor: contracts.ownableSignatureExecutor,
            owner: account,
            kernelAddress,
            value: kernelCallsValue,
        });

        return { calls: executeOnOwnedAccount.calls };
    }

    // Deploy account, and execute via signature using the Execute contract
    const executeOnOwnedAccount = await getOwnableExecutorExecuteCalls(queryClient, wagmiConfig, {
        chainId,
        account: contracts.execute,
        calls: kernelCalls,
        executor: contracts.ownableSignatureExecutor,
        owner: account,
        kernelAddress,
        value: kernelCallsValue,
    });

    // Execute batched calls
    const executeCalls = [...createAccountCalls.calls, ...executeOnOwnedAccount.calls];
    const executeCallsBatched = encodeCallArgsBatch(executeCalls);
    const value = executeCalls.reduce((acc, call) => acc + (call.value ?? 0n), 0n);

    // Execute batch
    const executeCall = {
        account,
        to: contracts.execute,
        data: encodeFunctionData({
            abi: Execute.abi,
            functionName: "execute",
            args: [getExecMode({ callType: CALL_TYPE.BATCH, execType: EXEC_TYPE.DEFAULT }), executeCallsBatched],
        }),
        value,
    };
    return { calls: [executeCall] };
}
