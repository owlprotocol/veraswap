import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { Address, encodeDeployData, zeroHash } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";

import { BalanceDeltaPaymaster } from "../artifacts/BalanceDeltaPaymaster.js";
import { OpenPaymaster } from "../artifacts/OpenPaymaster.js";
import { SimpleAccountFactory } from "../artifacts/SimpleAccountFactory.js";
import { base, opChainA, opChainB, opChainL1 } from "../chains/index.js";

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

const mainnetOwner = "0xAAb6f44B46f19d061582727B66C9a0c84C97a2F6";

export const ERC4337_CONTRACTS: Record<
    number,
    | {
        simpleAccountFactory: Address;
        openPaymaster: Address;
        balanceDeltaPaymaster: Address;
    }
    | undefined
> = {
    [opChainL1.id]: {
        simpleAccountFactory: SIMPLE_ACCOUNT_FACTORY_ADDRESS,
        openPaymaster: getOpenPaymasterAddress(),
        balanceDeltaPaymaster: getBalanceDeltaPaymasterAddress(),
    },
    [opChainA.id]: {
        simpleAccountFactory: SIMPLE_ACCOUNT_FACTORY_ADDRESS,
        openPaymaster: getOpenPaymasterAddress(),
        balanceDeltaPaymaster: getBalanceDeltaPaymasterAddress(),
    },
    [opChainB.id]: {
        simpleAccountFactory: SIMPLE_ACCOUNT_FACTORY_ADDRESS,
        openPaymaster: getOpenPaymasterAddress(),
        balanceDeltaPaymaster: getBalanceDeltaPaymasterAddress(),
    },
    [base.id]: {
        simpleAccountFactory: SIMPLE_ACCOUNT_FACTORY_ADDRESS,
        openPaymaster: getOpenPaymasterAddress(mainnetOwner),
        balanceDeltaPaymaster: getBalanceDeltaPaymasterAddress(mainnetOwner),
    },
};
