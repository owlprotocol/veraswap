import { describe, expect, test } from "vitest";
import { Account, createWalletClient, encodeFunctionData, http, zeroHash } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";

import { getAnvilAccount } from "@veraswap/anvil-account";

import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { toKernelPluginManager } from "@zerodev/sdk/accounts";

import { LOCAL_KERNEL_CONTRACTS } from "../constants/kernel.js";
import { opChainL1Client } from "../constants/chains.js";
import { getKernelInitData } from "./getKernelInitData.js";
import { installOwnableExecutor } from "./installOwnableExecutor.js";
import { KernelFactory } from "../artifacts/KernelFactory.js";
import { getKernelAddress } from "./getKernelAddress.js";

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
            const kernalAddressPredicted = getKernelAddress({
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

            const bytecode = await opChainL1Client.getCode({ address: kernalAddressPredicted });
            expect(bytecode).toBeDefined();
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
