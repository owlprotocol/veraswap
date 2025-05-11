import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { Address, encodeDeployData, zeroHash } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";

import { BalanceDeltaPaymaster } from "../artifacts/BalanceDeltaPaymaster.js";
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

export function getOpenPaymasterAddress(owner: Address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"): Address {
    return getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            bytecode: OpenPaymaster.bytecode,
            abi: OpenPaymaster.abi,
            args: [entryPoint07Address, owner],
        }),
        salt: zeroHash,
    });
}
export const OPEN_PAYMASTER_ADDRESS = getOpenPaymasterAddress();

export function getBalanceDeltaPaymasterAddress(
    ownerAddress: Address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
): Address {
    return getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            bytecode: BalanceDeltaPaymaster.bytecode,
            abi: BalanceDeltaPaymaster.abi,
            args: [entryPoint07Address, ownerAddress],
        }),
        salt: zeroHash,
    });
}
export const BALANCE_DELTA_PAYMASTER_ADDRESS = getBalanceDeltaPaymasterAddress();
