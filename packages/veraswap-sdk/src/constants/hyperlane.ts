import { ChainMap, ChainMetadata } from "@hyperlane-xyz/sdk";
import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { Address, encodeAbiParameters, encodeDeployData, keccak256, zeroAddress, zeroHash } from "viem";
import {
    arbitrum,
    avalanche,
    base,
    baseSepolia,
    bsc,
    mainnet,
    optimism,
    optimismSepolia,
    polygon,
    sepolia,
    story,
} from "viem/chains";

import { ERC7579ExecutorRouter } from "../artifacts/ERC7579ExecutorRouter.js";
import { HypERC20 } from "../artifacts/HypERC20.js";
import { HypERC20Collateral } from "../artifacts/HypERC20Collateral.js";
import { HypTokenRouterSweep } from "../artifacts/index.js";
import { Mailbox } from "../artifacts/Mailbox.js";
import { MockInterchainGasPaymaster } from "../artifacts/MockInterchainGasPaymaster.js";
import { NoopIsm } from "../artifacts/NoopIsm.js";
import { PausableHook } from "../artifacts/PausableHook.js";
import {
    appchainTestnet,
    opChainA,
    opChainB,
    opChainL1,
    rariTestnet,
    superseed,
    unichainSepolia,
} from "../chains/index.js";
import { HyperlaneRegistry } from "../types/HyperlaneRegistry.js";

import { LOCAL_KERNEL_CONTRACTS } from "./kernel.js";

export function getMailboxAddress({ chainId }: { chainId: number }) {
    return getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            bytecode: Mailbox.bytecode,
            abi: Mailbox.abi,
            args: [chainId],
        }),
        salt: zeroHash,
    });
}

export function getMockInterchainGasPaymasterAddress() {
    return getDeployDeterministicAddress({
        bytecode: MockInterchainGasPaymaster.bytecode,
        salt: zeroHash,
    });
}

export function getHyperlaneContracts({ chainId }: { chainId: number }) {
    const mailbox = getMailboxAddress({ chainId });

    const noopISM = getDeployDeterministicAddress({
        bytecode: NoopIsm.bytecode,
        salt: zeroHash,
    });

    const pausableHook = getDeployDeterministicAddress({
        bytecode: PausableHook.bytecode,
        salt: zeroHash,
    });

    const mockInterchainGasPaymaster = getMockInterchainGasPaymasterAddress();

    return {
        mailbox,
        noopISM,
        pausableHook,
        mockInterchainGasPaymaster,
    };
}

export function getHypERC7579RouterAddress({
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
        erc7579Router: getHypERC7579RouterAddress({
            mailbox: hyperlaneCoreContracts[opChainL1.id].mailbox,
            ism: zeroAddress,
            executor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            factory: LOCAL_KERNEL_CONTRACTS.kernelFactory,
        }),
    },
    [opChainA.id]: {
        ...hyperlaneCoreContracts[opChainA.id],
        erc7579Router: getHypERC7579RouterAddress({
            mailbox: hyperlaneCoreContracts[opChainA.id].mailbox,
            ism: zeroAddress,
            executor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            factory: LOCAL_KERNEL_CONTRACTS.kernelFactory,
        }),
    },
    [opChainB.id]: {
        ...hyperlaneCoreContracts[opChainB.id],
        erc7579Router: getHypERC7579RouterAddress({
            mailbox: hyperlaneCoreContracts[opChainB.id].mailbox,
            ism: zeroAddress,
            executor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            factory: LOCAL_KERNEL_CONTRACTS.kernelFactory,
        }),
    },
};

/**
 * Custom contracts not included in Hyperlane Registry but using Hyperlane Protocol
 */
export const HYPERLANE_CONTRACTS: Record<
    number,
    | {
          //TODO: Add other required contracts that are not in HyperlaneRegistry
          erc7579Router: Address;
      }
    | undefined
