//polyfill Promise.withResolvers
import "core-js/actual/promise";
import { Instance } from "prool";
import { anvil } from "prool/instances";
import { createWalletClient, http } from "viem";
import { localhost } from "viem/chains";
import { getOrDeployDeterministicDeployer, getLocalAccount } from "@owlprotocol/viem-utils";
import { waitForTransactionReceipt } from "viem/actions";
import { setupTestMailboxContracts } from "@owlprotocol/contracts-hyperlane";
import { promisify } from "node:util";
import { exec } from "node:child_process";

import { chainId2, localhost2, port, port2 } from "./src/test/constants.js";

const execPromise = promisify(exec);

let instance: Instance;
let instance2: Instance;

/**
 * Run once on `vitest` command. NOT on test re-runs
 */
export async function setup() {
    const host = "127.0.0.1";
    const codeSizeLimit = 393216; //10x normal size
    instance = anvil({
        host,
        port,
        chainId: localhost.id,
        codeSizeLimit,
    });

    instance2 = anvil({
        host,
        port: port2,
        chainId: chainId2,
        codeSizeLimit,
    });

    await instance.start();
    await instance2.start();

    const transport = http(`http://${host}:${port}`);
    const transport2 = http(`http://${host}:${port2}`);

    // Deploy Deterministic Deployer
    const walletClient = createWalletClient({
        account: getLocalAccount(0),
        chain: localhost,
        transport,
    });
    const { hash } = await getOrDeployDeterministicDeployer(walletClient);
    if (hash) {
        await waitForTransactionReceipt(walletClient, { hash });
    }

    const walletClient2 = createWalletClient({
        account: getLocalAccount(0),
        chain: localhost2,
        transport: transport2,
    });
    const { hash: hash2 } = await getOrDeployDeterministicDeployer(walletClient2);
    if (hash2) {
        await waitForTransactionReceipt(walletClient2, { hash: hash2 });
    }

    // Forge scripts
    const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // anvil 0
    const templateCommand = `forge script ./script/DeployAnvil.s.sol --rpc-url http://${host}:${port} --private-key ${privateKey} --broadcast --via-ir --code-size-limit ${codeSizeLimit}`;
    const { stdout } = await execPromise(templateCommand);
    const templateCommand2 = `forge script ./script/DeployAnvil.s.sol --rpc-url http://${host}:${port2} --private-key ${privateKey} --broadcast --via-ir --code-size-limit ${codeSizeLimit}`;
    await execPromise(templateCommand2);

    const poolManager = stdout.match(/v4PoolManager: (0x.*?)\n/)?.[1];
    const positionManager = stdout.match(/v4PositionManager: (0x.*?)\n/)?.[1];
    const universalRouter = stdout.match(/router: (0x.*?)\n/)?.[1];
    const quoter = stdout.match(/v4Quoter: (0x.*?)\n/)?.[1];
    const stateView = stdout.match(/stateView: (0x.*?)\n/)?.[1];
    console.log({ poolManager, positionManager, universalRouter, quoter, stateView });

    const mailboxContracts = await setupTestMailboxContracts(walletClient);
    const mailboxAddress = mailboxContracts.mailbox.address;

    const mailboxContracts2 = await setupTestMailboxContracts(walletClient2);
    const mailboxAddress2 = mailboxContracts2.mailbox.address;

    console.log({ mailboxAddress, mailboxAddress2 });
}

/**
 * Run once `vitest` process has exited. NOT on test re-runs
 */
export async function teardown() {
    await instance.stop();
    await instance2.stop();
}
