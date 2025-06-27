import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { readContractQueryOptions } from "@wagmi/core/query";
import { getExecMode } from "@zerodev/sdk";
import { CALL_TYPE, EXEC_TYPE } from "@zerodev/sdk/constants";
import invariant from "tiny-invariant";
import { Address, encodeFunctionData, encodePacked, Hex, numberToHex, zeroAddress, zeroHash } from "viem";

import { ERC7579ExecutorRouter } from "../artifacts/ERC7579ExecutorRouter.js";
import { Execute } from "../artifacts/Execute.js";
import { InterchainGasPaymaster } from "../artifacts/InterchainGasPaymaster.js";
import { SuperchainERC7579ExecutorRouter } from "../artifacts/SuperchainERC7579ExecutorRouter.js";
import { STARGATE_TOKEN_POOLS } from "../constants/stargate.js";
import { SUPERCHAIN_ERC7579_ROUTER } from "../constants/superchain.js";
import { ERC7579ExecutionMode, ERC7579RouterBaseMessage } from "../smartaccount/ERC7579ExecutorRouter.js";
import { CallArgs, encodeCallArgsBatch } from "../smartaccount/ExecLib.js";
import { getStargateETHBridgeTransaction } from "../stargate/getStargateETHBridgeTransaction.js";
import { getSwapCalls, GetSwapCallsParams } from "../swap/getSwapCalls.js";
import { TokenStandard } from "../types/Token.js";
import { MetaQuoteBest } from "../uniswap/quote/MetaQuoter.js";

import { GetCallsReturnType } from "./getCalls.js";
import { getExecutorRouterSetOwnersCalls } from "./getExecutorRouterSetOwnersCalls.js";
import { getKernelFactoryCreateAccountCalls } from "./getKernelFactoryCreateAccountCalls.js";
import { getOwnableExecutorAddOwnerCalls } from "./getOwnableExecutorAddOwnerCalls.js";
import { getOwnableExecutorExecuteCalls, getOwnableExecutorExecuteData } from "./getOwnableExecutorExecuteCalls.js";
import { getStargateBridgeWithFunderCalls } from "./getStargateBridgeWithFunderCalls.js";
import { getSuperchainBridgeWithFunderCalls } from "./getSuperchainBridgeWithFunderCalls.js";
import { getTransferRemoteWithFunderCalls } from "./getTransferRemoteWithFunderCalls.js";
import { GetTransferRemoteWithKernelCallsParams } from "./getTransferRemoteWithKernelCalls.js";

//TODO: Remove optional with hard-coded defaults
export interface GetBridgeSwapWithKernelCallsParams extends GetTransferRemoteWithKernelCallsParams {
    tokenStandard: TokenStandard;
    token: Address;
    tokenSymbol?: string;
    destination: number;
    amount: bigint;
    hookMetadata?: Hex;
    hook?: Address;
    approveAmount?: bigint | "MAX_UINT_256";
    contracts: {
        execute: Address;
        ownableSignatureExecutor: Address;
        erc7579Router: Address;
        interchainGasPaymaster: Address;
    };
    contractsRemote: {
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
        quote: MetaQuoteBest;
        currencyIn: Address;
        currencyOut: Address;
        universalRouter: Address;
        receiver: Address;
        callTargetAfter?: [Address, bigint, Hex];
        routerPayment?: bigint;
        approveExpiration?: number | "MAX_UINT_48";
        contracts: {
            weth9: Address;
        };
    };
    withSuperchain?: boolean;
}

/**
 * Get callRemote data for ERC7579ExecutorRouter
 */
