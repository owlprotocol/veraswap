//polyfill Promise.withResolvers
import "core-js/actual/promise";
import { Instance } from "prool";
import { anvil, alto } from "prool/instances";
import { promisify } from "node:util";
import { exec } from "node:child_process";
import { entryPoint07Address } from "viem/account-abstraction";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { ENTRYPOINT_SALT_V07 } from "@owlprotocol/contracts-account-abstraction";
import { EntryPoint } from "@owlprotocol/contracts-account-abstraction/artifacts/EntryPoint"
import { getOrDeployDeterministicContract } from "@veraswap/create-deterministic"
import { OpenPaymaster } from "./src/artifacts/OpenPaymaster.js";
import { BalanceDeltaPaymaster } from "./src/artifacts/BalanceDeltaPaymaster.js";
import { OPEN_PAYMASTER_ADDRESS, BALANCE_DELTA_PAYMASTER_ADDRESS } from "./src/constants/erc4337.js";

import { opChainL1, opChainL1Port, opChainA, opChainAPort, opChainB, opChainBPort, opChainABundlerPort, opChainBBundlerPort, opChainL1BundlerPort, opChainL1Client, opChainAClient, opChainBClient } from "./src/chains/index.js";
import { createWalletClient, encodeDeployData, Hex, http, parseEther, zeroHash } from "viem";

const execPromise = promisify(exec);

let chainL1Instance: Instance;
let chainAInstance: Instance;
let chainBInstance: Instance;

let bundlerL1Instance: Instance;
let bundlerAInstance: Instance;
let bundlerBInstance: Instance;

//TODO: Consider using https://github.com/wevm/prool/pull/29, for now just deploy same infra
/**
 * Run once on `vitest` command. NOT on test re-runs
 */
export async function setup() {
    const host = "127.0.0.1";
    chainL1Instance = anvil({
        host,
        port: opChainL1Port,
        chainId: opChainL1.id,
    });
    chainAInstance = anvil({
        host,
        port: opChainAPort,
        chainId: opChainA.id,
    });
    chainBInstance = anvil({
        host,
        port: opChainBPort,
        chainId: opChainB.id,
    });

    await chainL1Instance.start();
    await chainAInstance.start();
    await chainBInstance.start();

    // Private Keys
    const anvil0 = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    const anvil1 = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
    const anvil2 = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"

    // Deploy EntryPoint artifact
    const anvilAccount = getAnvilAccount();
    for (let client of [opChainL1Client, opChainAClient, opChainBClient]) {
        const anvilClient = createWalletClient({
            account: anvilAccount,
            chain: client.chain,
            transport: http(),
        });
        const entryPointDeploy = await getOrDeployDeterministicContract(anvilClient,
            //Extracted salt (first 32 bytes) from original tx
            //https://etherscan.io/tx/0x5c81ea86f6c54481d3e21c78675b4f1d985c1fa62b678dcdfdf7934ddd6e127e
            {
                salt: ENTRYPOINT_SALT_V07,
                bytecode: EntryPoint.bytecode,
            });
        if (entryPointDeploy.hash) {
            await client.waitForTransactionReceipt({ hash: entryPointDeploy.hash });
        }
    }

    // Forge script
    const templateCommand = `forge script ./script/DeployLocal.s.sol --private-key ${anvil0} --broadcast`;
    const { stdout } = await execPromise(templateCommand);

    // Topup Paymasters
    for (let client of [opChainL1Client, opChainAClient, opChainBClient]) {
        const anvilClient = createWalletClient({
            account: anvilAccount,
            chain: client.chain,
            transport: http(),
        });

        // Deposit OpenPaymaster
        const depositOpenPaymasterHash = await anvilClient.writeContract({
            address: OPEN_PAYMASTER_ADDRESS,
            abi: OpenPaymaster.abi,
            functionName: "deposit",
            value: parseEther("10")
        })
        await client.waitForTransactionReceipt({ hash: depositOpenPaymasterHash });

        // Deposit BalanceDeltaPaymaster
        const depositBalanceDeltaPaymasterHash = await anvilClient.writeContract({
            address: BALANCE_DELTA_PAYMASTER_ADDRESS,
            abi: BalanceDeltaPaymaster.abi,
            functionName: "deposit",
            value: parseEther("10")
        })
        await client.waitForTransactionReceipt({ hash: depositBalanceDeltaPaymasterHash });
    }

    const executorPrivateKeys: Hex[] = [anvil1]
    bundlerL1Instance = alto({
        safeMode: false, // avoid opcode checks
        port: opChainL1BundlerPort,
        entrypoints: [entryPoint07Address],
        rpcUrl: opChainL1.rpcUrls.default.http[0],
        executorPrivateKeys,
        utilityPrivateKey: anvil2,
    })
    bundlerAInstance = alto({
        safeMode: false, // avoid opcode checks
        port: opChainABundlerPort,
        entrypoints: [entryPoint07Address],
        rpcUrl: opChainA.rpcUrls.default.http[0],
        executorPrivateKeys,
        utilityPrivateKey: anvil2
    })
    bundlerBInstance = alto({
        safeMode: false, // avoid opcode checks
        port: opChainBBundlerPort,
        entrypoints: [entryPoint07Address],
        rpcUrl: opChainB.rpcUrls.default.http[0],
        executorPrivateKeys,
        utilityPrivateKey: anvil2
    })

    await bundlerL1Instance.start();
    await bundlerAInstance.start();
    await bundlerBInstance.start();
}

/**
 * Run once `vitest` process has exited. NOT on test re-runs
 */
export async function teardown() {
    await chainL1Instance.stop();
    await chainAInstance.stop();
    await chainBInstance.stop();

    await bundlerL1Instance.stop();
    await bundlerAInstance.stop();
    await bundlerBInstance.stop();
}
