import { KernelPluginManager } from "@zerodev/sdk";
import { encodeFunctionData, Hex, zeroAddress } from "viem";

import { Kernel } from "../artifacts/Kernel.js";

/**
 * Get Kernel v3.1 Init Data
 * @param params Kernel Plugin Manager, Init Hook, Init Config
 */
export async function getKernelInitData({
    kernelPluginManager,
    initHook,
    initConfig,
}: {
    kernelPluginManager: KernelPluginManager<"0.7">;
    initHook: boolean;
    initConfig?: Hex[];
}) {
    const { enableData, identifier, initConfig: initConfig_ } = await kernelPluginManager.getValidatorInitData();

    return encodeFunctionData({
        abi: Kernel.abi,
        functionName: "initialize",
        args: [
            identifier,
            initHook && kernelPluginManager.hook ? kernelPluginManager.hook?.getIdentifier() : zeroAddress,
            enableData,
            initHook && kernelPluginManager.hook ? await kernelPluginManager.hook?.getEnableData() : "0x",
            initConfig ?? initConfig_ ?? [],
        ],
    });
}
