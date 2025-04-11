import { QueryClient } from "@tanstack/react-query";
import { switchChain } from "@wagmi/core";
import { Address, encodeFunctionData, Hex, zeroAddress, zeroHash } from "viem";
import { Config } from "wagmi";
import { LOCAL_KERNEL_CONTRACTS } from "../constants/kernel.js";
import { CallArgs, encodeCallArgsBatch } from "../smartaccount/ExecLib.js";
import { getSwapCalls, GetSwapCallsParams } from "../swap/getSwapCalls.js";
import { GetCallsReturnType } from "./getCalls.js";
import { GetTransferRemoteWithKernelCallsParams } from "./getTransferRemoteWithKernelCalls.js";
import { ERC7579ExecutorRouter } from "../artifacts/ERC7579ExecutorRouter.js";
import { ERC7579RouterMessage, ERC7579ExecutionMode } from "../smartaccount/ERC7579ExecutorRouter.js";
import { PoolKey } from "@uniswap/v4-sdk";
import { TokenStandard } from "../types/Token.js";
import { Execute } from "../artifacts/Execute.js";
import { getExecMode } from "@zerodev/sdk";
import { CALL_TYPE, EXEC_TYPE } from "@zerodev/sdk/constants";
import { getOrbiterETHTransferTransaction } from "../orbiter/getOrbiterETHTransferTransaction.js";
import { getKernelFactoryCreateAccountCalls } from "./getKernelFactoryCreateAccountCalls.js";
import { getOwnableExecutorExecuteCalls } from "./getOwnableExecutorExecuteCalls.js";
import { getTransferRemoteWithFunderCalls } from "./getTransferRemoteWithFunderCalls.js";

