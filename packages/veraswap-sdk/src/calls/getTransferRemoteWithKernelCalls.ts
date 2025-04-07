import { Config, signMessage } from "@wagmi/core";
import { QueryClient } from "@tanstack/react-query";
import { Address, encodeFunctionData, Hex } from "viem";

import { encodeCallArgsBatch } from "../smartaccount/ExecLib.js";

import { GetCallsParams, GetCallsReturnType } from "./getCalls.js";
import { getKernelFactoryCreateAccountCalls } from "./getKernelFactoryCreateAccountCalls.js";
import { getTransferRemoteWithFunderCalls } from "./getTransferRemoteWithFunderCalls.js";
import { OwnableSignatureExecutor } from "../artifacts/OwnableSignatureExecutor.js";
import { encodeExecuteSignature } from "../smartaccount/OwnableExecutor.js";
import { LOCAL_KERNEL_CONTRACTS } from "../constants/kernel.js";
import { Execute } from "../artifacts/Execute.js";
import { getExecMode } from "@zerodev/sdk";
import { CALL_TYPE, EXEC_TYPE } from "@zerodev/sdk/constants";
import { readContractQueryOptions } from "wagmi/query";
import { getOwnableExecutorExecuteCalls } from "./getOwnableExecutorExecuteCalls.js";

export interface GetTransferRemoteWithKernelCallsParams extends GetCallsParams {
    tokenStandard: "HypERC20" | "HypERC20Collateral";
    token: Address;
    destination: number;
    recipient: Address;
    amount: bigint;
    hookMetadata?: Hex;
    hook?: Address;
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
    contracts?: {
        execute: Address;
        ownableSignatureExecutor: Address;
    };
}

/**
 * Get call to fund & set appprovals for `TokenRouter.transferRemote` call
 * @dev Assumes `token.balanceOf(account) > amount`
 * @param queryClient
 * @param wagmiConfig
 * @param params
 */
export async function getTransferRemoteWithKernelCalls(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetTransferRemoteWithKernelCallsParams,
): Promise<GetCallsReturnType> {
    const {
        chainId,
        account,
        tokenStandard,
        token,
        destination,
        recipient,
        amount,
        hookMetadata,
        hook,
        approveAmount,
        permit2,
    } = params;
    const contracts = params.contracts ?? {
        execute: LOCAL_KERNEL_CONTRACTS.execute,
        ownableSignatureExecutor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
    };

    // Create account if needed
    const createAccountCalls = await getKernelFactoryCreateAccountCalls(queryClient, wagmiConfig, {
        chainId,
        account,
        ...params.createAccount,
    });
    const kernelAddress = createAccountCalls.kernelAddress;

    // Encode transferRemote calls, pull funds from account if needed
    const transferRemoteCalls = await getTransferRemoteWithFunderCalls(queryClient, wagmiConfig, {
        chainId,
        token,
        tokenStandard,
        account: kernelAddress,
        funder: account,
        destination,
        recipient,
        amount,
        hookMetadata,
        hook,
        approveAmount,
        permit2,
    });

    if (createAccountCalls.exists) {
        // Account already exists, execute directly
        const executeOnOwnedAccount = await getOwnableExecutorExecuteCalls(queryClient, wagmiConfig, {
            chainId,
            account,
            calls: transferRemoteCalls.calls,
            executor: contracts.ownableSignatureExecutor,
            owner: account,
            kernelAddress,
        });

        return { calls: executeOnOwnedAccount.calls };
    } else {
        // Deploy account, and execute via signature using the Execute contract
        const executeOnOwnedAccount = await getOwnableExecutorExecuteCalls(queryClient, wagmiConfig, {
            chainId,
            account: contracts.execute,
            calls: transferRemoteCalls.calls,
            executor: contracts.ownableSignatureExecutor,
            owner: account,
            kernelAddress,
        });

        //TODO: Additional util for Execute.sol contract
        // Execute batched calls
        const executeCalls = [...createAccountCalls.calls, ...executeOnOwnedAccount.calls];
        const deployAndExecuteCalls = encodeCallArgsBatch(executeCalls);
        // Sum value of all calls
        const value = executeCalls.reduce((acc, call) => acc + (call.value ?? 0n), 0n);

        // Execute batch
        const executeCall = {
            account,
            to: contracts.execute,
            data: encodeFunctionData({
                abi: Execute.abi,
                functionName: "execute",
                args: [getExecMode({ callType: CALL_TYPE.BATCH, execType: EXEC_TYPE.DEFAULT }), deployAndExecuteCalls],
            }),
            value,
        };
        return { calls: [executeCall] };
    }
}
