import { QueryClient } from "@tanstack/react-query";
import { Config, signTypedData, switchChain } from "@wagmi/core";
import { readContractQueryOptions } from "@wagmi/core/query";
import { CALL_TYPE } from "@zerodev/sdk/constants";
import invariant from "tiny-invariant";
import { Address, encodeFunctionData, Hex } from "viem";

import { OwnableSignatureExecutor } from "../artifacts/OwnableSignatureExecutor.js";
import { CallArgs, encodeCallArgsBatch, encodeCallArgsSingle } from "../smartaccount/ExecLib.js";
import { getSignatureExecutionData, SignatureExecution } from "../smartaccount/OwnableExecutor.js";

import { GetCallsParams, GetCallsReturnType } from "./getCalls.js";

export interface GetOwnableExecutorExecuteCallsParams extends GetCallsParams {
    calls: CallArgs[];
    executor: Address;
    owner: Address;
    kernelAddress: Address;
    value: bigint;
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
    const { account, executor } = params;

    // Compute execution data depending on if `account` === `owner`
    const ownableExecutorCallData = await getOwnableExecutorExecuteData(queryClient, wagmiConfig, params);

    if (!("signature" in ownableExecutorCallData)) {
        // Executor function batch / single
        const functionName =
            ownableExecutorCallData.callType === CALL_TYPE.BATCH
                ? "executeBatchOnOwnedAccount"
                : "executeOnOwnedAccount";
        // Account is owner, execute directly
        const executeOnOwnedAccountCall = {
            account,
            to: executor,
            data: encodeFunctionData({
                abi: OwnableSignatureExecutor.abi,
                functionName,
                args: [ownableExecutorCallData.account, ownableExecutorCallData.callData],
            }),
            value: ownableExecutorCallData.value,
        };

        return { calls: [executeOnOwnedAccountCall] };
    } else {
        const functionName =
            ownableExecutorCallData.callType === CALL_TYPE.BATCH
                ? "executeBatchOnOwnedAccountWithSignature"
                : "executeOnOwnedAccountWithSignature";
        const signatureExecution = {
            account: ownableExecutorCallData.account,
            nonce: ownableExecutorCallData.nonce!,
            validAfter: ownableExecutorCallData.validAfter,
            validUntil: ownableExecutorCallData.validUntil,
            value: ownableExecutorCallData.value,
            callData: ownableExecutorCallData.callData,
        };

        const executeOnOwnedAccountCall = {
            account,
            to: executor,
            data: encodeFunctionData({
                abi: OwnableSignatureExecutor.abi,
                functionName,
                args: [signatureExecution, ownableExecutorCallData.signature!],
            }),
            value: signatureExecution.value,
        };

        return { calls: [executeOnOwnedAccountCall] };
    }
}

export type OwnableExecutorExecuteData =
    | {
          account: Address;
          nonce?: undefined;
          validAfter: number;
          validUntil: number;
          value: bigint;
          callData: Hex;
          callType: CALL_TYPE.BATCH | CALL_TYPE.SINGLE;
          signature?: undefined;
      }
    | (SignatureExecution & { callType: CALL_TYPE.BATCH | CALL_TYPE.SINGLE; signature: Hex });
/**
 * Call `OwnableExecutor`, exection data, use batch mode if `calls.length > 0`, use signature if `account != owner`
 * @param queryClient
 * @param wagmiConfig
 * @param params
 */
export async function getOwnableExecutorExecuteData(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetOwnableExecutorExecuteCallsParams,
): Promise<OwnableExecutorExecuteData> {
    const { chainId, calls, account, executor, owner, kernelAddress, value } = params;

    invariant(calls.length >= 1, "calls.length must be >= 1");
    //TODO: Add invariant check for calls (calls.account === kernelAddress)

    const smartAccountCallData = calls.length > 1 ? encodeCallArgsBatch(calls) : encodeCallArgsSingle(calls[0]);
    // Executor function batch / single
    const callType = calls.length > 1 ? CALL_TYPE.BATCH : CALL_TYPE.SINGLE;

    if (account === owner) {
        return {
            account: kernelAddress,
            //TODO: Parametrize these
            validAfter: 0,
            validUntil: 2 ** 48 - 1,
            value,
            callData: smartAccountCallData,
            callType,
        };
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
        const signatureExecution: SignatureExecution = {
            account: kernelAddress,
            nonce,
            //TODO: Parametrize these
            validAfter: 0,
            validUntil: 2 ** 48 - 1,
            value,
            callData: smartAccountCallData,
        };

        await switchChain(wagmiConfig, { chainId }); //signature request must be on same active chain
        const signature = await signTypedData(wagmiConfig, {
            account: owner,
            ...getSignatureExecutionData(signatureExecution, executor, chainId),
        });

        return { ...signatureExecution, signature, callType };
    }
}
