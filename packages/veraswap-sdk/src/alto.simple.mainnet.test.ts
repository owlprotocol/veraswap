import { createSmartAccountClient, SmartAccountClient } from "permissionless";
import { toSimpleSmartAccount, ToSimpleSmartAccountReturnType } from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import {
    Chain,
    createPublicClient,
    encodeFunctionData,
    Hash,
    Hex,
    hexToBigInt,
    http,
    LocalAccount,
    parseEther,
    Transport,
    zeroHash,
} from "viem";
import { entryPoint07Address } from "viem/account-abstraction";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { beforeAll, describe, expect, test } from "vitest";

import { BalanceDeltaPaymaster } from "./artifacts/BalanceDeltaPaymaster.js";
import { base } from "./chains/base.js";
import { ERC4337_CONTRACTS } from "./constants/erc4337.js";

const PRIVATE_KEY = process.env.PRIVATE_KEY! as Hash;
const PIMLICO_API_KEY = process.env.PIMLICO_API_KEY! as Hash;

if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not set");
}

if (!PIMLICO_API_KEY) {
    throw new Error("PIMPLICO_API_KEY is not set");
}

describe("alto.simple.mainnet.test.ts", function () {
    const chain = base;
    const contracts = ERC4337_CONTRACTS[chain.id]!;
    const publicClient = createPublicClient({ chain, transport: http() });

    const pimlicoUrl = `https://api.pimlico.io/v2/${chain.id}/rpc?apikey=${PIMLICO_API_KEY}`;
    const bundlerTransport = http(pimlicoUrl);

    const pimlicoClient = createPimlicoClient({
        transport: http(pimlicoUrl),
        entryPoint: {
            address: entryPoint07Address,
            version: "0.7",
        },
    });

    const account = privateKeyToAccount(PRIVATE_KEY) as LocalAccount;

    const entryPoint = { address: entryPoint07Address, version: "0.7" } as const;

    let smartAccountSalt: Hex;
    let smartAccount: ToSimpleSmartAccountReturnType<"0.7">;
    let smartAccountClient: SmartAccountClient<Transport, Chain, ToSimpleSmartAccountReturnType<"0.7">>;

    beforeAll(async () => {
        const entryPointCode = await publicClient.getCode({ address: entryPoint07Address });
        expect(entryPointCode).toBeDefined();
        const simpleAccountFactoryCode = await publicClient.getCode({ address: contracts.simpleAccountFactory });
        expect(simpleAccountFactoryCode).toBeDefined();
        const balanceDeltaPaymasterCode = await publicClient.getCode({ address: contracts.balanceDeltaPaymaster });
        expect(balanceDeltaPaymasterCode).toBeDefined();

        smartAccountSalt = zeroHash;
        smartAccount = await toSimpleSmartAccount({
            owner: account,
            client: publicClient,
            entryPoint,
            factoryAddress: contracts.simpleAccountFactory,
            index: hexToBigInt(smartAccountSalt),
        });
        smartAccountClient = createSmartAccountClient({
            account: smartAccount,
            chain,
            bundlerTransport,
            userOperation: {
                estimateFeesPerGas: async () => {
                    return (await pimlicoClient.getUserOperationGasPrice()).fast;
                },
            },
        });
    });

    test("self pay", async () => {
        const target = privateKeyToAccount(generatePrivateKey());
        const callData = await smartAccountClient.account.encodeCalls([
            {
                to: target.address,
                value: 1n,
                data: "0x",
            },
        ]);
        const fees = await publicClient.estimateFeesPerGas();
        const userOpHash = await smartAccountClient.sendUserOperation({
            callData,
            maxFeePerGas: fees.maxFeePerGas,
            maxPriorityFeePerGas: fees.maxFeePerGas,
        });
        console.debug({ userOpHash });
        const userOpReceipt = await pimlicoClient.waitForUserOperationReceipt({
            hash: userOpHash,
            timeout: 1000 * 15,
        });
        expect(userOpReceipt).toBeDefined();

        const balance = await publicClient.getBalance({ address: target.address });
        expect(balance).toBe(1n);
    });

    test.only("paymaster - balance delta", async () => {
        const target = privateKeyToAccount(generatePrivateKey());
        const calls = [
            {
                to: target.address,
                value: 1n,
                data: "0x",
            },
        ] as const;

        // Get cost of calls without paymaster
        const userOpGas = await smartAccountClient.estimateUserOperationGas({
            calls,
            //@ts-expect-error expected type error
            stateOverride: [
                {
                    // Adding 100 ETH to the smart account during estimation to prevent AA21 errors while estimating
                    balance: parseEther("100"),
                    address: smartAccountClient.account.address,
                },
            ],
        });
        const DEPOSIT_GAS_COST = 50_000n; //may be even more optimized, but this is a good estimate
        const userOpGasTotal =
            userOpGas.preVerificationGas + userOpGas.verificationGasLimit + userOpGas.callGasLimit + DEPOSIT_GAS_COST;
        const feesPerGas = (await pimlicoClient.getUserOperationGasPrice()).fast;
        const userOpMaxCost = userOpGasTotal * feesPerGas.maxFeePerGas;

        const userOpHash = await smartAccountClient.sendUserOperation({
            calls: [
                ...calls,
                {
                    to: contracts.balanceDeltaPaymaster,
                    value: userOpMaxCost,
                    data: encodeFunctionData({
                        abi: BalanceDeltaPaymaster.abi,
                        functionName: "deposit",
                        args: [],
                    }),
                },
            ],
            maxFeePerGas: feesPerGas.maxFeePerGas,
            maxPriorityFeePerGas: feesPerGas.maxFeePerGas,
            paymaster: contracts.balanceDeltaPaymaster,
        });
        const userOpReceipt = await pimlicoClient.waitForUserOperationReceipt({
            hash: userOpHash,
            timeout: 1000 * 15,
        });
        expect(userOpReceipt).toBeDefined();

        const balance = await publicClient.getBalance({ address: target.address });
        expect(balance).toBe(1n);
    });
});