async function getERC7579ExecutorRouterCallRemote(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: {
        chainId: number;
        destination: number;
        messageParams: ERC7579RouterBaseMessage;
        contracts: {
            erc7579Router: Address;
            interchainGasPaymaster: Address;
        };
        contractsRemote: {
            erc7579Router: Address;
        };
        kernelAddress: Address;
    },
): Promise<CallArgs & { account: Address }> {
    const { chainId, destination, messageParams, contracts, contractsRemote, kernelAddress } = params;
    // Estimated using test in getBridgeSwapWithKernelCalls.test.ts
    const callRemoteGas = 1_000_000n;

    //Note: Hyperlane docs do not mention the fact that we must account for this
    // Compute gas + overhead
    const callRemoteGasWithOverhead = await queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, {
            chainId,
            address: contracts.interchainGasPaymaster,
            abi: InterchainGasPaymaster.abi,
            functionName: "destinationGasLimit",
            args: [destination, numberToHex(callRemoteGas) as unknown as bigint], //wagmi/core has issues with bigint encoding for query key
        }),
    );

    const callRemotePayment = await queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, {
            chainId,
            address: contracts.interchainGasPaymaster,
            abi: InterchainGasPaymaster.abi,
            functionName: "quoteGasPayment",
            args: [destination, numberToHex(callRemoteGasWithOverhead) as unknown as bigint], //wagmi/core has issues with bigint encoding for query key
        }),
    );

    // Format hook metadata according to Hyperlane's StandardHookMetadata format
    // See: https://docs.hyperlane.xyz/docs/reference/hooks/interchain-gas#determine-and-override-the-gas-limit
    const hookData = encodePacked(
        ["uint16", "uint256", "uint256", "address", "bytes"],
        [1, 0n, callRemoteGas, messageParams.account, "0x"],
    );

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
            hookData,
            zeroAddress,
        ],
    });

    return {
        account: kernelAddress,
        to: contracts.erc7579Router,
        data: callRemoteData,
        value: callRemotePayment,
    };
}

