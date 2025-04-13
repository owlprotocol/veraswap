import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { Address, encodeDeployData, zeroHash } from "viem";

import { ECDSAValidator } from "../artifacts/ECDSAValidator.js";
import { Execute } from "../artifacts/Execute.js";
import { Kernel } from "../artifacts/Kernel.js";
import { KernelFactory } from "../artifacts/KernelFactory.js";
import { OwnableSignatureExecutor } from "../artifacts/OwnableSignatureExecutor.js";

/*** Kernel Constants ***/

export function getKernelContracts() {
    const entrypoint: Address = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";

    // Kernel
    const kernel = getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            abi: Kernel.abi,
            bytecode: Kernel.bytecode,
            args: [entrypoint],
        }),
        salt: zeroHash,
    });
    const kernelFactory = getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            abi: KernelFactory.abi,
            bytecode: KernelFactory.bytecode,
            args: [kernel],
        }),
        salt: zeroHash,
    });

    const ecdsaValidator = getDeployDeterministicAddress({
        bytecode: ECDSAValidator.bytecode,
        salt: zeroHash,
    });

    const ownableSignatureExecutor = getDeployDeterministicAddress({
        bytecode: OwnableSignatureExecutor.bytecode,
        salt: zeroHash,
    });

    const execute = getDeployDeterministicAddress({
        bytecode: Execute.bytecode,
        salt: zeroHash,
    });

    return {
        kernel,
        kernelFactory,
        ecdsaValidator,
        ownableSignatureExecutor,
        execute,
    };
}

//TODO: Index by chainId to keep consistent with other constants (eg. hyperlane)
// For default local deployment with anvil(0) address
export const LOCAL_KERNEL_CONTRACTS = getKernelContracts();
