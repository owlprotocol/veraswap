import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { encodeDeployData, zeroAddress, zeroHash } from "viem";
import { opChainA, opChainL1 } from "../chains/supersim.js";
import { MockMailbox } from "../artifacts/MockMailbox.js";
import { getHypERC7570RouterAddress } from "../constants/hyperlane.js";
import { LOCAL_KERNEL_CONTRACTS } from "../constants/kernel.js";

export function getMockMailboxAddress({ chainId }: { chainId: number }) {
    return getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            bytecode: MockMailbox.bytecode,
            abi: MockMailbox.abi,
            args: [chainId],
        }),
        salt: zeroHash,
    });
}
/**
 * These contracts are ALL deployed on opChainL1 but "mock" Hyperlane message passing
 * across chains using the MockMailbox
 */
export const MOCK_MAILBOX_CONTRACTS = {
    [opChainL1.id]: {
        mailbox: getMockMailboxAddress({ chainId: opChainL1.id }),
        ownableSignatureExecutor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
        kernelFactory: LOCAL_KERNEL_CONTRACTS.kernelFactory,
        erc7579Router: getHypERC7570RouterAddress({
            mailbox: getMockMailboxAddress({ chainId: opChainL1.id }),
            ism: zeroAddress,
            executor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            factory: LOCAL_KERNEL_CONTRACTS.kernelFactory,
        }),
    },
    [opChainA.id]: {
        mailbox: getMockMailboxAddress({ chainId: opChainA.id }),
        //TODO: Re-deploy with salt(1)
        ownableSignatureExecutor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
        kernelFactory: LOCAL_KERNEL_CONTRACTS.kernelFactory,
        erc7579Router: getHypERC7570RouterAddress({
            mailbox: getMockMailboxAddress({ chainId: opChainA.id }),
            ism: zeroAddress,
            //TODO: Re-deploy with salt(1)
            executor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            factory: LOCAL_KERNEL_CONTRACTS.kernelFactory,
        }),
    },
};