function getSuperchainERC7579RouterCallRemote({
    destination,
    messageParams,
    kernelAddress,
}: {
    destination: number;
    messageParams: ERC7579RouterBaseMessage;
    kernelAddress: Address;
}): CallArgs & { account: Address } {
    const callRemoteData = encodeFunctionData({
        abi: SuperchainERC7579ExecutorRouter.abi,
        functionName: "callRemote",
        args: [
            BigInt(destination),
            messageParams.account,
            messageParams.initData ?? "0x",
            messageParams.initSalt ?? zeroHash,
            messageParams.executionMode,
            messageParams.callData ?? "0x", //optional because of NOOP
            messageParams.nonce ?? 0n,
            messageParams.validAfter!, //should be defined
            messageParams.validUntil!, //should be defined
            messageParams.signature ?? "0x",
        ],
    });

    return {
        account: kernelAddress,
        to: SUPERCHAIN_ERC7579_ROUTER,
        data: callRemoteData,
        value: 0n,
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
        contracts,
        contractsRemote,
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
        withSuperchain,
    } = params;
    invariant(
        tokenStandard === "HypERC20" ||
            tokenStandard === "HypERC20Collateral" ||
            tokenStandard === "HypSuperchainERC20Collateral" ||
            tokenStandard === "SuperchainERC20" ||
            tokenStandard === "NativeToken" ||
            tokenStandard === "ERC20",

        `Unsupported standard ${tokenStandard}, expected HypERC20, HypERC20Collateral, HypSuperchainERC20Collateral, SuperchainERC20, NativeToken or ERC20`,
    );

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
        withSuperchain,
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
        withSuperchain,
    });

    // BRIDGE CALLS
    let bridgeCalls: (CallArgs & { account: Address })[];
    if (tokenStandard === "NativeToken") {
        const { stargateQuote, orbiterQuote } = params;
        if (stargateQuote) {
            if (stargateQuote.type !== "ETH") {
                throw new Error("Stargate ETH quote is required for native token bridging");
            }
            const stargateTx = getStargateETHBridgeTransaction({
                dstChain: destination,
                srcChain: chainId,
                receiver: kernelAddress,
                stargateQuote,
            });
            bridgeCalls = [{ ...stargateTx, account: kernelAddress }];
        } else if (orbiterQuote) {
            // Assume that if the token is native, we are using the Orbiter bridge
            // TODO: if using USDC, find the step with bridge, since there could be an approve step
            const { to, value, data } = params.orbiterQuote!.steps[0].tx;
            const orbiterCall = { to, value: BigInt(value), data, account: kernelAddress };
            bridgeCalls = [orbiterCall];
        } else {
            invariant(false, "NativeToken bridging requires either Stargate or Orbiter quotes to be provided");
        }
    } else if (withSuperchain) {
        invariant(
            tokenStandard === "SuperchainERC20" || tokenStandard === "HypSuperchainERC20Collateral",
            "withSuperchain is true, but tokenStandard is not SuperchainERC20 or HypSuperchainERC20Collateral",
        );

        const superchainBridgeCalls = await getSuperchainBridgeWithFunderCalls(queryClient, wagmiConfig, {
            chainId,
            // Only possibilities
            tokenStandard: tokenStandard,
            account: kernelAddress,
            funder: account,
            token,
            destination,
            recipient: kernelAddressRemote,
            amount,
            approveAmount,
            permit2,
        });
        bridgeCalls = superchainBridgeCalls.calls;
    } else if (params.stargateQuote?.type === "TOKEN") {
        const { stargateQuote, tokenSymbol } = params;

        invariant(
            !!tokenSymbol && tokenSymbol in STARGATE_TOKEN_POOLS,
            `Token ${tokenSymbol} is not supported by Stargate`,
        );

        const stargateBridgeCalls = await getStargateBridgeWithFunderCalls(queryClient, wagmiConfig, {
            chainId,
            account: kernelAddress,
            funder: account,
            token,
            tokenSymbol: tokenSymbol as keyof typeof STARGATE_TOKEN_POOLS,
            destination,
            recipient: kernelAddressRemote,
            amount,
            stargateQuote,
        });

        bridgeCalls = stargateBridgeCalls.calls;
    } else {
        invariant(
            tokenStandard !== "SuperchainERC20" && tokenStandard !== "ERC20",
            "SuperchainERC20 and ERC20 are not supported in this function",
        );
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
    type ReadContractQueryOptionsParams = Parameters<typeof readContractQueryOptions>[1];
    const isERC7579OwnerQueryOptions: ReadContractQueryOptionsParams = !withSuperchain
        ? {
              chainId: destination,
              address: contractsRemote.erc7579Router,
              abi: ERC7579ExecutorRouter.abi,
              functionName: "owners",
              args: [kernelAddressRemote, chainId, contracts.erc7579Router, account],
          }
        : {
              chainId: destination,
              address: SUPERCHAIN_ERC7579_ROUTER,
              abi: SuperchainERC7579ExecutorRouter.abi,
              functionName: "owners",
              args: [kernelAddressRemote, chainId, account],
          };
    const isERC7579Owner = await queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, isERC7579OwnerQueryOptions),
    );

    /* If remote erc7579Router is an owner & it accepts messages from origin erc7579Router, use it
     * as the executor owner */
    const remoteExecutorDirect = executorAddOwnerRemoteCalls.isOwner && isERC7579Owner;

    /*  No value can be passed by Hyperlane, if ETH is needed on the smart account, it must be
     *  received by some other mechanism (eg. Orbiter, Across) */
    const remoteExecutorValue = 0n;

    const remoteExecutorCallData = await getOwnableExecutorExecuteData(queryClient, wagmiConfig, {
        chainId: destination,
        account: contractsRemote.erc7579Router, // caller is erc7579Router
        calls: kernelRemoteCalls,
        executor: contractsRemote.ownableSignatureExecutor,
        owner: remoteExecutorDirect ? contractsRemote.erc7579Router : account,
        kernelAddress: kernelAddressRemote,
        value: remoteExecutorValue,
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

    let callRemote: CallArgs & { account: Address };
    if (!withSuperchain) {
        callRemote = await getERC7579ExecutorRouterCallRemote(queryClient, wagmiConfig, {
            chainId,
            destination,
            messageParams,
            contracts,
            contractsRemote,
            kernelAddress,
        });
    } else {
        callRemote = getSuperchainERC7579RouterCallRemote({ destination, messageParams, kernelAddress });
    }

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
