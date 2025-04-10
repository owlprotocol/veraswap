import { QueryClient } from "@tanstack/react-query";
import { signTypedData, switchChain } from "@wagmi/core";
import { hashFn } from "@wagmi/core/query";
import { Address, encodeFunctionData, Hex, zeroAddress, zeroHash } from "viem";
import { Config } from "wagmi";
import { readContractQueryOptions } from "wagmi/query";
import { KernelFactory } from "../artifacts/KernelFactory.js";
import { OwnableSignatureExecutor } from "../artifacts/OwnableSignatureExecutor.js";
import { LOCAL_KERNEL_CONTRACTS } from "../constants/kernel.js";
import { CallArgs, encodeCallArgsBatch } from "../smartaccount/ExecLib.js";
import { getSignatureExecutionData } from "../smartaccount/OwnableExecutor.js";
import { getSwapCalls, GetSwapCallsParams } from "../swap/getSwapCalls.js";
import { GetCallsReturnType } from "./getCalls.js";
import {
    getTransferRemoteWithKernelCalls,
    GetTransferRemoteWithKernelCallsParams,
} from "./getTransferRemoteWithKernelCalls.js";
import { ERC7579ExecutorRouter } from "../artifacts/ERC7579ExecutorRouter.js";
import { ERC7579RouterMessage, ERC7579ExecutionMode } from "../smartaccount/ERC7579ExecutorRouter.js";
import { PoolKey } from "@uniswap/v4-sdk";
import { TokenStandard } from "../types/Token.js";

export interface GetBridgeSwapCallsParams extends GetTransferRemoteWithKernelCallsParams {
    tokenStandard: TokenStandard;
    token: Address;
    destination: number;
    recipient: Address;
    amount: bigint;
    hookMetadata?: Hex;
    hook?: Address;
    approveAmount?: bigint | "MAX_UINT_256";
    remoteERC7579ExecutorRouter: Address;
    remoteSwapParams: {
        amountIn: bigint;
        amountOutMinimum: bigint;
        zeroForOne: boolean;
        poolKey: PoolKey;
        universalRouter: Address;
        receiver: Address;
        callTargetAfter?: [Address, bigint, Hex];
        routerPayment?: bigint;
        hookData?: Hex;
        approveExpiration?: number | "MAX_UINT_48";
    };
}

/**
 * Get bridge swap calls
 * @param _queryClient
 * @param _wagmiConfig
 */
export async function getBridgeSwapCalls(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetBridgeSwapCallsParams,
): Promise<GetCallsReturnType> {
    const {
        amount,
        destination,
        createAccount,
        chainId,
        account,
        remoteERC7579ExecutorRouter,
        remoteSwapParams,
        tokenStandard,
    } = params;
    //TODO: Add swap calls
    const calls = [] as (CallArgs & { account: Address })[];
    const transferRemoteCalls = await getTransferRemoteWithKernelCalls(queryClient, wagmiConfig, params);
    calls.push(...transferRemoteCalls.calls);

    const { initData, salt, factoryAddress } = createAccount;
    const kernelAddress = await queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, {
            chainId,
            address: factoryAddress,
            abi: KernelFactory.abi,
            functionName: "getAddress",
            args: [initData, salt],
        }),
    );

    const swapParams: GetSwapCallsParams = {
        account: kernelAddress,
        chainId: destination,
        approveExpiration: remoteSwapParams.approveExpiration ?? "MAX_UINT_48",
        ...remoteSwapParams,
    };

    const { calls: swapRemoteCalls } = await getSwapCalls(queryClient, wagmiConfig, swapParams);

    const remoteCallData = encodeCallArgsBatch(swapRemoteCalls);

    await switchChain(wagmiConfig, { chainId: destination });

    // @ts-expect-error  queryKeyHashFn should exist and is needed to serialize a bigint
    const nonce = await queryClient.fetchQuery({
        ...readContractQueryOptions(wagmiConfig, {
            chainId: destination,
            address: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            abi: OwnableSignatureExecutor.abi,
            functionName: "getNonce",
            args: [kernelAddress, 0n],
        }),
        queryKeyHashFn: hashFn,
    });

    // Sign execution data
    const signatureExecution = {
        account: kernelAddress,
        nonce,
        validAfter: 0,
        validUntil: 2 ** 48 - 1,
        value: 0n,
        callData: remoteCallData,
    };

    const signature = await signTypedData(wagmiConfig, {
        account,
        ...getSignatureExecutionData(signatureExecution, LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor, destination),
    });

    await switchChain(wagmiConfig, { chainId });

    const messageParams: ERC7579RouterMessage<ERC7579ExecutionMode.BATCH_SIGNATURE> = {
        owner: account,
        account: kernelAddress,
        executionMode: ERC7579ExecutionMode.BATCH_SIGNATURE,
        initData: initData,
        initSalt: salt,
        callData: signatureExecution.callData,
        nonce: signatureExecution.nonce,
        validAfter: signatureExecution.validAfter,
        validUntil: signatureExecution.validUntil,
        signature,
    };

    const callRemoteData = encodeFunctionData({
        abi: ERC7579ExecutorRouter.abi,
        functionName: "callRemote",
        args: [
            destination,
            remoteERC7579ExecutorRouter,
            messageParams.account,
            messageParams.initData ?? "0x",
            messageParams.initSalt ?? zeroHash,
            messageParams.executionMode,
            messageParams.callData,
            messageParams.nonce,
            messageParams.validAfter,
            messageParams.validUntil,
            messageParams.signature,
            "0x",
            zeroAddress,
        ],
    });

    // TODO: estimate remote expense
    const bridgePayment = 1000000000n;

    const callRemote = {
        account: kernelAddress,
        to: remoteERC7579ExecutorRouter,
        data: callRemoteData,
        value: tokenStandard === "NativeToken" ? amount + bridgePayment : bridgePayment,
    };

    calls.push(callRemote);

    return { calls };
}
