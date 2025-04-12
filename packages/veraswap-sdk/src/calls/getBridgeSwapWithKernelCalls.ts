import { QueryClient } from "@tanstack/react-query";
import { Address, encodeFunctionData, Hex, zeroAddress, zeroHash } from "viem";
import { Config } from "wagmi";
import { LOCAL_KERNEL_CONTRACTS } from "../constants/kernel.js";
import { CallArgs, encodeCallArgsBatch } from "../smartaccount/ExecLib.js";
import { getSwapCalls, GetSwapCallsParams } from "../swap/getSwapCalls.js";
import { GetCallsReturnType } from "./getCalls.js";
import { GetTransferRemoteWithKernelCallsParams } from "./getTransferRemoteWithKernelCalls.js";
import { ERC7579ExecutorRouter } from "../artifacts/ERC7579ExecutorRouter.js";
import { ERC7579ExecutionMode, ERC7579RouterBaseMessage } from "../smartaccount/ERC7579ExecutorRouter.js";
import { PoolKey } from "@uniswap/v4-sdk";
import { TokenStandard } from "../types/Token.js";
import { Execute } from "../artifacts/Execute.js";
import { getExecMode } from "@zerodev/sdk";
import { CALL_TYPE, EXEC_TYPE } from "@zerodev/sdk/constants";
import { getOrbiterETHTransferTransaction } from "../orbiter/getOrbiterETHTransferTransaction.js";
import { getKernelFactoryCreateAccountCalls } from "./getKernelFactoryCreateAccountCalls.js";
import { getOwnableExecutorExecuteCalls, getOwnableExecutorExecuteData } from "./getOwnableExecutorExecuteCalls.js";
import { getTransferRemoteWithFunderCalls } from "./getTransferRemoteWithFunderCalls.js";
import invariant from "tiny-invariant";
import { LOCAL_HYPERLANE_CONTRACTS } from "../constants/hyperlane.js";
import { getOwnableExecutorAddOwnerCalls } from "./getOwnableExecutorAddOwnerCalls.js";
import { getExecutorRouterSetOwnersCalls } from "./getExecutorRouterSetOwnersCalls.js";
import { readContractQueryOptions } from "wagmi/query";

