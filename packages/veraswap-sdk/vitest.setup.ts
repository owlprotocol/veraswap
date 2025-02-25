//polyfill Promise.withResolvers
import "core-js/actual/promise";
import { Instance } from "prool";
import { anvil, alto } from "prool/instances";
import { createWalletClient, http, nonceManager } from "viem";
import { localhost } from "viem/chains";
import { entryPoint07Address } from "viem/account-abstraction"
// import { setupTestMailboxContracts } from "@owlprotocol/contracts-hyperlane";
import { promisify } from "node:util";
import { exec } from "node:child_process";

import { getAnvilAccount } from "@owlprotocol/anvil-account"
import { setupERC4337Contracts } from "@owlprotocol/contracts-account-abstraction"

import { chainId2, localhost2, anvilPort0, anvilPort1, altoPort0 } from "./src/test/constants.js";

const execPromise = promisify(exec);

let anvil0: Instance;
let alto0: Instance;
let anvil1: Instance;

/**
 * Run once on `vitest` command. NOT on test re-runs
 */
export async function setup() {
    const host = "127.0.0.1";
    const rpc0 = `http://${host}:${anvilPort0}`
    const rpc1 = `http://${host}:${anvilPort1}`

    const codeSizeLimit = 393216; //10x normal size
    anvil0 = anvil({
        host,
        port: anvilPort0,
        chainId: localhost.id,
        codeSizeLimit,
    });
    anvil1 = anvil({
        host,
        port: anvilPort1,
        chainId: chainId2,
        codeSizeLimit,
    });

    await anvil0.start();
    await anvil1.start();

    const transport = http(rpc0);
    const transport2 = http(rpc1);

    const walletClient = createWalletClient({
        account: getAnvilAccount(0, { nonceManager }),
        chain: localhost,
        transport,
    });
    // Deploy core ERC4337 contracts (no paymaster)
    await setupERC4337Contracts(walletClient);

    alto0 = alto({
      port: altoPort0,
      entrypoints: [entryPoint07Address],
      rpcUrl: rpc0,
      executorPrivateKeys: ["0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6"],
      utilityPrivateKey: "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97",
      safeMode: false,
    });
    await alto0.start()

    const walletClient2 = createWalletClient({
        account: getAnvilAccount(0),
        chain: localhost2,
        transport: transport2,
    });

    // Forge scripts
    const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // anvil 0
    const templateCommand = `forge script ./script/DeployAnvil.s.sol --rpc-url http://${host}:${anvilPort0} --private-key ${privateKey} --broadcast --via-ir --code-size-limit ${codeSizeLimit}`;
    const { stdout } = await execPromise(templateCommand);
    const templateCommand2 = `forge script ./script/DeployAnvil.s.sol --rpc-url http://${host}:${anvilPort1} --private-key ${privateKey} --broadcast --via-ir --code-size-limit ${codeSizeLimit}`;
    await execPromise(templateCommand2);

    const poolManager = stdout.match(/v4PoolManager: (0x.*?)\n/)?.[1];
    const positionManager = stdout.match(/v4PositionManager: (0x.*?)\n/)?.[1];
    const universalRouter = stdout.match(/router: (0x.*?)\n/)?.[1];
    const quoter = stdout.match(/v4Quoter: (0x.*?)\n/)?.[1];
    const stateView = stdout.match(/stateView: (0x.*?)\n/)?.[1];
    const mockA = stdout.match(/MockA: (0x.*?)\n/)?.[1]
    const mockB = stdout.match(/MockB: (0x.*?)\n/)?.[1]
    console.log({ poolManager, positionManager, universalRouter, quoter, stateView, mockA, mockB });

    /*
    const mailboxContracts = await setupTestMailboxContracts(walletClient);
    const mailboxAddress = mailboxContracts.mailbox.address;

    const mailboxContracts2 = await setupTestMailboxContracts(walletClient2);
    const mailboxAddress2 = mailboxContracts2.mailbox.address;

    console.log({ mailboxAddress, mailboxAddress2 });
    */
}

/**
 * Run once `vitest` process has exited. NOT on test re-runs
 */
export async function teardown() {
    await alto0.stop()
    await anvil0.stop();
    await anvil1.stop();
}
