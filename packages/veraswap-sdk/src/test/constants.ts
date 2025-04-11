import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { encodeDeployData, zeroAddress, zeroHash } from "viem";
import { opChainA, opChainL1 } from "../chains/supersim.js";
import { MockMailbox } from "../artifacts/MockMailbox.js";
import { getHypERC7570RouterAddress } from "../constants/hyperlane.js";
import { LOCAL_KERNEL_CONTRACTS } from "../constants/kernel.js";
import { createMockERC20WarpRoute, getMockERC20Address } from "../constants/tokens.js";
import { HypERC20CollateralToken, HypERC20Token, TokenBase } from "../types/Token.js";

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

// Same MockERC20 tokens as in local development but we copy over data
// in case we change anything there that could break tests
export const mockMailboxMockERC20Tokens: TokenBase<"MockERC20">[] = [
    {
        standard: "MockERC20",
        chainId: opChainL1.id,
        address: getMockERC20Address({ name: "Token A", symbol: "A", decimals: 18 }),
        name: "Token A",
        symbol: "A",
        decimals: 18,
    },
    {
        standard: "MockERC20",
        chainId: opChainL1.id,
        address: getMockERC20Address({ name: "Token B", symbol: "B", decimals: 18 }),
        name: "Token B",
        symbol: "B",
        decimals: 18,
    },
];

export const MOCK_MAILBOX_TOKENS: (HypERC20CollateralToken | HypERC20Token)[] = [
    ...createMockERC20WarpRoute({
        token: mockMailboxMockERC20Tokens[0],
        mailboxByChain: {
            [opChainL1.id]: MOCK_MAILBOX_CONTRACTS[opChainL1.id].mailbox,
            [opChainA.id]: MOCK_MAILBOX_CONTRACTS[opChainA.id].mailbox,
        },
    }),
    ...createMockERC20WarpRoute({
        token: mockMailboxMockERC20Tokens[1],
        mailboxByChain: {
            [opChainL1.id]: MOCK_MAILBOX_CONTRACTS[opChainL1.id].mailbox,
            [opChainA.id]: MOCK_MAILBOX_CONTRACTS[opChainA.id].mailbox,
        },
    }),
];
