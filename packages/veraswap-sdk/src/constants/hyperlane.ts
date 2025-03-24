import { Address, encodeDeployData, zeroAddress, zeroHash } from "viem";
import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { Mailbox } from "../artifacts/Mailbox.js";
import { PausableHook } from "../artifacts/PausableHook.js";
import { NoopIsm } from "../artifacts/NoopIsm.js";
import { opChainA, opChainB, opChainL1 } from "./chains.js";
import { ERC7579ExecutorRouter } from "../artifacts/ERC7579ExecutorRouter.js";
import { LOCAL_KERNEL_CONTRACTS } from "./kernel.js";

export function getHyperlaneContracts({ chainId }: { chainId: number }) {
    const mailbox = getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            bytecode: Mailbox.bytecode,
            abi: Mailbox.abi,
            args: [chainId],
        }),
        salt: zeroHash,
    });

    const noopISM = getDeployDeterministicAddress({
        bytecode: NoopIsm.bytecode,
        salt: zeroHash,
    });

    const pausableHook = getDeployDeterministicAddress({
        bytecode: PausableHook.bytecode,
        salt: zeroHash,
    });

    return {
        mailbox,
        noopISM,
        pausableHook,
    };
}

export function getHypERC7570RouterAddress({
    mailbox,
    ism,
    executor,
    factory,
}: {
    mailbox: Address;
    ism: Address;
    executor: Address;
    factory: Address;
}) {
    return getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            bytecode: ERC7579ExecutorRouter.bytecode,
            abi: ERC7579ExecutorRouter.abi,
            args: [mailbox, ism, executor, factory],
        }),
        salt: zeroHash,
    });
}

const hyperlaneCoreContracts = {
    [opChainL1.id]: getHyperlaneContracts({ chainId: opChainL1.id }),
    [opChainA.id]: getHyperlaneContracts({ chainId: opChainA.id }),
    [opChainB.id]: getHyperlaneContracts({ chainId: opChainB.id }),
};

export const LOCAL_HYPERLANE_CONTRACTS = {
    [opChainL1.id]: {
        ...hyperlaneCoreContracts[opChainL1.id],
        erc7579Router: getHypERC7570RouterAddress({
            mailbox: hyperlaneCoreContracts[opChainL1.id].mailbox,
            ism: zeroAddress,
            executor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            factory: LOCAL_KERNEL_CONTRACTS.kernelFactory,
        }),
    },
    [opChainA.id]: {
        ...hyperlaneCoreContracts[opChainL1.id],
        erc7579Router: getHypERC7570RouterAddress({
            mailbox: hyperlaneCoreContracts[opChainA.id].mailbox,
            ism: zeroAddress,
            executor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            factory: LOCAL_KERNEL_CONTRACTS.kernelFactory,
        }),
    },
    [opChainB.id]: {
        ...hyperlaneCoreContracts[opChainL1.id],
        erc7579Router: getHypERC7570RouterAddress({
            mailbox: hyperlaneCoreContracts[opChainB.id].mailbox,
            ism: zeroAddress,
            executor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            factory: LOCAL_KERNEL_CONTRACTS.kernelFactory,
        }),
    },
};
