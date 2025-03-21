import { beforeAll, describe, expect, test } from "vitest";
import {
    Account,
    Address,
    createWalletClient,
    encodeAbiParameters,
    encodeDeployData,
    encodeFunctionData,
    http,
    padHex,
    zeroAddress,
    zeroHash,
} from "viem";
import { entryPoint07Address } from "viem/account-abstraction";

import { getAnvilAccount } from "@veraswap/anvil-account";
import { getOrDeployDeterministicContract } from "@veraswap/create-deterministic";

import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { toKernelPluginManager } from "@zerodev/sdk/accounts";

import { LOCAL_KERNEL_CONTRACTS } from "../constants/kernel.js";
import { opChainL1Client } from "../constants/chains.js";
import { getKernelInitData } from "./getKernelInitData.js";
import { encodeExecuteSignature, installOwnableExecutor } from "./OwnableExecutor.js";
import { getKernelAddress } from "./getKernelAddress.js";
import { Kernel } from "../artifacts/Kernel.js";
import { OwnableSignatureExecutor } from "../artifacts/OwnableSignatureExecutor.js";
import { CallArgs, encodeCallArgsBatch, encodeCallArgsSingle } from "./ExecLib.js";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { ERC7579_MODULE_TYPE } from "./ERC7579Module.js";
import { ERC7579ExecutorRouter } from "../artifacts/ERC7579ExecutorRouter.js";
import { encodeERC7579RouterMessage, ERC7579ExecutionMode } from "./ERC7579ExecutorRouter.js";
import { MockMailbox } from "../artifacts/MockMailbox.js";

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
        // Deploy Mock mailbox
        const mailboxDeployment = await getOrDeployDeterministicContract(walletClient, {
            bytecode: encodeDeployData({
                abi: MockMailbox.abi,
                bytecode: MockMailbox.bytecode,
                args: [opChainL1Client.chain.id],
            }),
            salt: zeroHash,
        });
        if (mailboxDeployment.hash) {
            await opChainL1Client.waitForTransactionReceipt({ hash: mailboxDeployment.hash });
        }
        mockMailbox = mailboxDeployment.address;
        // Add self as remote mailbox for domain
        const addRemoteMailboxHash = await walletClient.writeContract({
            abi: MockMailbox.abi,
            address: mockMailbox,
            functionName: "addRemoteMailbox",
            args: [opChainL1Client.chain.id, mockMailbox],
        });
        await opChainL1Client.waitForTransactionReceipt({ hash: addRemoteMailboxHash });

        // Deploy Router with fake Mailbox (so we can execute handle directly)
        const routerDeployResult = await getOrDeployDeterministicContract(walletClient, {
            bytecode: encodeDeployData({
                abi: ERC7579ExecutorRouter.abi,
                bytecode: ERC7579ExecutorRouter.bytecode,
                args: [
                    mockMailbox,
                    zeroAddress, //no ISM needed
                    LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                    LOCAL_KERNEL_CONTRACTS.kernelFactory,
                ],
            }),
            salt: zeroHash,
        });
        if (routerDeployResult.hash) {
            await opChainL1Client.waitForTransactionReceipt({ hash: routerDeployResult.hash });
        }
        routerAddress = routerDeployResult.address;
    });

    test("Create account - NOOP", async () => {
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

        const message = encodeERC7579RouterMessage({
            owner: account.address,
            account: kernelAddress,
            executionMode: ERC7579ExecutionMode.NOOP,
            initData: initData,
            initSalt: salt,
        });
        // Dispatch Hyperlane Message to Mock
        const hashDispatch = await walletClient.writeContract({
            address: mockMailbox,
            abi: MockMailbox.abi,
            functionName: "dispatch",
            args: [opChainL1Client.chain.id, padHex(routerAddress, { size: 32 }), message, "0x", zeroAddress],
        });
        await opChainL1Client.waitForTransactionReceipt({ hash: hashDispatch });
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
        expect(owners).toStrictEqual([account.address]);
    });

    test("Create account - Execute Batch Signed", async () => {
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
        const signatureParams = {
            chainId: BigInt(opChainL1Client.chain.id),
            ownedAccount: kernelAddress,
            nonce: nonce,
            validAfter: 0,
            validUntil: 2 ** 48 - 1,
            msgValue: 0n,
            callData,
        };
        const signatureData = encodeExecuteSignature(signatureParams);
        const signature = await account.signMessage({ message: { raw: signatureData } });
        const message = encodeERC7579RouterMessage({
            owner: account.address,
            account: kernelAddress,
            executionMode: ERC7579ExecutionMode.BATCH_SIGNATURE,
            initData: initData,
            initSalt: salt,
            callData: signatureParams.callData,
            nonce: signatureParams.nonce,
            validAfter: signatureParams.validAfter,
            validUntil: signatureParams.validUntil,
            signature,
        });
        // Dispatch Hyperlane Message to Mock
        const hashDispatch = await walletClient.writeContract({
            address: mockMailbox,
            abi: MockMailbox.abi,
            functionName: "dispatch",
            args: [opChainL1Client.chain.id, padHex(routerAddress, { size: 32 }), message, "0x", zeroAddress],
        });
        await opChainL1Client.waitForTransactionReceipt({ hash: hashDispatch });
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
    });
});
