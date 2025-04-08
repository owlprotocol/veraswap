import { Config, signMessage } from "@wagmi/core";
import { QueryClient } from "@tanstack/react-query";

import { readContractQueryOptions } from "wagmi/query";
import { Address, encodeFunctionData } from "viem";

import { OwnableSignatureExecutor } from "../artifacts/OwnableSignatureExecutor.js";

import { GetCallsParams, GetCallsReturnType } from "./getCalls.js";
import { CallArgs, encodeCallArgsBatch, encodeCallArgsSingle } from "../smartaccount/ExecLib.js";
import invariant from "tiny-invariant";
import { encodeExecuteSignature } from "../smartaccount/OwnableExecutor.js";

export interface GetOwnableExecutorExecuteCallsParams extends GetCallsParams {
    calls: CallArgs[];
    executor: Address;
    owner: Address;
    kernelAddress: Address;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetOwnableExecutorExecuteCallsReturnType extends GetCallsReturnType {}

/**
 * Call `OwnableExecutor.execute`, use batch mode if `calls.length > 0`, use signature if `account != owner`
 * @param queryClient
 * @param wagmiConfig
 * @param params
 */
export async function getOwnableExecutorExecuteCalls(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetOwnableExecutorExecuteCallsParams,
): Promise<GetOwnableExecutorExecuteCallsReturnType> {
    const { chainId, calls, account, executor, owner, kernelAddress } = params;

    invariant(calls.length >= 1, "calls.length must be >= 1");
    //TODO: Add invariant check for calls (calls.account === kernelAddress)

    const smartAccountCallData = calls.length > 1 ? encodeCallArgsBatch(calls) : encodeCallArgsSingle(calls[0]);
    // Sum value of all calls
    const value = calls.reduce((acc, call) => acc + (call.value ?? 0n), 0n);
    // Executor function batch / single
    const functionName = calls.length > 1 ? "executeBatchOnOwnedAccount" : "executeOnOwnedAccount";

    if (account === owner) {
        // Account is owner, execute directly
        const executeOnOwnedAccountCall = {
            account,
            to: executor,
            data: encodeFunctionData({
                abi: OwnableSignatureExecutor.abi,
                functionName,
                args: [kernelAddress, smartAccountCallData],
            }),
            value,
        };

        return { calls: [executeOnOwnedAccountCall] };
    } else {
        // Account is not owner, execute via signature
        const nonce = await queryClient.fetchQuery(
            readContractQueryOptions(wagmiConfig, {
                chainId: chainId,
                address: executor,
                abi: OwnableSignatureExecutor.abi,
                functionName: "getNonce",
                //@ts-expect-error encoding error with bigint but that is the expected type (and not number)
                args: [kernelAddress, 0],
            }),
        );
        const signatureParams = {
            chainId: BigInt(chainId),
            ownedAccount: kernelAddress,
            nonce,
            //TODO: Parametrize these
            validAfter: 0,
            validUntil: 2 ** 48 - 1,
            msgValue: value,
            callData: smartAccountCallData,
        };
        const signatureData = encodeExecuteSignature(signatureParams);
        const signature = await signMessage(wagmiConfig, { account: owner, message: { raw: signatureData } });

        const executeOnOwnedAccountCall = {
            account,
            to: executor,
            data: encodeFunctionData({
                abi: OwnableSignatureExecutor.abi,
                functionName,
                args: [
                    signatureParams.ownedAccount,
                    signatureParams.nonce,
                    signatureParams.validAfter,
                    signatureParams.validUntil,
                    signatureParams.callData,
                    signature,
                ],
            }),
            value,
        };

        return { calls: [executeOnOwnedAccountCall] };
    }
}
