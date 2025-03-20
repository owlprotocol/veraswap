import { describe, test } from "vitest";
import { Account } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";

import { getAnvilAccount } from "@veraswap/anvil-account";

import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";

import { LOCAL_KERNEL_CONTRACTS } from "../constants/kernel.js";
import { opChainL1Client } from "../constants/chains.js";
import { getKernelInitData } from "./getKernelInitData.js";
import { installOwnableExecutor } from "./installOwnableExecutor.js";
import { toKernelPluginManager } from "@zerodev/sdk/accounts";

describe("smartaccount/index.test.ts", function () {
    // Test ZeroDev SDK & Custom SDK Tooling
    const entryPoint = { address: entryPoint07Address, version: "0.7" } as const;
    const kernelVersion = KERNEL_V3_1;

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
            const signer: Account = getAnvilAccount(1);

            const ecdsaValidator = await signerToEcdsaValidator(opChainL1Client, {
                entryPoint,
                kernelVersion,
                signer,
                validatorAddress: LOCAL_KERNEL_CONTRACTS.ecdsaValidator,
            });
            const kernelPluginManager = await toKernelPluginManager<"0.7">(opChainL1Client, {
                entryPoint,
                kernelVersion,
                sudo: ecdsaValidator,
                chainId: opChainL1Client.chain.id,
            });
            const initData = await getKernelInitData({
                kernelPluginManager,
                initHook: false,
                initConfig: [
                    installOwnableExecutor({
                        owner: signer.address,
                        executor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                    }),
                ],
            });

            console.debug({ initData });
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
