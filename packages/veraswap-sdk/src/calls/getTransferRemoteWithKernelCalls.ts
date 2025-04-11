import { Config } from "@wagmi/core";
import { QueryClient } from "@tanstack/react-query";
import { Address, encodeFunctionData, Hex } from "viem";

import { CallArgs, encodeCallArgsBatch } from "../smartaccount/ExecLib.js";

import { GetCallsParams, GetCallsReturnType } from "./getCalls.js";
import { getKernelFactoryCreateAccountCalls } from "./getKernelFactoryCreateAccountCalls.js";
import { getTransferRemoteWithFunderCalls } from "./getTransferRemoteWithFunderCalls.js";
import { LOCAL_KERNEL_CONTRACTS } from "../constants/kernel.js";
import { Execute } from "../artifacts/Execute.js";
import { getExecMode } from "@zerodev/sdk";
import { CALL_TYPE, EXEC_TYPE } from "@zerodev/sdk/constants";
import { getOwnableExecutorExecuteCalls } from "./getOwnableExecutorExecuteCalls.js";
import { TokenStandard } from "../types/Token.js";
import { getOrbiterETHTransferTransaction } from "../orbiter/getOrbiterETHTransferTransaction.js";
import { OrbiterParams } from "../types/OrbiterParams.js";
import { LOCAL_HYPERLANE_CONTRACTS } from "../constants/hyperlane.js";
import invariant from "tiny-invariant";
import { getOwnableExecutorAddOwnerCalls } from "./getOwnableExecutorAddOwnerCalls.js";
import { getExecutorRouterSetOwnersCalls } from "./getExecutorRouterSetOwnersCalls.js";

export interface GetTransferRemoteWithKernelCallsParams extends GetCallsParams {
    tokenStandard: TokenStandard;
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
        erc7579Router: Address;
    };
    erc7579RouterOwners?: { domain: number; router: Address; owner: Address; enabled: boolean }[];
    orbiterParams?: OrbiterParams;
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
    if (!params.contracts) {
        invariant(chainId === 900 || chainId === 901, "Chain ID must be 900 or 901 for default contracts");
    }

    const contracts = params.contracts ?? {
        execute: LOCAL_KERNEL_CONTRACTS.execute,
        ownableSignatureExecutor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
        erc7579Router: LOCAL_HYPERLANE_CONTRACTS[chainId as 900 | 901].erc7579Router,
    };
    const erc7579RouterOwners = params.erc7579RouterOwners ?? [];

    if (!(tokenStandard === "HypERC20" || tokenStandard === "HypERC20Collateral" || tokenStandard === "NativeToken")) {
        throw new Error(`Unsupported standard for bridging: ${tokenStandard}`);
    }

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
    // Bridge calls
    let bridgeCalls: (CallArgs & { account: Address })[];
    if (tokenStandard === "NativeToken") {
        // Assume that if the token is native, we are using the Orbiter bridge
        const orbiterCall = getOrbiterETHTransferTransaction({
            recipient,
            amount,
            ...params.orbiterParams!,
        });
        bridgeCalls = [{ ...orbiterCall, account: kernelAddress }];
    } else {
        // TODO: handle future case where we bridge USDC with orbiter
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
        bridgeCalls = transferRemoteCalls.calls;
    }

    const [executorAddOwnerCalls, erc7579RouterSetOwnerCalls] = await Promise.all([
        executorAddOwnerCallsPromise,
        erc7579RouterSetOwnerCallsPromise,
    ]);
    const kernelCalls = [...executorAddOwnerCalls.calls, ...erc7579RouterSetOwnerCalls.calls, ...bridgeCalls];

    if (createAccountCalls.exists) {
        // Account already exists, execute directly
        const executeOnOwnedAccount = await getOwnableExecutorExecuteCalls(queryClient, wagmiConfig, {
            chainId,
            account,
            calls: kernelCalls,
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
        calls: kernelCalls,
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