> = {
    [opChainL1.id]: {
        erc7579Router: LOCAL_HYPERLANE_CONTRACTS[opChainL1.id].erc7579Router,
    },
    [opChainA.id]: {
        erc7579Router: LOCAL_HYPERLANE_CONTRACTS[opChainA.id].erc7579Router,
    },
    [opChainB.id]: {
        erc7579Router: LOCAL_HYPERLANE_CONTRACTS[opChainB.id].erc7579Router,
    },
    [sepolia.id]: {
        erc7579Router: "0x8b60582A3f557078801B00c38E14aBbbd24A5f19",
    },
    [optimismSepolia.id]: {
        erc7579Router: "0xC1715E53F36A8be099c7B5B494E13d031F85fAf8",
    },
    [unichainSepolia.id]: {
        erc7579Router: "0x4Cd864578182267C4Cb71f07c02e7B2Eb8587d7a",
    },
    [baseSepolia.id]: {
        erc7579Router: "0xC1715E53F36A8be099c7B5B494E13d031F85fAf8",
    },
    [arbitrum.id]: {
        erc7579Router: "0x6bC9c9c563ABD24FbB18eA9B6E9cF3a0A3A5c7ED",
    },
    [base.id]: {
        erc7579Router: "0x78a701c26EF86ca2a510DB77C6EcD54e0a1C7C46",
    },
    [bsc.id]: {
        erc7579Router: "0x52F32d2D1a6C7d870F19A2713Aa8A7B43b41a08e",
    },
    [optimism.id]: {
        erc7579Router: "0x8859E655D9B47fdfEb373D20b68Da2c0dB3D1fe1",
    },
    [superseed.id]: {
        erc7579Router: "0x4026C4831cE5418f7A21e38fB46780EFD6187057",
    },
    [mainnet.id]: {
        erc7579Router: "0xc0Ec5Aa2E27dA4cfa63267352d73920D15687076",
    },
    [story.id]: {
        erc7579Router: "0x4026C4831cE5418f7A21e38fB46780EFD6187057",
    },
    [avalanche.id]: {
        erc7579Router: "0x8f11674FABDe13Ec4530E9EECE08189DF305b005",
    },
    [polygon.id]: {
        erc7579Router: "0x2E2511B3e439017A952EA952c853B1Cdc672b63c",
    },
    [rariTestnet.id]: {
        erc7579Router: "0x371dbbB8EEB7f403653aAbab850fcC64CaD232D3",
    },
    [appchainTestnet.id]: {
        erc7579Router: "0xDde95bCc6fe477474e5f020638Cfb137bf17c1A6",
    },
};

/*** Hyperlane Tokens ***/

/***
 * Get HypERC20 Address as deployed by HypERC20Utils.sol
 */
export function getHypERC20Address({
    decimals,
    mailbox,
    totalSupply,
    name,
    symbol,
    msgSender,
}: {
    decimals: number;
    mailbox: Address;
    totalSupply: bigint;
    name: string;
    symbol: string;
    msgSender: Address;
}) {
    return getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            bytecode: HypERC20.bytecode,
            abi: HypERC20.abi,
            args: [decimals, mailbox],
        }),
        salt: keccak256(
            encodeAbiParameters(
                [{ type: "uint256" }, { type: "string" }, { type: "string" }, { type: "address" }],
                [totalSupply, name, symbol, msgSender],
            ),
        ),
    });
}

export function getHypERC20CollateralAddress({ erc20, mailbox }: { erc20: Address; mailbox: Address }) {
    return getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            bytecode: HypERC20Collateral.bytecode,
            abi: HypERC20Collateral.abi,
            args: [erc20, mailbox],
        }),
        salt: zeroHash,
    });
}

export const HYPERLANE_ROUTER_SWEEP_ADDRESS = getDeployDeterministicAddress({
    bytecode: HypTokenRouterSweep.bytecode,
    salt: zeroHash,
});

export const testHyperlaneRegistry: HyperlaneRegistry = {
    metadata: {
        "localhost-1337": {
            chainId: 1337,
            name: "localhost-1337",
        } as ChainMetadata,
        "localhost-1338": {
            chainId: 1338,
            name: "localhost-1338",
        } as ChainMetadata,
        "localhost-op": {
            chainId: 900,
            name: "localhost-op",
        } as ChainMetadata,
        "localhost-op-chain-a": {
            chainId: 901,
            name: "localhost-op-chain-a",
        } as ChainMetadata,
        "localhost-op-chain-b": {
            chainId: 902,
            name: "localhost-op-chain-b",
        } as ChainMetadata,
        "rari-testnet": {
            chainId: rariTestnet.id,
            name: "rari-testnet",
        } as ChainMetadata,
        "appchain-testnet": {
            chainId: appchainTestnet.id,
            name: "appchain-testnet",
        } as ChainMetadata,
    } as ChainMap<ChainMetadata>,
    addresses: {
        "localhost-1337": {
            mailbox: getMailboxAddress({ chainId: 1337 }),
        },
        "localhost-1338": {
            mailbox: getMailboxAddress({ chainId: 1338 }),
        },
        "localhost-op": {
            mailbox: getMailboxAddress({ chainId: 900 }),
        },
        "localhost-op-chain-a": {
            mailbox: getMailboxAddress({ chainId: 901 }),
        },
        "localhost-op-chain-b": {
            mailbox: getMailboxAddress({ chainId: 902 }),
        },
        "rari-testnet": {
            mailbox: "0xb0bb23B185A7Ba519426C038DEcAFaB4D0a9055b",
        },
        "appchain-testnet": {
            mailbox: "0x4C58973d0Eb3CeB8aBfd933A1C6EE6f8EA178064",
        },
    },
};
