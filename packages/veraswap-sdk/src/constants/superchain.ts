import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { encodeDeployData, zeroHash } from "viem";

import { SuperchainERC7579ExecutorRouter } from "../artifacts/SuperchainERC7579ExecutorRouter.js";

import { LOCAL_KERNEL_CONTRACTS } from "./kernel.js";

// TODO: Consider using a value per chain
export const SUPERCHAIN_ERC7579_ROUTER = getDeployDeterministicAddress({
    bytecode: encodeDeployData({
        bytecode: SuperchainERC7579ExecutorRouter.bytecode,
        abi: SuperchainERC7579ExecutorRouter.abi,
        args: [LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor, LOCAL_KERNEL_CONTRACTS.kernelFactory],
    }),
    salt: zeroHash,
});
