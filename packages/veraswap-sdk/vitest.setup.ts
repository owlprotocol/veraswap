//polyfill Promise.withResolvers
import "core-js/actual/promise";
import { Instance } from "prool";
import { anvil } from "prool/instances";
import { promisify } from "node:util";
import { exec } from "node:child_process";

import { localOp, localOpChainA, portLocalOp, portLocalOpChainA } from "./src/chains.js";
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
        port: portLocalOp,
        chainId: localOp.id,
        codeSizeLimit,
    });

    instance2 = anvil({
        host,
        port: portLocalOpChainA,
        chainId: localOpChainA.id,
        codeSizeLimit,
    });

    await instance.start();
    await instance2.start();

    // Forge scripts
    const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // anvil 0
    const templateCommand = `forge script ./script/DeployAll.s.sol --private-key ${privateKey} --broadcast --via-ir --code-size-limit ${codeSizeLimit}`;
    await execPromise(templateCommand);
}

/**
 * Run once `vitest` process has exited. NOT on test re-runs
 */
export async function teardown() {
    await instance.stop();
    await instance2.stop();
}
