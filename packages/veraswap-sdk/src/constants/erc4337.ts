import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { encodeDeployData, zeroHash } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";

import { OpenPaymaster } from "../artifacts/OpenPaymaster.js";
import { SimpleAccountFactory } from "../artifacts/SimpleAccountFactory.js";

export const SIMPLE_ACCOUNT_FACTORY_ADDRESS = getDeployDeterministicAddress({
    bytecode: encodeDeployData({
        bytecode: SimpleAccountFactory.bytecode,
        abi: SimpleAccountFactory.abi,
        args: [entryPoint07Address],
    }),
    salt: zeroHash,
});

export const OPEN_PAYMASTER_ADDRESS = getDeployDeterministicAddress({
    bytecode: encodeDeployData({
        bytecode: OpenPaymaster.bytecode,
        abi: OpenPaymaster.abi,
        args: [entryPoint07Address],
    }),
    salt: zeroHash,
});
