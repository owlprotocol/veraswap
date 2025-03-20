//polyfill Promise.withResolvers
import "core-js/actual/promise";
import { Instance } from "prool";
import { anvil } from "prool/instances";
import { promisify } from "node:util";
import { exec } from "node:child_process";

import { opChainL1, opChainL1Port, opChainA, opChainAPort, opChainB, opChainBPort } from "./src/test/constants.js";

const execPromise = promisify(exec);

let chainL1Instance: Instance;
let chainAInstance: Instance;
let chainBInstance: Instance;

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

    // Forge script
    const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // anvil 0
    const templateCommand = `forge script ./script/DeployAll.s.sol --private-key ${privateKey} --broadcast`;
    const { stdout } = await execPromise(templateCommand);
}

/**
 * Run once `vitest` process has exited. NOT on test re-runs
 */
export async function teardown() {
    await chainL1Instance.stop();
    await chainAInstance.stop();
    await chainBInstance.stop();
}
