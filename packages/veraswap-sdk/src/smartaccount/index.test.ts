import { describe, expect, test } from "vitest";
import { Account, createWalletClient, http, zeroHash } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";

import { getAnvilAccount } from "@veraswap/anvil-account";

import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { toKernelPluginManager } from "@zerodev/sdk/accounts";

import { LOCAL_KERNEL_CONTRACTS } from "../constants/kernel.js";
import { opChainL1Client } from "../constants/chains.js";
import { getKernelInitData } from "./getKernelInitData.js";
import { ERC7579_MODULE_TYPE, installOwnableExecutor } from "./installOwnableExecutor.js";
import { KernelFactory } from "../artifacts/KernelFactory.js";
import { getKernelAddress } from "./getKernelAddress.js";
import { Kernel } from "../artifacts/Kernel.js";

describe("smartaccount/index.test.ts", function () {
    // Test ZeroDev SDK & Custom SDK Tooling
    const entryPoint = { address: entryPoint07Address, version: "0.7" } as const;
    const kernelVersion = KERNEL_V3_1;

    const account: Account = getAnvilAccount(1);
    const walletClient = createWalletClient({ account, chain: opChainL1Client.chain, transport: http() });

    /**
     * TODO
     * - Kernel deploy with Executor
     * - Execute via Direct Call
     * - Execute via Signature
     * - Execute via ERC7579 Router (set Mailbox as EOA)
     *
     * - Kernel deploy via ERC7579 Router
     */

    describe("OwnableExecutor", () => {
        test("installOwnableExecutor", async () => {
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
            const kernelAddressPredicted = getKernelAddress({
                data: initData,
                salt: zeroHash,
                implementation: LOCAL_KERNEL_CONTRACTS.kernel,
                factoryAddress: LOCAL_KERNEL_CONTRACTS.kernelFactory,
            });

            const hash = await walletClient.writeContract({
                address: LOCAL_KERNEL_CONTRACTS.kernelFactory,
                abi: KernelFactory.abi,
                functionName: "createAccount",
                args: [initData, zeroHash],
            });
            await opChainL1Client.waitForTransactionReceipt({ hash });

            const bytecode = await opChainL1Client.getCode({ address: kernelAddressPredicted });
            expect(bytecode).toBeDefined();

            const isModuleInstalled = await opChainL1Client.readContract({
                address: kernelAddressPredicted,
                abi: Kernel.abi,
                functionName: "isModuleInstalled",
                args: [BigInt(ERC7579_MODULE_TYPE.EXECUTOR), LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor, "0x"],
            });
            expect(isModuleInstalled).toBe(true);
        });

        test("OwnableExecutor.executeOnOwnedAccount - direct", () => { });

        test("OwnableExecutor.executeBatchOnOwnedAccount - direct", () => { });

        test("OwnableExecutor.executeOnOwnedAccount - signature", () => { });

        test("OwnableExecutor.executeBatchOnOwnedAccount - signature", () => { });
    });

    describe("ERC7579Router", () => {
        test("ERC7579 Router - Account Init", () => { });
    });
});
