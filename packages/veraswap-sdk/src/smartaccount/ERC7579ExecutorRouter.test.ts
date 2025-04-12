import { beforeAll, describe, expect, test } from "vitest";
import { Account, Address, createWalletClient, encodeFunctionData, http, padHex, zeroAddress, zeroHash } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";

import { getAnvilAccount } from "@veraswap/anvil-account";

import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { toKernelPluginManager } from "@zerodev/sdk/accounts";

import { LOCAL_KERNEL_CONTRACTS } from "../constants/kernel.js";
import { opChainL1Client } from "../chains/index.js";
import { getKernelInitData } from "./getKernelInitData.js";
import { getSignatureExecutionData, installOwnableExecutor } from "./OwnableExecutor.js";
import { getKernelAddress } from "./getKernelAddress.js";
import { Kernel } from "../artifacts/Kernel.js";
import { OwnableSignatureExecutor } from "../artifacts/OwnableSignatureExecutor.js";
import { CallArgs, encodeCallArgsBatch } from "./ExecLib.js";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { ERC7579_MODULE_TYPE } from "./ERC7579Module.js";
import { ERC7579ExecutorRouter } from "../artifacts/ERC7579ExecutorRouter.js";
import { ERC7579ExecutionMode, ERC7579RouterMessage } from "./ERC7579ExecutorRouter.js";
import { MockMailbox } from "../artifacts/MockMailbox.js";
import { MOCK_MAILBOX_CONTRACTS } from "../test/constants.js";
/**
 * TODO: ERC7579 Router Tests
 * - Deploy Router with Mailbox set as the walletClient (fake Mailbox)
 * - Init Smart Account from Router
 * - Execute from Router via Signature
 * - Set Router as owner
 */