//TODO: Remove optional with hard-coded defaults
export interface GetBridgeSwapWithKernelCallsParams extends GetTransferRemoteWithKernelCallsParams {
    tokenStandard: TokenStandard;
    token: Address;
    destination: number;
    amount: bigint;
    hookMetadata?: Hex;
    hook?: Address;
    approveAmount?: bigint | "MAX_UINT_256";
    contractsRemote?: {
        execute: Address;
        ownableSignatureExecutor: Address;
        erc7579Router: Address;
    };
    createAccountRemote: {
        initData: Hex;
        salt: Hex;
        factoryAddress: Address;
    };
    erc7579RouterOwnersRemote?: { domain: number; router: Address; owner: Address; enabled: boolean }[];
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
        remoteSwapParams,
        tokenStandard,
        approveAmount,
        permit2,
    } = params;
    invariant(
        tokenStandard === "HypERC20" || tokenStandard === "HypERC20Collateral" || tokenStandard === "NativeToken",
        `Unsupported standard ${tokenStandard}, expected HypERC20, HypERC20Collateral or NativeToken`,
    );

    if (!params.contracts) {
        invariant(chainId === 900 || chainId === 901, "Chain ID must be 900 or 901 for default contracts");
    }
    if (!params.contractsRemote) {
        invariant(
            destination === 900 || destination === 901,
            "Destination Chain ID must be 900 or 901 for default remoteContracts",
        );
    }
    const contracts = params.contracts ?? {
        execute: LOCAL_KERNEL_CONTRACTS.execute,
        ownableSignatureExecutor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
        erc7579Router: LOCAL_HYPERLANE_CONTRACTS[chainId as 900 | 901].erc7579Router,
    };
    const contractsRemote = params.contractsRemote ?? {
        execute: LOCAL_KERNEL_CONTRACTS.execute,
        ownableSignatureExecutor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
        erc7579Router: LOCAL_HYPERLANE_CONTRACTS[destination as 900 | 901].erc7579Router,
    };

    // KERNEL ACCOUNT CREATE
    // Create account if needed
    const createAccountCalls = await getKernelFactoryCreateAccountCalls(queryClient, wagmiConfig, {
        chainId,
        account,
        ...params.createAccount,
    });
    const kernelAddress = createAccountCalls.kernelAddress;
    // Create account if needed on remote chain
    const createAccountRemoteCalls = await getKernelFactoryCreateAccountCalls(queryClient, wagmiConfig, {
        chainId: destination,
        account, //TODO: This will get overriden
        ...params.createAccountRemote,
    });
    const kernelAddressRemote = createAccountRemoteCalls.kernelAddress;

    // KERNEL ACCOUNT CONFIGURATION
    // Default to adding account & kernelAddress as owners
    const erc7579RouterOwners = params.erc7579RouterOwners ?? [
        {
            domain: destination,
            router: contractsRemote.erc7579Router,
            owner: account,
            enabled: true,
        },
        {
            domain: destination,
            router: contractsRemote.erc7579Router,
            owner: kernelAddressRemote,
            enabled: true,
        },
    ];
    const erc7579RouterOwnersRemote = params.erc7579RouterOwnersRemote ?? [
        {
            domain: chainId,
            router: contracts.erc7579Router,
            owner: account,
            enabled: true,
        },
        {
            domain: chainId,
            router: contracts.erc7579Router,
            owner: kernelAddress,
            enabled: true,
        },
    ];

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
    // Add ERC7579Router as owner of the kernelAddress calls
    const executorAddOwnerCallsRemotePromise = getOwnableExecutorAddOwnerCalls(queryClient, wagmiConfig, {
        chainId: destination,
        account: kernelAddressRemote,
        executor: contractsRemote.ownableSignatureExecutor,
        owner: contractsRemote.erc7579Router,
    });
    // Set owners on erc7579Router calls
    const erc7579RouterSetOwnerCallsRemotePromise = getExecutorRouterSetOwnersCalls(queryClient, wagmiConfig, {
        chainId: destination,
        account: kernelAddressRemote,
        router: contractsRemote.erc7579Router,
        owners: erc7579RouterOwnersRemote,
    });

    // BRIDGE CALLS
    let bridgeCalls: (CallArgs & { account: Address })[];
    if (tokenStandard === "NativeToken") {
        // Assume that if the token is native, we are using the Orbiter bridge
        const orbiterCall = getOrbiterETHTransferTransaction({
            recipient: kernelAddress,
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
            recipient: kernelAddressRemote,
            amount,
            hookMetadata,
            hook,
            approveAmount,
            permit2,
        });
        bridgeCalls = transferRemoteCalls.calls;
    }

    const swapParams: GetSwapCallsParams = {
        account: kernelAddressRemote,
        chainId: destination,
        approveExpiration: remoteSwapParams.approveExpiration ?? "MAX_UINT_48",
        ...remoteSwapParams,
    };

    const { calls: swapRemoteCalls } = await getSwapCalls(queryClient, wagmiConfig, swapParams);

    const [executorAddOwnerRemoteCalls, erc7579RouterSetOwnerRemoteCalls] = await Promise.all([
        executorAddOwnerCallsRemotePromise,
        erc7579RouterSetOwnerCallsRemotePromise,
    ]);
    const kernelRemoteCalls = [
        ...executorAddOwnerRemoteCalls.calls,
        ...erc7579RouterSetOwnerRemoteCalls.calls,
        ...swapRemoteCalls,
    ];

    // REMOTE ERC7579Router swap execution
    // ERC7579 Router execution data on remote account
    const isERC7579Owner = await queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, {
            chainId: destination,
            address: contractsRemote.erc7579Router,
            abi: ERC7579ExecutorRouter.abi,
            functionName: "owners",
            args: [kernelAddressRemote, chainId, contracts.erc7579Router, account],
        }),
    );
    // If remote erc7579Router is an owner & it accepts messages from origin erc7579Router, use it as the executor owner
    const remoteExecutorDirect = executorAddOwnerRemoteCalls.isOwner && isERC7579Owner;

    const remoteExecutorCallData = await getOwnableExecutorExecuteData(queryClient, wagmiConfig, {
        chainId: destination,
        account: contractsRemote.erc7579Router, // caller is erc7579Router
        calls: kernelRemoteCalls,
        executor: contractsRemote.ownableSignatureExecutor,
        owner: remoteExecutorDirect ? contractsRemote.erc7579Router : account,
        kernelAddress: kernelAddressRemote,
    });

    let executionMode: ERC7579ExecutionMode;
    if (remoteExecutorCallData.signature) {
        executionMode =
            remoteExecutorCallData.callType === CALL_TYPE.BATCH
                ? ERC7579ExecutionMode.BATCH_SIGNATURE
                : ERC7579ExecutionMode.SINGLE_SIGNATURE;
    } else {
        executionMode =
            remoteExecutorCallData.callType === CALL_TYPE.BATCH
                ? ERC7579ExecutionMode.BATCH
                : ERC7579ExecutionMode.SINGLE;
    }
    // ERC7579 Router message
    const messageParams: ERC7579RouterBaseMessage = {
        owner: account,
        account: remoteExecutorCallData.account,
        executionMode,
        initData: params.createAccountRemote.initData,
        initSalt: params.createAccountRemote.salt,
        callData: remoteExecutorCallData.callData,
        nonce: remoteExecutorCallData.nonce,
        validAfter: remoteExecutorCallData.validAfter,
        validUntil: remoteExecutorCallData.validUntil,
        signature: remoteExecutorCallData.signature,
    };

    const callRemoteData = encodeFunctionData({
        abi: ERC7579ExecutorRouter.abi,
        functionName: "callRemote",
        args: [
            destination,
            contractsRemote.erc7579Router,
            messageParams.account,
            messageParams.initData ?? "0x",
            messageParams.initSalt ?? zeroHash,
            messageParams.executionMode,
            messageParams.callData ?? "0x", //optional because of NOOP
            messageParams.nonce ?? 0n,
            messageParams.validAfter!, //should be defined
            messageParams.validUntil!, //should be defined
            messageParams.signature ?? "0x",
            "0x",
            zeroAddress,
        ],
    });

    // TODO: estimate remote expense
    const bridgePayment = 1000000000n;

    const callRemote = {
        account: kernelAddress,
        to: contracts.erc7579Router,
        data: callRemoteData,
        value: tokenStandard === "NativeToken" ? amount + bridgePayment : bridgePayment,
    };

    const [executorAddOwnerCalls, erc7579RouterSetOwnerCalls] = await Promise.all([
        executorAddOwnerCallsPromise,
        erc7579RouterSetOwnerCallsPromise,
    ]);
    const kernelCalls = [
        ...executorAddOwnerCalls.calls,
        ...erc7579RouterSetOwnerCalls.calls,
        ...bridgeCalls,
        callRemote,
    ];

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