export interface GetBridgeSwapWithKernelCallsParams extends GetTransferRemoteWithKernelCallsParams {
    tokenStandard: TokenStandard;
    token: Address;
    destination: number;
    amount: bigint;
    hookMetadata?: Hex;
    hook?: Address;
    approveAmount?: bigint | "MAX_UINT_256";
    remoteERC7579ExecutorRouter: Address;
    originERC7579ExecutorRouter: Address;
    contracts?: {
        execute: Address;
        ownableSignatureExecutor: Address;
        remoteExecute: Address;
        remoteOwnableSignatureExecutor: Address;
    };
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
export async function getBridgeSwapWithKernelCalls(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetBridgeSwapWithKernelCallsParams,
): Promise<GetCallsReturnType> {
    const {
        amount,
        destination,
        hook,
        hookMetadata,
        token,
        chainId,
        account,
        originERC7579ExecutorRouter,
        remoteERC7579ExecutorRouter,
        remoteSwapParams,
        tokenStandard,
        approveAmount,
        permit2,
    } = params;
    const { initData, salt } = params.createAccount;
    const contracts = params.contracts ?? {
        execute: LOCAL_KERNEL_CONTRACTS.execute,
        ownableSignatureExecutor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
        remoteExecute: LOCAL_KERNEL_CONTRACTS.execute,
        remoteOwnableSignatureExecutor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
    };

    if (!(tokenStandard === "HypERC20" || tokenStandard === "HypERC20Collateral" || tokenStandard === "NativeToken")) {
        throw new Error(`Unsupported standard for bridge and swap: ${tokenStandard}`);
    }

    // Create account if needed
    const createAccountCalls = await getKernelFactoryCreateAccountCalls(queryClient, wagmiConfig, {
        chainId,
        account,
        ...params.createAccount,
    });
    const kernelAddress = createAccountCalls.kernelAddress;

    let transferRemoteCalls: GetCallsReturnType;
    if (tokenStandard === "NativeToken") {
        // Assume that if the token is native, we are using the Orbiter bridge
        const orbiterCall = getOrbiterETHTransferTransaction({
            recipient: kernelAddress,
            amount,
            ...params.orbiterParams!,
        });

        transferRemoteCalls = { calls: [{ ...orbiterCall, account: kernelAddress }] };
    } else {
        // TODO: handle future case where we bridge USDC with orbiter

        // Encode transferRemote calls, pull funds from account if needed
        transferRemoteCalls = await getTransferRemoteWithFunderCalls(queryClient, wagmiConfig, {
            chainId,
            token,
            tokenStandard,
            account: kernelAddress,
            funder: account,
            destination,
            recipient: kernelAddress,
            amount,
            hookMetadata,
            hook,
            approveAmount,
            permit2,
        });
    }

    await switchChain(wagmiConfig, { chainId: destination });

    // Create remote account if needed
    const remoteCreateAccountCalls = await getKernelFactoryCreateAccountCalls(queryClient, wagmiConfig, {
        chainId: destination,
        account,
        ...params.createAccount,
    });
    const remoteKernelAddress = remoteCreateAccountCalls.kernelAddress;

    const swapParams: GetSwapCallsParams = {
        account: kernelAddress,
        chainId: destination,
        approveExpiration: remoteSwapParams.approveExpiration ?? "MAX_UINT_48",
        ...remoteSwapParams,
    };

    const { calls: swapRemoteCalls } = await getSwapCalls(queryClient, wagmiConfig, swapParams);

    let remoteExecuteOnOwnedAccountCalls: CallArgs[];
    if (remoteCreateAccountCalls.exists) {
        const remoteExecuteCalls = await getOwnableExecutorExecuteCalls(queryClient, wagmiConfig, {
            chainId: destination,
            account,
            calls: swapRemoteCalls,
            executor: contracts.ownableSignatureExecutor,
            owner: account,
            kernelAddress: remoteKernelAddress,
        });

        remoteExecuteOnOwnedAccountCalls = remoteExecuteCalls.calls;
    } else {
        // Deploy account, and execute via signature using the Execute contract
        const remoteExecuteOnOwnedAccount = await getOwnableExecutorExecuteCalls(queryClient, wagmiConfig, {
            chainId,
            account: contracts.remoteExecute,
            calls: swapRemoteCalls,
            executor: contracts.remoteOwnableSignatureExecutor,
            owner: account,
            kernelAddress,
        });

        // Execute batched calls
        const remoteExecuteCalls = [...remoteCreateAccountCalls.calls, ...remoteExecuteOnOwnedAccount.calls];

        const value = remoteExecuteCalls.reduce((acc, call) => acc + (call.value ?? 0n), 0n);
        const remoteExecuteCallsBatched = encodeCallArgsBatch(remoteExecuteCalls);

        // Execute batch
        const remoteExecuteCall = {
            account,
            to: contracts.execute,
            data: encodeFunctionData({
                abi: Execute.abi,
                functionName: "execute",
                args: [
                    getExecMode({ callType: CALL_TYPE.BATCH, execType: EXEC_TYPE.DEFAULT }),
                    remoteExecuteCallsBatched,
                ],
            }),
            value,
        };

        remoteExecuteOnOwnedAccountCalls = [remoteExecuteCall];
    }

    await switchChain(wagmiConfig, { chainId });

    const messageParams: ERC7579RouterMessage<ERC7579ExecutionMode.BATCH> = {
        owner: account,
        account: kernelAddress,
        executionMode: ERC7579ExecutionMode.BATCH,
        initData: initData,
        initSalt: salt,
        callData: encodeCallArgsBatch(remoteExecuteOnOwnedAccountCalls),
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
            0n,
            0,
            0,
            "0x",
            "0x",
            zeroAddress,
        ],
    });

    // TODO: estimate remote expense
    const bridgePayment = 1000000000n;

    const callRemote = {
        account: kernelAddress,
        to: originERC7579ExecutorRouter,
        data: callRemoteData,
        value: tokenStandard === "NativeToken" ? amount + bridgePayment : bridgePayment,
    };

    if (createAccountCalls.exists) {
        // Account already exists, execute directly
        const executeOnOwnedAccount = await getOwnableExecutorExecuteCalls(queryClient, wagmiConfig, {
            chainId,
            account,
            calls: [...transferRemoteCalls.calls, callRemote],
            executor: contracts.ownableSignatureExecutor,
            owner: account,
            kernelAddress,
        });

        return { calls: executeOnOwnedAccount.calls };
    }
    // Deploy account, and execute via signature using the Execute contract
    const executeOnOwnedAccount = await getOwnableExecutorExecuteCalls(queryClient, wagmiConfig, {
        chainId,
        account: contracts.execute,
        calls: [...transferRemoteCalls.calls, callRemote],
        executor: contracts.ownableSignatureExecutor,
        owner: account,
        kernelAddress,
    });

    // Execute batched calls
    const executeCalls = [...createAccountCalls.calls, ...executeOnOwnedAccount.calls];

    const value = executeCalls.reduce((acc, call) => acc + (call.value ?? 0n), 0n);
    const executeCallsBatched = encodeCallArgsBatch(executeCalls);

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
