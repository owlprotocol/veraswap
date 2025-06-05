import { getAnvilAccount } from "@veraswap/anvil-account";
import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { createConfig } from "@wagmi/core";
import {
    Account,
    Chain,
    createWalletClient,
    encodeDeployData,
    HDAccount,
    http,
    numberToHex,
    Transport,
    WalletClient,
    zeroAddress,
    zeroHash,
} from "viem";

import { KernelFactory } from "../artifacts/KernelFactory.js";
import { MockMailbox } from "../artifacts/MockMailbox.js";
import { OwnableSignatureExecutor } from "../artifacts/OwnableSignatureExecutor.js";
import { opChainA, opChainB, opChainL1, opChainL1Client } from "../chains/supersim.js";
import { getHypERC7579RouterAddress } from "../constants/hyperlane.js";
import { LOCAL_KERNEL_CONTRACTS } from "../constants/kernel.js";
import { createMockERC20ConnectedTokens } from "../constants/tokens.js";

export const anvilAccount: HDAccount = getAnvilAccount();
export const anvilClientL1: WalletClient<Transport, Chain, Account> = createWalletClient({
    account: anvilAccount,
    chain: opChainL1Client.chain,
    transport: http(),
});

export const wagmiConfig = createConfig({
    chains: [opChainL1, opChainA, opChainB] as readonly [Chain, ...Chain[]],
    transports: {
        [opChainL1.id]: http(),
        [opChainA.id]: http(),
        [opChainB.id]: http(),
    },
});

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
        erc7579Router: getHypERC7579RouterAddress({
            mailbox: getMockMailboxAddress({ chainId: opChainL1.id }),
            ism: zeroAddress,
            executor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            factory: LOCAL_KERNEL_CONTRACTS.kernelFactory,
        }),
    },
    [opChainA.id]: {
        mailbox: getMockMailboxAddress({ chainId: opChainA.id }),
        //Re-deploy with salt(901) to avoid collisions
        ownableSignatureExecutor: getDeployDeterministicAddress({
            bytecode: OwnableSignatureExecutor.bytecode,
            salt: numberToHex(901, { size: 32 }),
        }),
        //Re-deploy with salt(901) to avoid collisions
        kernelFactory: getDeployDeterministicAddress({
            bytecode: encodeDeployData({
                abi: KernelFactory.abi,
                bytecode: KernelFactory.bytecode,
                args: [LOCAL_KERNEL_CONTRACTS.kernel],
            }),
            salt: numberToHex(901, { size: 32 }),
        }),
        erc7579Router: getHypERC7579RouterAddress({
            mailbox: getMockMailboxAddress({ chainId: opChainA.id }),
            ism: zeroAddress,
            //Re-deploy with salt(901) to avoid collisions
            executor: getDeployDeterministicAddress({
                bytecode: OwnableSignatureExecutor.bytecode,
                salt: numberToHex(901, { size: 32 }),
            }),
            //Re-deploy with salt(901) to avoid collisions
            factory: getDeployDeterministicAddress({
                bytecode: encodeDeployData({
                    abi: KernelFactory.abi,
                    bytecode: KernelFactory.bytecode,
                    args: [LOCAL_KERNEL_CONTRACTS.kernel],
                }),
                salt: numberToHex(901, { size: 32 }),
            }),
        }),
    },
};

const localMailboxByChain = {
    [opChainL1.id]: MOCK_MAILBOX_CONTRACTS[opChainL1.id].mailbox,
    [opChainA.id]: MOCK_MAILBOX_CONTRACTS[opChainA.id].mailbox,
};

// Same MockERC20 tokens as in local development but connected to mock mailboxes
export const MOCK_MAILBOX_TOKENS = [
    ...createMockERC20ConnectedTokens(
        {
            chainId: opChainL1.id,
            name: "Token A",
            symbol: "A",
            decimals: 18,
        },
        localMailboxByChain,
    ),
    ...createMockERC20ConnectedTokens(
        {
            chainId: opChainL1.id,
            name: "Token B",
            symbol: "B",
            decimals: 18,
        },
        localMailboxByChain,
    ),
];