describe("smartaccount/ERC7579ExecutorRouter.test.ts", function () {
    // Test ZeroDev SDK & Custom SDK Tooling
    const entryPoint = { address: entryPoint07Address, version: "0.7" } as const;
    const kernelVersion = KERNEL_V3_1;

    const account: Account = getAnvilAccount(1);
    const walletClient = createWalletClient({ account, chain: opChainL1Client.chain, transport: http() });

    let mockMailbox: Address;
    let routerAddress: Address;

    beforeAll(async () => {
        mockMailbox = MOCK_MAILBOX_CONTRACTS[opChainL1Client.chain.id].mailbox;
        // Add self as remote mailbox for domain
        const addRemoteMailboxHash = await walletClient.writeContract({
            abi: MockMailbox.abi,
            address: mockMailbox,
            functionName: "addRemoteMailbox",
            args: [opChainL1Client.chain.id, mockMailbox],
        });
        await opChainL1Client.waitForTransactionReceipt({ hash: addRemoteMailboxHash });

        // Deploy Router with MockMailbox
        routerAddress = MOCK_MAILBOX_CONTRACTS[opChainL1Client.chain.id].erc7579Router;
    });

    test("Create account - Deploy NOOP", async () => {
        // Kernel default plugins (EOA Sudo Validator)
        const ecdsaValidator = await signerToEcdsaValidator(opChainL1Client, {
            entryPoint,
            kernelVersion,
            signer: account,
            validatorAddress: LOCAL_KERNEL_CONTRACTS.ecdsaValidator,
        });
        const kernelPluginManager = await toKernelPluginManager<"0.7">(opChainL1Client, {
            entryPoint,
            kernelVersion,
            sudo: ecdsaValidator,
            chainId: opChainL1Client.chain.id,
        });
        // Kernel `initialize` call
        const initData = await getKernelInitData({
            kernelPluginManager,
            initHook: false,
            initConfig: [
                installOwnableExecutor({
                    owner: account.address,
                    executor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                }),
            ],
        });
        // KernelFactory `createAccount` call
        const salt = zeroHash;
        const kernelAddress = getKernelAddress({
            data: initData,
            salt,
            implementation: LOCAL_KERNEL_CONTRACTS.kernel,
            factoryAddress: LOCAL_KERNEL_CONTRACTS.kernelFactory,
        });

        const messageParams: ERC7579RouterMessage<ERC7579ExecutionMode.NOOP> = {
            owner: account.address,
            account: kernelAddress,
            executionMode: ERC7579ExecutionMode.NOOP,
            initData: initData,
            initSalt: salt,
        };
        // Dispatch Hyperlane Message
        const hashCallRemote = await walletClient.writeContract({
            address: routerAddress,
            abi: ERC7579ExecutorRouter.abi,
            functionName: "callRemote",
            args: [
                opChainL1Client.chain.id,
                routerAddress,
                messageParams.account,
                messageParams.initData ?? "0x",
                messageParams.initSalt ?? zeroHash,
                messageParams.executionMode,
                "0x",
                0n,
                0,
                0,
                "0x",
                "0x",
                zeroAddress,
            ],
        });
        await opChainL1Client.waitForTransactionReceipt({ hash: hashCallRemote });
        // Process Hyperlane Message
        await processNextInboundMessage(walletClient, { mailbox: mockMailbox });

        // Check account deployed
        const bytecode = await opChainL1Client.getCode({ address: kernelAddress });
        expect(bytecode).toBeDefined();
        // Check OwnableExecutor installed
        const isModuleInstalled = await opChainL1Client.readContract({
            address: kernelAddress,
            abi: Kernel.abi,
            functionName: "isModuleInstalled",
            args: [BigInt(ERC7579_MODULE_TYPE.EXECUTOR), LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor, "0x"],
        });
        expect(isModuleInstalled).toBe(true);
        const owners = await opChainL1Client.readContract({
            address: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            abi: OwnableSignatureExecutor.abi,
            functionName: "getOwners",
            args: [kernelAddress],
        });
        expect(owners).toStrictEqual([account.address]);
    });

    test("Create account - Deploy w/BatchSigned + Batch", async () => {
        // Kernel default plugins (EOA Sudo Validator)
        const ecdsaValidator = await signerToEcdsaValidator(opChainL1Client, {
            entryPoint,
            kernelVersion,
            signer: account,
            validatorAddress: LOCAL_KERNEL_CONTRACTS.ecdsaValidator,
        });
        const kernelPluginManager = await toKernelPluginManager<"0.7">(opChainL1Client, {
            entryPoint,
            kernelVersion,
            sudo: ecdsaValidator,
            chainId: opChainL1Client.chain.id,
        });
        // Kernel `initialize` call
        const initData = await getKernelInitData({
            kernelPluginManager,
            initHook: false,
            initConfig: [
                installOwnableExecutor({
                    owner: account.address,
                    executor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                }),
            ],
        });
        // KernelFactory `createAccount` call
        const salt = padHex("0x1", { size: 32 });
        const kernelAddress = getKernelAddress({
            data: initData,
            salt,
            implementation: LOCAL_KERNEL_CONTRACTS.kernel,
            factoryAddress: LOCAL_KERNEL_CONTRACTS.kernelFactory,
        });

        // Encode execution data
        // Set Router as Owner on OwnerExecutor (in addition to EOA)
        const addOwnerCallArgs: CallArgs = {
            to: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            data: encodeFunctionData({
                abi: OwnableSignatureExecutor.abi,
                functionName: "addOwner",
                args: [routerAddress],
            }),
        };
        // Set Remote Owners on Router
        const setAccountOwnersCallArgs: CallArgs = {
            to: routerAddress,
            data: encodeFunctionData({
                abi: ERC7579ExecutorRouter.abi,
                functionName: "setAccountOwners",
                args: [
                    [
                        {
                            domain: opChainL1Client.chain.id,
                            router: routerAddress,
                            owner: account.address,
                            enabled: true,
                        },
                    ],
                ],
            }),
        };
        // Encode call args
        const callData = encodeCallArgsBatch([addOwnerCallArgs, setAccountOwnersCallArgs]);
        // Get nonce key 0. We could also just generate a random key
        const nonce = await opChainL1Client.readContract({
            address: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            abi: OwnableSignatureExecutor.abi,
            functionName: "getNonce",
            args: [kernelAddress, 0n],
        });
        // Sign execution data
        const signatureExecution = {
            account: kernelAddress,
            nonce,
            validAfter: 0,
            validUntil: 2 ** 48 - 1,
            value: 0n,
            callData,
        };

        const signature = await account.signTypedData(
            getSignatureExecutionData(
                signatureExecution,
                LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                opChainL1Client.chain.id,
            ),
        );

        const messageParams: ERC7579RouterMessage<ERC7579ExecutionMode.BATCH_SIGNATURE> = {
            owner: account.address,
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
        // Dispatch Hyperlane Message
        const hashCallRemote = await walletClient.writeContract({
            address: routerAddress,
            abi: ERC7579ExecutorRouter.abi,
            functionName: "callRemote",
            args: [
                opChainL1Client.chain.id,
                routerAddress,
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
        await opChainL1Client.waitForTransactionReceipt({ hash: hashCallRemote });
        // Process Hyperlane Message
        const hashProcess = await walletClient.writeContract({
            address: mockMailbox,
            abi: MockMailbox.abi,
            functionName: "processNextInboundMessage",
        });
        await opChainL1Client.waitForTransactionReceipt({ hash: hashProcess });

        // Check account deployed
        const bytecode = await opChainL1Client.getCode({ address: kernelAddress });
        expect(bytecode).toBeDefined();
        // Check OwnableExecutor installed
        const isModuleInstalled = await opChainL1Client.readContract({
            address: kernelAddress,
            abi: Kernel.abi,
            functionName: "isModuleInstalled",
            args: [BigInt(ERC7579_MODULE_TYPE.EXECUTOR), LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor, "0x"],
        });
        expect(isModuleInstalled).toBe(true);
        const owners = await opChainL1Client.readContract({
            address: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            abi: OwnableSignatureExecutor.abi,
            functionName: "getOwners",
            args: [kernelAddress],
        });
        expect(owners).toStrictEqual([routerAddress, account.address]);
        // Check Router has owner
        const owned = await opChainL1Client.readContract({
            address: routerAddress,
            abi: ERC7579ExecutorRouter.abi,
            functionName: "owners",
            args: [kernelAddress, opChainL1Client.chain.id, routerAddress, account.address],
        });
        expect(owned).toBe(true);

        // Router is now owner OwnableExecutor & configured with owners
        // Execution can now be done directly WITHOUT signatures
        const callArgs1: CallArgs = {
            to: "0x0000000000000000000000000000000000000001",
            data: "0x1234",
        };
        const callData1 = encodeCallArgsBatch([callArgs1]);
        const messageParams1: ERC7579RouterMessage<ERC7579ExecutionMode.BATCH> = {
            owner: account.address,
            account: kernelAddress,
            executionMode: ERC7579ExecutionMode.BATCH,
            callData: callData1,
        };
        const hashCallRemote1 = await walletClient.writeContract({
            address: routerAddress,
            abi: ERC7579ExecutorRouter.abi,
            functionName: "callRemote",
            args: [
                opChainL1Client.chain.id,
                routerAddress,
                messageParams1.account,
                messageParams1.initData ?? "0x",
                messageParams1.initSalt ?? zeroHash,
                messageParams1.executionMode,
                messageParams1.callData,
                messageParams1.nonce ?? 0n,
                messageParams1.validAfter ?? 0,
                messageParams1.validUntil ?? 2 ** 48 - 1,
                messageParams1.signature ?? "0x",
                "0x",
                zeroAddress,
            ],
        });
        await opChainL1Client.waitForTransactionReceipt({ hash: hashCallRemote1 });
        const hashProcess1 = await walletClient.writeContract({
            address: mockMailbox,
            abi: MockMailbox.abi,
            functionName: "processNextInboundMessage",
        });
        await opChainL1Client.waitForTransactionReceipt({ hash: hashProcess1 });
    });
});
