import { describe, expect, test, beforeEach, beforeAll } from "vitest";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { connect, createConfig, http } from "@wagmi/core";
import { QueryClient } from "@tanstack/react-query";
import { mock } from "@wagmi/connectors";

import { opChainL1, opChainL1Client } from "../chains/supersim.js";

import { getTransferRemoteCalls } from "./getTransferRemoteCalls.js";
import { LOCAL_TOKENS, localMockTokens } from "../constants/tokens.js";
import { Address, bytesToHex, createWalletClient, LocalAccount, padHex } from "viem";
import { getRandomValues } from "crypto";
import { IERC20 } from "../artifacts/IERC20.js";
import { PERMIT2_ADDRESS } from "../constants/uniswap.js";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { toKernelPluginManager } from "@zerodev/sdk/accounts";
import { KernelFactory } from "../artifacts/KernelFactory.js";
import { LOCAL_KERNEL_CONTRACTS } from "../constants/kernel.js";
import { getKernelAddress } from "../smartaccount/getKernelAddress.js";
import { getKernelInitData } from "../smartaccount/getKernelInitData.js";
import { installOwnableExecutor } from "../smartaccount/OwnableExecutor.js";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { entryPoint07Address } from "viem/account-abstraction";
import { OwnableSignatureExecutor } from "../artifacts/OwnableSignatureExecutor.js";
import { encodeCallArgsBatch } from "../smartaccount/ExecLib.js";

describe("calls/getTransferRemoteCallsKernel.test.ts", function () {
    const anvilAccount = getAnvilAccount();
    const anvilClient = createWalletClient({
        account: anvilAccount,
        chain: opChainL1Client.chain,
        transport: http(),
    });

    // Mock connector to use wagmi signing
    const mockConnector = mock({
        accounts: [
            anvilAccount.address, //only works because anvil will allow RPC based signing (connector does not use in-memory pkey)
        ],
    });
    const config = createConfig({
        chains: [opChainL1],
        transports: {
            [opChainL1.id]: http(),
        },
        connectors: [mockConnector],
    });
    const queryClient = new QueryClient();

    const entryPoint = { address: entryPoint07Address, version: "0.7" } as const;
    const kernelVersion = KERNEL_V3_1;

    let kernelAddress: Address;

    const tokenA = localMockTokens[0];
    const tokenAHypERC20Collateral = LOCAL_TOKENS[0];

    beforeAll(async () => {
        await connect(config, {
            chainId: opChainL1.id,
            connector: mockConnector,
        });
    });

    beforeEach(async () => {
        // Create smart account
        const ecdsaValidator = await signerToEcdsaValidator(opChainL1Client, {
            entryPoint,
            kernelVersion,
            signer: { type: "local", address: anvilAccount.address } as LocalAccount,
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
                    owner: anvilAccount.address,
                    executor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                }),
            ],
        });
        // KernelFactory `createAccount` call
        const salt = padHex(bytesToHex(getRandomValues(new Uint8Array(32))), { size: 32 });

        kernelAddress = getKernelAddress({
            data: initData,
            salt,
            implementation: LOCAL_KERNEL_CONTRACTS.kernel,
            factoryAddress: LOCAL_KERNEL_CONTRACTS.kernelFactory,
        });

        const hash = await anvilClient.writeContract({
            address: LOCAL_KERNEL_CONTRACTS.kernelFactory,
            abi: KernelFactory.abi,
            functionName: "createAccount",
            args: [initData, salt],
        });
        await opChainL1Client.waitForTransactionReceipt({ hash });

        const bytecode = await opChainL1Client.getCode({ address: kernelAddress });
        expect(bytecode).toBeDefined();
    });

    test("getTransferRemoteCalls - smart account", async () => {
        const preCollateralBalance = await opChainL1Client.readContract({
            address: tokenA.address,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [tokenAHypERC20Collateral.address],
        });

        const transferRemoteCalls = await getTransferRemoteCalls(queryClient, config, {
            chainId: opChainL1.id,
            token: tokenAHypERC20Collateral.address,
            tokenStandard: "HypERC20Collateral",
            account: kernelAddress,
            funder: anvilAccount.address,
            destination: 901,
            recipient: kernelAddress,
            amount: 1n,
            approveAmount: "MAX_UINT_256",
            permit2: {
                approveExpiration: "MAX_UINT_48",
                approveAmount: "MAX_UINT_160",
            },
        });
        expect(transferRemoteCalls.calls.length).toBe(4);

        // Permit2.permit(funder, permitSingle, signature)
        expect(transferRemoteCalls.calls[0]).toBeDefined();
        expect(transferRemoteCalls.calls[0].to).toBe(PERMIT2_ADDRESS);
        // Permit2.transferFrom(funder, account, 1n, token)
        expect(transferRemoteCalls.calls[1]).toBeDefined();
        expect(transferRemoteCalls.calls[1].to).toBe(PERMIT2_ADDRESS);
        // ERC20.approve(HypERC20Collateral, 1)
        expect(transferRemoteCalls.calls[2]).toBeDefined();
        expect(transferRemoteCalls.calls[2].to).toBe(tokenA.address);
        // HypERC20Collateral.transferRemote(...)
        expect(transferRemoteCalls.calls[3]).toBeDefined();
        expect(transferRemoteCalls.calls[3].to).toBe(tokenAHypERC20Collateral.address);

        // Execute batched calls
        const callData = encodeCallArgsBatch(transferRemoteCalls.calls);

        await opChainL1Client.waitForTransactionReceipt({
            hash: await anvilClient.writeContract({
                address: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                abi: OwnableSignatureExecutor.abi,
                functionName: "executeBatchOnOwnedAccount",
                args: [kernelAddress, callData],
            }),
        });

        const postCollateralBalance = await opChainL1Client.readContract({
            address: tokenA.address,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [tokenAHypERC20Collateral.address],
        });
        expect(postCollateralBalance - preCollateralBalance).toBe(1n);
    });
});
