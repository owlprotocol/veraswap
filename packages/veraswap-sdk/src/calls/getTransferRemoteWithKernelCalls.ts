import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { getExecMode } from "@zerodev/sdk";
import { CALL_TYPE, EXEC_TYPE } from "@zerodev/sdk/constants";
import invariant from "tiny-invariant";
import { Address, encodeFunctionData, Hex } from "viem";

import { Execute } from "../artifacts/Execute.js";
import { OrbiterQuote } from "../query/orbiterQuote.js";
import { StargateETHQuote } from "../query/stargateETHQuote.js";
import { CallArgs, encodeCallArgsBatch } from "../smartaccount/ExecLib.js";
import { TokenStandard } from "../types/Token.js";

import { GetCallsParams, GetCallsReturnType } from "./getCalls.js";
import { getExecutorRouterSetOwnersCalls } from "./getExecutorRouterSetOwnersCalls.js";
import { getKernelFactoryCreateAccountCalls } from "./getKernelFactoryCreateAccountCalls.js";
import { getOwnableExecutorAddOwnerCalls } from "./getOwnableExecutorAddOwnerCalls.js";
import { getOwnableExecutorExecuteCalls } from "./getOwnableExecutorExecuteCalls.js";
import { getTransferRemoteWithFunderCalls } from "./getTransferRemoteWithFunderCalls.js";

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
    contracts: {
        execute: Address;
        ownableSignatureExecutor: Address;
        erc7579Router: Address;
    };
    erc7579RouterOwners?: { domain: number; router: Address; owner: Address; enabled: boolean }[];
    stargateQuote?: StargateETHQuote;
    orbiterQuote?: OrbiterQuote;
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
        contracts,
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
    invariant(
        tokenStandard === "HypERC20" ||
            tokenStandard === "HypERC20Collateral" ||
            tokenStandard === "HypSuperchainERC20Collateral" ||
            tokenStandard === "NativeToken",
        `Unsupported standard ${tokenStandard}, expected HypERC20, HypERC20Collateral, HypSuperchainERC20Collateral or NativeToken`,
    );

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

    // BRIDGE CALLS
    let bridgeCalls: (CallArgs & { account: Address })[];
    if (tokenStandard === "NativeToken") {
        // Assume that if the token is native, we are using the Orbiter bridge
        // TODO: if using USDC, find the step with bridge, since there could be an approve step
        const { to, value, data } = params.orbiterQuote!.steps[0].tx;
        const orbiterCall = { to, value: BigInt(value), data, account: kernelAddress };
        bridgeCalls = [orbiterCall];
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
            //TODO: Only send value if needed
            value: kernelCallsValue, //value needed to pay for Hyperlane Bridging
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
        //TODO: Only send value if needed
        value: kernelCallsValue, //value needed to pay for Hyperlane Bridging
    });

    //TODO: Additional util for Execute.sol contract
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
